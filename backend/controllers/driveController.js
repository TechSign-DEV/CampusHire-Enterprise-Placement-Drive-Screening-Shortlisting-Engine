
import Company from "../models/Company.js";
import Drive from "../models/Drive.js";

const normalizeDriveInput = (body) => ({
  title: body.title?.trim(),
  description: body.description?.trim() || "",
  jobType: body.jobType || "FULL_TIME",
  packageLpa: body.packageLpa,
  applicationDeadline: body.applicationDeadline,
  eligibleDepartments: body.eligibleDepartments || [],
  criteria: body.criteria,
  status: body.status || "DRAFT"
});

const validateDriveInput = (data) => {
  if (!data.title) return "Drive title is required";

  if (!["FULL_TIME", "INTERNSHIP"].includes(data.jobType)) {
    return "Invalid job type";
  }

  if (
    typeof data.packageLpa !== "number" ||
    !Number.isFinite(data.packageLpa) ||
    data.packageLpa < 0
  ) {
    return "Package must be a valid non-negative number";
  }

  if (
    !data.applicationDeadline ||
    !Number.isFinite(Date.parse(data.applicationDeadline))
  ) {
    return "A valid application deadline is required";
  }

  if (Date.parse(data.applicationDeadline) <= Date.now()) {
    return "Application deadline must be in the future";
  }

  if (!["DRAFT", "OPEN", "CLOSED"].includes(data.status)) {
    return "Invalid drive status";
  }

  if (
    !Array.isArray(data.eligibleDepartments) ||
    !data.eligibleDepartments.every(
      item => typeof item === "string" && item.trim()
    )
  ) {
    return "Eligible departments must be a list of valid names";
  }

  const c = data.criteria;

  if (
    !c ||
    typeof c.graduationYear !== "number" ||
    !Number.isInteger(c.graduationYear) ||
    c.graduationYear < 2000 ||
    c.graduationYear > 2100
  ) {
    return "A valid graduation year is required";
  }

  const ranges = [
    ["tenthPercentage", 0, 100],
    ["twelfthPercentage", 0, 100],
    ["cgpa", 0, 10],
    ["maxActiveBacklogs", 0, 100],
    
  ];

  for (const [field, min, max] of ranges) {
    const value = c[field] ?? 0;

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    ) {
      return `Invalid criteria value: ${field}`;
    }

    if (
      field === "maxActiveBacklogs" &&
      !Number.isInteger(value)
    ) {
      return "Maximum active backlogs must be a whole number";
    }
  }

  if (
    data.status === "OPEN" &&
    Date.parse(data.applicationDeadline) <= Date.now()
  ) {
    return "An open drive must have a future deadline";
  }

  return null;
};

export const createDrive = async (req, res) => {
  try {
    const company = await Company.findOne({
      recruiter: req.user._id
    });

    if (!company) {
      return res.status(400).json({
        message: "Create your company profile before creating a drive"
      });
    }

    const data = normalizeDriveInput(req.body);
    const validationError = validateDriveInput(data);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const drive = await Drive.create({
      ...data,
      company: company._id,
      recruiter: req.user._id
    });

    await drive.populate("company", "name industry location");

    return res.status(201).json({
      message: "Placement drive created successfully",
      drive
    });
  } catch (error) {
    console.error("Create drive error:", error.message);

    return res.status(500).json({
      message: "Failed to create placement drive"
    });
  }
};

export const getDrives = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "RECRUITER") {
      filter.recruiter = req.user._id;
    }

    if (req.user.role === "STUDENT") {
      filter.status = "OPEN";
      filter.applicationDeadline = { $gt: new Date() };
    }

    const drives = await Drive.find(filter)
      .populate("company", "name industry location website")
      .sort({ createdAt: -1 });

    return res.json({
      count: drives.length,
      drives
    });
  } catch (error) {
    console.error("List drives error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch placement drives"
    });
  }
};

export const updateDrive = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "RECRUITER") {
      filter.recruiter = req.user._id;
    }

    const drive = await Drive.findOne(filter);

    if (!drive) {
      return res.status(404).json({
        message: "Placement drive not found"
      });
    }

    if (req.user.role === "ADMIN") {
      if (req.body.status !== "CLOSED") {
        return res.status(403).json({
          message: "Admins may close drives but cannot edit recruiter criteria"
        });
      }

      drive.status = "CLOSED";
      await drive.save();

      return res.json({
        message: "Placement drive closed successfully",
        drive
      });
    }

    const merged = {
      title: req.body.title ?? drive.title,
      description: req.body.description ?? drive.description,
      jobType: req.body.jobType ?? drive.jobType,
      packageLpa: req.body.packageLpa ?? drive.packageLpa,
      applicationDeadline:
        req.body.applicationDeadline ?? drive.applicationDeadline,
      eligibleDepartments:
        req.body.eligibleDepartments ?? drive.eligibleDepartments,
      criteria: {
        tenthPercentage:
          req.body.criteria?.tenthPercentage ??
          drive.criteria.tenthPercentage,
        twelfthPercentage:
          req.body.criteria?.twelfthPercentage ??
          drive.criteria.twelfthPercentage,
        cgpa: req.body.criteria?.cgpa ?? drive.criteria.cgpa,
        maxActiveBacklogs:
          req.body.criteria?.maxActiveBacklogs ??
          drive.criteria.maxActiveBacklogs,
        graduationYear:
          req.body.criteria?.graduationYear ??
          drive.criteria.graduationYear,
       
      },
      status: req.body.status ?? drive.status
    };

    const validationError = validateDriveInput(merged);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    Object.assign(drive, merged);
    await drive.save();
    await drive.populate("company", "name industry location");

    return res.json({
      message: "Placement drive updated successfully",
      drive
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid placement drive ID"
      });
    }

    console.error("Update drive error:", error.message);

    return res.status(500).json({
      message: "Failed to update placement drive"
    });
  }
};
