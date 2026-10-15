
import User from "../models/User.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import Drive from "../models/Drive.js";
import Application from "../models/Application.js";
import InterviewSlot from "../models/InterviewSlot.js";

export const getAnalytics = async (req, res) => {
  try {
    const isRecruiter = req.user.role === "RECRUITER";

    const driveFilter = isRecruiter
      ? { recruiter: req.user._id }
      : {};

    const drives = await Drive.find(driveFilter)
      .select("_id title status")
      .lean();

    const driveIds = drives.map((drive) => drive._id);

    const applicationFilter = isRecruiter
      ? { drive: { $in: driveIds } }
      : {};

    const interviewFilter = isRecruiter
      ? { drive: { $in: driveIds } }
      : {};

    const [
      totalStudents,
      totalCompanies,
      totalDrives,
      openDrives,
      totalApplications,
      eligibleApplications,
      shortlistedApplications,
      interviewScheduledApplications,
      totalInterviews,
      completedInterviews,
      applicationStats,
    ] = await Promise.all([
      User.countDocuments({ role: "STUDENT" }),

      isRecruiter
        ? Company.countDocuments({ recruiter: req.user._id })
        : Company.countDocuments(),

      drives.length,

      drives.filter((drive) => drive.status === "OPEN").length,

      Application.countDocuments(applicationFilter),

      Application.countDocuments({
        ...applicationFilter,
        eligibilityStatus: "ELIGIBLE",
      }),

      Application.countDocuments({
        ...applicationFilter,
        applicationStatus: "SHORTLISTED",
      }),

      Application.countDocuments({
        ...applicationFilter,
        applicationStatus: "INTERVIEW_SCHEDULED",
      }),

      InterviewSlot.countDocuments({
        ...interviewFilter,
        status: "SCHEDULED",
      }),

      InterviewSlot.countDocuments({
        ...interviewFilter,
        status: "COMPLETED",
      }),

      Application.aggregate([
        { $match: applicationFilter },
        {
          $group: {
            _id: "$applicationStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = {
      NOT_APPLIED: 0,
      APPLIED: 0,
      SHORTLISTED: 0,
      REJECTED: 0,
      INTERVIEW_SCHEDULED: 0,
    };

    for (const item of applicationStats) {
      statusCounts[item._id] = item.count;
    }

    return res.json({
      overview: {
        totalStudents,
        totalCompanies,
        totalDrives,
        openDrives,
        totalApplications,
        eligibleApplications,
        shortlistedApplications,
        interviewScheduledApplications,
        totalInterviews,
        completedInterviews,
      },
      applicationStats: statusCounts,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      message: "Failed to load analytics",
    });
  }
};
