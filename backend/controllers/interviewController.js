
import mongoose from "mongoose";
import InterviewBatch from "../models/InterviewBatch.js";
import InterviewSlot from "../models/InterviewSlot.js";
import Drive from "../models/Drive.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

function getUserId(user) {
  return user?._id || user?.id;
}

async function getAuthorizedDrive(driveId, user) {
  if (!mongoose.isValidObjectId(driveId)) {
    const error = new Error("Invalid placement drive ID.");
    error.statusCode = 400;
    throw error;
  }

  const drive = await Drive.findById(driveId);

  if (!drive) {
    const error = new Error("Placement drive not found.");
    error.statusCode = 404;
    throw error;
  }

  if (
    user.role === "RECRUITER" &&
    String(drive.recruiter) !== String(getUserId(user))
  ) {
    const error = new Error("You cannot manage another recruiter's drive.");
    error.statusCode = 403;
    throw error;
  }

  return drive;
}

// POST /api/interviews/drives/:driveId/batches
export async function createInterviewBatch(req, res) {
  let batch;

  try {
    const drive = await getAuthorizedDrive(req.params.driveId, req.user);

    const {
      roundName,
      mode,
      location = "",
      meetingLink = "",
      startsAt,
      endsAt,
      slotMinutes,
    } = req.body;

    if (
      !roundName?.trim() ||
      !["ONLINE", "OFFLINE"].includes(mode) ||
      !startsAt ||
      !endsAt ||
      !Number.isInteger(Number(slotMinutes)) ||
      Number(slotMinutes) < 5 ||
      Number(slotMinutes) > 240
    ) {
      return res.status(400).json({
        message: "Provide a round name, valid mode, start/end times, and slot duration.",
      });
    }

    if (
      (mode === "ONLINE" && !meetingLink.trim()) ||
      (mode === "OFFLINE" && !location.trim())
    ) {
      return res.status(400).json({
        message:
          "Online interviews require a meeting link; offline interviews require a location.",
      });
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const duration = Number(slotMinutes) * 60 * 1000;

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date() ||
      end <= start
    ) {
      return res.status(400).json({
        message: "Choose a future start time and an end time after it.",
      });
    }

    const availableSlots = Math.floor((end - start) / duration);

    if (availableSlots < 1) {
      return res.status(400).json({
        message: "The interview window is too short for one slot.",
      });
    }

    // Only shortlisted candidates can receive interview slots.
    const shortlisted = await Application.find({
      drive: drive._id,
      eligibilityStatus: "ELIGIBLE",
      applicationStatus: "SHORTLISTED",
    })
      .select("student")
      .sort({ createdAt: 1 })
      .lean();

    if (!shortlisted.length) {
      return res.status(400).json({
        message: "No shortlisted candidates are available for this drive.",
      });
    }

    if (shortlisted.length > availableSlots) {
      return res.status(400).json({
        message: `You need ${shortlisted.length} slots, but this time window only fits ${availableSlots}. Increase the time window or reduce the slot duration.`,
      });
    }

    const studentIds = shortlisted.map((item) => item.student);

    // Check if any selected candidate already has an overlapping interview.
    const conflicting = await InterviewSlot.find({
      student: { $in: studentIds },
      status: "SCHEDULED",
      startsAt: { $lt: end },
      endsAt: { $gt: start },
    })
      .select("student")
      .lean();

    if (conflicting.length) {
      const conflictingIds = new Set(
        conflicting.map((item) => String(item.student))
      );

      const availableCandidates = shortlisted.filter(
        (item) => !conflictingIds.has(String(item.student))
      );

      if (availableCandidates.length < shortlisted.length) {
        return res.status(409).json({
          message:
            "Some shortlisted candidates already have interviews during this time. Resolve those conflicts or schedule a different time window.",
          conflictingStudentIds: [...conflictingIds],
        });
      }
    }

    batch = await InterviewBatch.create({
      drive: drive._id,
      recruiter: drive.recruiter,
      createdBy: getUserId(req.user),
      roundName: roundName.trim(),
      mode,
      location: mode === "OFFLINE" ? location.trim() : "",
      meetingLink: mode === "ONLINE" ? meetingLink.trim() : "",
      startsAt: start,
      endsAt: end,
      slotMinutes: Number(slotMinutes),
      candidateCount: shortlisted.length,
    });

    const slotDocuments = shortlisted.map((application, index) => {
      const slotStart = new Date(start.getTime() + index * duration);

      return {
        batch: batch._id,
        drive: drive._id,
        recruiter: drive.recruiter,
        student: application.student,
        roundName: roundName.trim(),
        startsAt: slotStart,
        endsAt: new Date(slotStart.getTime() + duration),
      };
    });

    try {
      await InterviewSlot.insertMany(slotDocuments, { ordered: true });

      await Application.updateMany(
        {
          drive: drive._id,
          student: { $in: studentIds },
          eligibilityStatus: "ELIGIBLE",
          applicationStatus: "SHORTLISTED",
        },
        { $set: { applicationStatus: "INTERVIEW_SCHEDULED" } }
      );
    } catch (error) {
      await InterviewSlot.deleteMany({ batch: batch._id });
      await InterviewBatch.findByIdAndDelete(batch._id);
      throw error;
    }

    return res.status(201).json({
      message: "Interview batch created successfully.",
      batch,
      scheduledCount: slotDocuments.length,
    });
  } catch (error) {
    console.error("Create interview batch error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to schedule interviews.",
    });
  }
}

// GET /api/interviews/drives/:driveId
export async function getDriveInterviews(req, res) {
  try {
    await getAuthorizedDrive(req.params.driveId, req.user);

    const batches = await InterviewBatch.find({
      drive: req.params.driveId,
    })
      .sort({ startsAt: -1 })
      .lean();

    const slots = await InterviewSlot.find({
      drive: req.params.driveId,
    })
      .populate("student", "name email")
      .populate("batch", "roundName mode location meetingLink status")
      .sort({ startsAt: 1 })
      .lean();

    return res.json({ batches, slots });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to load interview schedules.",
    });
  }
}

// GET /api/interviews/me
export async function getMyInterviews(req, res) {
  try {
    const slots = await InterviewSlot.find({
      student: getUserId(req.user),
    })
      .populate("drive", "title")
      .populate("batch", "mode location meetingLink status")
      .sort({ startsAt: 1 })
      .lean();

    return res.json({ slots });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load your interview schedule.",
    });
  }
}

// PATCH /api/interviews/slots/:slotId/status
export async function updateInterviewStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["COMPLETED", "CANCELLED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be COMPLETED or CANCELLED.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.slotId)) {
      return res.status(400).json({ message: "Invalid interview slot ID." });
    }

    const slot = await InterviewSlot.findById(req.params.slotId);

    if (!slot) {
      return res.status(404).json({ message: "Interview slot not found." });
    }

    const drive = await Drive.findById(slot.drive);

    if (!drive) {
      return res.status(404).json({ message: "Placement drive not found." });
    }

    if (
      req.user.role === "RECRUITER" &&
      String(drive.recruiter) !== String(getUserId(req.user))
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    slot.status = status;
    await slot.save();

    if (status === "CANCELLED") {
      await Application.updateOne(
        {
          drive: slot.drive,
          student: slot.student,
          applicationStatus: "INTERVIEW_SCHEDULED",
        },
        { $set: { applicationStatus: "SHORTLISTED" } }
      );
    }

    return res.json({
      message: `Interview marked ${status.toLowerCase()}.`,
      slot,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update interview status.",
    });
  }
}
