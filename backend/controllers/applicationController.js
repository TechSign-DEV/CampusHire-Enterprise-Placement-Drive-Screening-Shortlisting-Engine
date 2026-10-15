
import mongoose from "mongoose";

import Drive from "../models/Drive.js";
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import Application from "../models/Application.js";

import { screenDrive } from "../services/screeningService.js";
import { sendShortlistEmail } from "../services/emailService.js";

async function getAuthorizedDrive(driveId, user) {
  if (!mongoose.isValidObjectId(driveId)) {
    return {
      error: "Invalid placement drive ID",
      status: 400,
    };
  }

  const filter = { _id: driveId };

  if (user.role === "RECRUITER") {
    filter.recruiter = user._id;
  }

  const drive = await Drive.findOne(filter);

  if (!drive) {
    return {
      error: "Placement drive not found or access denied",
      status: 404,
    };
  }

  return { drive };
}

// Run eligibility screening for a placement drive.
export const runDriveScreening = async (req, res) => {
  try {
    const result = await getAuthorizedDrive(
      req.params.driveId,
      req.user
    );

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      });
    }

    const summary = await screenDrive(result.drive._id);

    return res.json({
      message: "Eligibility screening completed",
      summary,
    });
  } catch (error) {
    console.error("Screening error:", error.message);

    return res.status(error.status || 500).json({
      message: error.status
        ? error.message
        : "Screening failed",
    });
  }
};

// Save or update a student's coding assessment.
export const recordAssessment = async (req, res) => {
  try {
    const result = await getAuthorizedDrive(
      req.params.driveId,
      req.user
    );

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      });
    }

    const { studentId, score } = req.body;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        message: "A valid student ID is required",
      });
    }

    if (
      typeof score !== "number" ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100
    ) {
      return res.status(400).json({
        message: "Score must be a number between 0 and 100",
      });
    }

    const studentExists = await User.exists({
      _id: studentId,
      role: "STUDENT",
    });

    if (!studentExists) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    const assessment = await Assessment.findOneAndUpdate(
      {
        student: studentId,
        drive: result.drive._id,
      },
      {
        $set: {
          score,
          evaluatedBy: req.user._id,
          evaluatedAt: new Date(),
        },
        $setOnInsert: {
          student: studentId,
          drive: result.drive._id,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const summary = await screenDrive(result.drive._id);

    return res.json({
      message: "Coding assessment saved and screening refreshed",
      assessment,
      summary,
    });
  } catch (error) {
    console.error("Assessment error:", error.message);

    return res.status(500).json({
      message: "Failed to save coding assessment",
    });
  }
};

// Get screening results for a placement drive.
export const getDriveResults = async (req, res) => {
  try {
    const result = await getAuthorizedDrive(
      req.params.driveId,
      req.user
    );

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      });
    }

    const applications = await Application.find({
      drive: result.drive._id,
    })
      .populate("student", "name email studentId")
      .sort({ eligibilityStatus: 1, createdAt: 1 })
      .lean();

    return res.json({
      drive: result.drive,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Screening results error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch screening results",
    });
  }
};

// Allow an eligible student to apply for an open placement drive.
export const applyToDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.driveId);

    if (!drive) {
      return res.status(404).json({
        message: "Placement drive not found",
      });
    }

    if (
      drive.status !== "OPEN" ||
      drive.applicationDeadline <= new Date()
    ) {
      return res.status(400).json({
        message: "This placement drive is not accepting applications",
      });
    }

    const application = await Application.findOne({
      student: req.user._id,
      drive: drive._id,
    });

    if (!application) {
      return res.status(409).json({
        message: "Eligibility screening must be completed first",
      });
    }

    if (application.eligibilityStatus !== "ELIGIBLE") {
      return res.status(400).json({
        message: "You are not currently eligible to apply",
        reasons: application.reasons,
      });
    }

    if (application.applicationStatus !== "NOT_APPLIED") {
      return res.status(409).json({
        message:
          "You have already applied or your application has been processed",
      });
    }

    application.applicationStatus = "APPLIED";
    application.appliedAt = new Date();

    await application.save();

    return res.status(200).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Application submission error:", error.message);

    return res.status(500).json({
      message: "Failed to submit application",
    });
  }
};

// Get the logged-in student's applications.
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user._id,
    })
      .populate({
        path: "drive",
        populate: {
          path: "company",
          select: "name industry location",
        },
      })
      .sort({ updatedAt: -1 });

    return res.json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("My applications error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch your applications",
    });
  }
};

// Shortlist eligible applicants and send email notifications.
export const shortlistApplicants = async (req, res) => {
  try {
    const result = await getAuthorizedDrive(
      req.params.driveId,
      req.user
    );

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      });
    }

    // Find only applicants who have applied and are eligible.
    const applications = await Application.find({
      drive: result.drive._id,
      eligibilityStatus: "ELIGIBLE",
      applicationStatus: "APPLIED",
    })
      .select("_id student")
      .populate("student", "name email")
      .lean();

    if (applications.length === 0) {
      return res.json({
        message: "No eligible applied candidates are available to shortlist",
        shortlistedCount: 0,
        emailsSent: 0,
      });
    }

    const applicationIds = applications.map(
      (application) => application._id
    );

    // Update only applications that are still APPLIED.
    const update = await Application.updateMany(
      {
        _id: { $in: applicationIds },
        applicationStatus: "APPLIED",
        eligibilityStatus: "ELIGIBLE",
      },
      {
        $set: {
          applicationStatus: "SHORTLISTED",
        },
      }
    );

    // Notify candidates only after the database update succeeds.
    const emailResults = await Promise.allSettled(
      applications
        .filter((application) => application.student?.email)
        .map((application) =>
          sendShortlistEmail({
            to: application.student.email,
            studentName: application.student.name,
            driveTitle: result.drive.title,
          })
        )
    );

    const emailsSent = emailResults.filter(
      (emailResult) =>
        emailResult.status === "fulfilled" &&
        emailResult.value?.sent === true
    ).length;

    const emailAttempts = emailResults.length;

    return res.json({
      message: "Eligible applicants shortlisted successfully",
      shortlistedCount: update.modifiedCount,
      emailsSent,
      emailAttempts,
      emailNote: process.env.SMTP_HOST
        ? "Email delivery was attempted for shortlisted candidates."
        : "SMTP is not configured; no emails were sent.",
    });
  } catch (error) {
    console.error("Shortlisting error:", error.message);

    return res.status(500).json({
      message: "Failed to shortlist applicants",
    });
  }
};
