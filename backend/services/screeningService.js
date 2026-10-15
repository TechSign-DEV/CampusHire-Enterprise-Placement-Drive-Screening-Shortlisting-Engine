
import User from "../models/User.js";
import Student from "../models/Student.js";
import Assessment from "../models/Assessment.js";
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
      pending: 0
    };
  }

  const studentIds = students.map(student => student._id);

  const [profiles, assessments] = await Promise.all([
    Student.find({ user: { $in: studentIds } }).lean(),

    Assessment.find({
      drive: drive._id,
      student: { $in: studentIds }
    }).lean()
  ]);

  const profileMap = new Map(
    profiles.map(profile => [profile.user.toString(), profile])
  );

  const assessmentMap = new Map(
    assessments.map(assessment => [
      assessment.student.toString(),
      assessment
    ])
  );

  const c = drive.criteria;
  const now = new Date();

  const operations = students.map(student => {
    const id = student._id.toString();
    const profile = profileMap.get(id);
    const assessment = assessmentMap.get(id);

    const reasons = [];
    let eligibilityStatus = "ELIGIBLE";

    if (!profile) {
      eligibilityStatus = "PENDING";
      reasons.push("Academic profile is incomplete");
    } else {
      if (profile.tenthPercentage < c.tenthPercentage) {
        reasons.push(
          `10th percentage is below ${c.tenthPercentage}%`
        );
      }

      if (profile.twelfthPercentage < c.twelfthPercentage) {
        reasons.push(
          `12th percentage is below ${c.twelfthPercentage}%`
        );
      }

      if (profile.cgpa < c.cgpa) {
        reasons.push(`CGPA is below ${c.cgpa}`);
      }

      if (profile.activeBacklogs > c.maxActiveBacklogs) {
        reasons.push(
          `Active backlogs exceed ${c.maxActiveBacklogs}`
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
        reasons.push("Department is not eligible for this drive");
      }
    }

    const minCodingScore = c.minCodingScore ?? 0;
    const codingScore = assessment?.score ?? null;

    if (minCodingScore > 0 && codingScore === null) {
      eligibilityStatus = "PENDING";
      reasons.push("Coding assessment is not completed");
    } else if (
      codingScore !== null &&
      codingScore < minCodingScore
    ) {
      reasons.push(
        `Coding score is below ${minCodingScore}`
      );
    }

    if (reasons.some(reason =>
      reason !== "Academic profile is incomplete" &&
      reason !== "Coding assessment is not completed"
    )) {
      eligibilityStatus = "NOT_ELIGIBLE";
    }

    return {
      updateOne: {
        filter: {
          student: student._id,
          drive: drive._id
        },
        update: {
          $set: {
            eligibilityStatus,
            reasons,
            codingScore,
            screenedAt: now
          },
          $setOnInsert: {
            student: student._id,
            drive: drive._id,
            applicationStatus: "NOT_APPLIED",
            appliedAt: null
          }
        },
        upsert: true
      }
    };
  });

  await Application.bulkWrite(operations, { ordered: false });

  const results = await Application.aggregate([
    { $match: { drive: drive._id } },
    {
      $group: {
        _id: "$eligibilityStatus",
        count: { $sum: 1 }
      }
    }
  ]);

  const counts = {
    ELIGIBLE: 0,
    NOT_ELIGIBLE: 0,
    PENDING: 0
  };

  for (const result of results) {
    counts[result._id] = result.count;
  }

  return {
    driveId: drive._id,
    totalStudents: students.length,
    eligible: counts.ELIGIBLE,
    notEligible: counts.NOT_ELIGIBLE,
    pending: counts.PENDING
  };
}
