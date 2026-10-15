
import Drive from "../models/Drive.js";
import Student from "../models/Student.js";
import Application from "../models/Application.js";
import InterviewSlot from "../models/InterviewSlot.js";

function escapeCsv(value) {
  let text = value == null ? "" : String(value);

  // Prevent spreadsheet formula injection in exported text.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function sendCsv(res, filename, headers, rows) {
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader("Cache-Control", "no-store");

  // UTF-8 BOM improves compatibility with Excel.
  return res.status(200).send("\uFEFF" + csv);
}

async function getDriveFilter(user) {
  if (user.role === "RECRUITER") {
    const drives = await Drive.find({ recruiter: user._id })
      .select("_id")
      .lean();

    return { drive: { $in: drives.map((drive) => drive._id) } };
  }

  return {};
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

// GET /api/reports/applications
export async function exportApplications(req, res) {
  try {
    const filter = await getDriveFilter(req.user);

    const applications = await Application.find(filter)
      .populate("student", "name email")
      .populate({
        path: "drive",
        select: "title status company",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .limit(50000)
      .lean();

    const rows = applications.map((application) => [
      application.student?.name,
      application.student?.email,
      application.drive?.title,
      application.drive?.company?.name,
      application.eligibilityStatus,
      (application.reasons || []).join("; "),
      application.codingScore,
      application.applicationStatus,
      formatDate(application.appliedAt),
      formatDate(application.createdAt),
    ]);

    return sendCsv(
      res,
      "campushire-applications.csv",
      [
        "Student Name",
        "Student Email",
        "Placement Drive",
        "Company",
        "Eligibility Status",
        "Eligibility Reasons",
        "Coding Score",
        "Application Status",
        "Applied At",
        "Record Created At",
      ],
      rows
    );
  } catch (error) {
    console.error("Applications export error:", error);

    return res.status(500).json({
      message: "Failed to export applications report.",
    });
  }
}

// GET /api/reports/screening
export async function exportScreening(req, res) {
  try {
    const filter = await getDriveFilter(req.user);

    const applications = await Application.find(filter)
      .populate("student", "name email")
      .populate("drive", "title")
      .sort({ createdAt: -1 })
      .limit(50000)
      .lean();

    const studentIds = [
      ...new Set(
        applications
          .map((application) => application.student?._id?.toString())
          .filter(Boolean)
      ),
    ];

    const profiles = await Student.find({
      user: { $in: studentIds },
    })
      .select(
        "user department graduationYear tenthPercentage twelfthPercentage cgpa activeBacklogs totalBacklogs skills"
      )
      .lean();

    const profileByUser = new Map(
      profiles.map((profile) => [
        String(profile.user),
        profile,
      ])
    );

    const rows = applications.map((application) => {
      const profile = profileByUser.get(
        String(application.student?._id)
      );

      return [
        application.student?.name,
        application.student?.email,
        application.drive?.title,
        profile?.department,
        profile?.graduationYear,
        profile?.tenthPercentage,
        profile?.twelfthPercentage,
        profile?.cgpa,
        profile?.activeBacklogs,
        profile?.totalBacklogs,
        application.codingScore,
        application.eligibilityStatus,
        (application.reasons || []).join("; "),
        application.applicationStatus,
      ];
    });

    return sendCsv(
      res,
      "campushire-screening-report.csv",
      [
        "Student Name",
        "Student Email",
        "Placement Drive",
        "Department",
        "Graduation Year",
        "10th Percentage",
        "12th Percentage",
        "CGPA",
        "Active Backlogs",
        "Total Backlogs",
        "Coding Score",
        "Eligibility Status",
        "Eligibility Reasons",
        "Application Status",
      ],
      rows
    );
  } catch (error) {
    console.error("Screening export error:", error);

    return res.status(500).json({
      message: "Failed to export screening report.",
    });
  }
}

// GET /api/reports/interviews
export async function exportInterviews(req, res) {
  try {
    const filter = await getDriveFilter(req.user);

    const slots = await InterviewSlot.find(filter)
      .populate("student", "name email")
      .populate("drive", "title")
      .populate("batch", "mode location meetingLink status")
      .sort({ startsAt: 1 })
      .limit(50000)
      .lean();

    const rows = slots.map((slot) => [
      slot.student?.name,
      slot.student?.email,
      slot.drive?.title,
      slot.roundName,
      formatDate(slot.startsAt),
      formatDate(slot.endsAt),
      slot.batch?.mode,
      slot.batch?.mode === "ONLINE"
        ? slot.batch?.meetingLink
        : slot.batch?.location,
      slot.status,
      slot.batch?.status,
    ]);

    return sendCsv(
      res,
      "campushire-interview-report.csv",
      [
        "Student Name",
        "Student Email",
        "Placement Drive",
        "Interview Round",
        "Start Time (UTC)",
        "End Time (UTC)",
        "Interview Mode",
        "Meeting Link or Location",
        "Slot Status",
        "Batch Status",
      ],
      rows
    );
  } catch (error) {
    console.error("Interview export error:", error);

    return res.status(500).json({
      message: "Failed to export interview report.",
    });
  }
}
