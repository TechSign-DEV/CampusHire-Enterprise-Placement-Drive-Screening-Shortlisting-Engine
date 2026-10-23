
import User from "../models/User.js";
import Student from "../models/Student.js";
import Application from "../models/Application.js";
import Drive from "../models/Drive.js";

export async function screenDrive(driveId) {
  const drive = await Drive.findById(driveId).lean();

  if (!drive) {
    const error = new Error("Placement drive not found");
    error.status = 404;
    throw error;
  }

  const students = await User.find({ role: "STUDENT" })
    .select("_id")
    .lean();

  if (students.length === 0) {
    return {
      driveId,
      totalStudents: 0,
      eligible: 0,
      notEligible: 0,
      pending: 0,
    };
  }

  const studentIds = students.map((student) => student._id);

  const profiles = await Student.find({
    user: { $in: studentIds },
  }).lean();

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.user.toString(),
      profile,
    ])
  );

  const c = drive.criteria;
  const now = new Date();

  const operations = students.map((student) => {
    const id = student._id.toString();
    const profile = profileMap.get(id);

    const reasons = [];
    let eligibilityStatus = "ELIGIBLE";

    if (!profile) {
      eligibilityStatus = "PENDING";
      reasons.push("Academic profile is incomplete");
    } else {
      if (
        profile.tenthPercentage == null ||
        profile.twelfthPercentage == null ||
        profile.cgpa == null ||
        profile.activeBacklogs == null ||
        profile.graduationYear == null ||
        !profile.department
      ) {
        eligibilityStatus = "PENDING";
        reasons.push("Academic profile is incomplete");
      } else {
        if (profile.tenthPercentage < (c.tenthPercentage ?? 0)) {
          reasons.push(
            `10th percentage is below ${c.tenthPercentage ?? 0}%`
          );
        }

        if (profile.twelfthPercentage < (c.twelfthPercentage ?? 0)) {
          reasons.push(
            `12th percentage is below ${c.twelfthPercentage ?? 0}%`
          );
        }

        if (profile.cgpa < (c.cgpa ?? 0)) {
          reasons.push(`CGPA is below ${c.cgpa ?? 0}`);
        }

        if (
          profile.activeBacklogs >
          (c.maxActiveBacklogs ?? 0)
        ) {
          reasons.push(
            `Active backlogs exceed ${c.maxActiveBacklogs ?? 0}`
          );
        }

        if (profile.graduationYear !== c.graduationYear) {
          reasons.push(
            `Graduation year must be ${c.graduationYear}`
          );
        }

        if (
          drive.eligibleDepartments?.length > 0 &&
          !drive.eligibleDepartments.includes(profile.department)
        ) {
          reasons.push(
            "Department is not eligible for this drive"
          );
        }
      }
    }

    if (reasons.some((reason) =>
      reason !== "Academic profile is incomplete"
    )) {
      eligibilityStatus = "NOT_ELIGIBLE";
    } else if (reasons.length > 0) {
      eligibilityStatus = "PENDING";
    } else {
      eligibilityStatus = "ELIGIBLE";
    }

    return {
      updateOne: {
        filter: {
          student: student._id,
          drive: drive._id,
        },
        update: {
          $set: {
            eligibilityStatus,
            reasons,
            screenedAt: now,
          },
          $setOnInsert: {
            student: student._id,
            drive: drive._id,
            applicationStatus: "NOT_APPLIED",
            appliedAt: null,
          },
        },
        upsert: true,
      },
    };
  });

  await Application.bulkWrite(operations, {
    ordered: false,
  });

  const results = await Application.aggregate([
    { $match: { drive: drive._id } },
    {
      $group: {
        _id: "$eligibilityStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    ELIGIBLE: 0,
    NOT_ELIGIBLE: 0,
    PENDING: 0,
  };

  for (const result of results) {
    counts[result._id] = result.count;
  }

  return {
    driveId: drive._id,
    totalStudents: students.length,
    eligible: counts.ELIGIBLE,
    notEligible: counts.NOT_ELIGIBLE,
    pending: counts.PENDING,
  };
}
