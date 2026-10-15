
import User from "../models/User.js";
import Student from "../models/Student.js";

const academicFields = [
  "department",
  "graduationYear",
  "tenthPercentage",
  "twelfthPercentage",
  "cgpa",
  "activeBacklogs",
  "totalBacklogs",
  "skills"
];

export const getMyProfile = async (req, res) => {
  try {
    const profile = await Student.findOne({
      user: req.user._id
    }).populate("user", "name email studentId");

    return res.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch student profile"
    });
  }
};

export const saveMyProfile = async (req, res) => {
  try {
    const updates = {};

    for (const field of academicFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide academic profile fields to save"
      });
    }

    if (updates.department !== undefined) {
      if (
        typeof updates.department !== "string" ||
        !updates.department.trim()
      ) {
        return res.status(400).json({
          message: "Valid department is required"
        });
      }

      updates.department = updates.department.trim();
    }

    if (updates.skills !== undefined) {
      if (
        !Array.isArray(updates.skills) ||
        !updates.skills.every(
          skill => typeof skill === "string" && skill.trim()
        )
      ) {
        return res.status(400).json({
          message: "Skills must be an array of non-empty strings"
        });
      }

      updates.skills = [
        ...new Set(updates.skills.map(skill => skill.trim()))
      ];
    }

    const numericRules = {
      graduationYear: [2000, 2100],
      tenthPercentage: [0, 100],
      twelfthPercentage: [0, 100],
      cgpa: [0, 10],
      activeBacklogs: [0, 100],
      totalBacklogs: [0, 100]
    };

    for (const [field, value] of Object.entries(updates)) {
      if (numericRules[field]) {
        const [min, max] = numericRules[field];

        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < min ||
          value > max
        ) {
          return res.status(400).json({
            message: `Invalid value for ${field}`
          });
        }

        if (
          ["graduationYear", "activeBacklogs", "totalBacklogs"]
            .includes(field) &&
          !Number.isInteger(value)
        ) {
          return res.status(400).json({
            message: `${field} must be a whole number`
          });
        }
      }
    }

    const existing = await Student.findOne({
      user: req.user._id
    });

    const profile = existing
      ? existing
      : new Student({ user: req.user._id });

    Object.assign(profile, updates);

    await profile.save();

    await profile.populate("user", "name email studentId");

    return res.json({
      message: "Academic profile saved successfully",
      profile
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error("Profile save error:", error.message);

    return res.status(500).json({
      message: "Failed to save student profile"
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const users = await User.find({ role: "STUDENT" })
      .select("name email studentId createdAt")
      .sort({ name: 1 })
      .lean();

    const profiles = await Student.find({
      user: { $in: users.map(user => user._id) }
    }).lean();

    const profileMap = new Map(
      profiles.map(profile => [
        profile.user.toString(),
        profile
      ])
    );

    const students = users.map(user => ({
      ...user,
      profile: profileMap.get(user._id.toString()) || null
    }));

    return res.json({
      count: students.length,
      students
    });
  } catch (error) {
    console.error("Student listing error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch students"
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "STUDENT"
    }).select("name email studentId createdAt");

    if (!user) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const profile = await Student.findOne({
      user: user._id
    });

    return res.json({ student: { user, profile } });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    console.error("Student details error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch student details"
    });
  }
};
