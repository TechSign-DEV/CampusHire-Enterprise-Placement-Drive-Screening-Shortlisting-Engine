
import mongoose from "mongoose";

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    jobType: {
      type: String,
      enum: ["FULL_TIME", "INTERNSHIP"],
      default: "FULL_TIME"
    },
    packageLpa: {
      type: Number,
      required: true,
      min: 0
    },
    applicationDeadline: {
      type: Date,
      required: true
    },
    eligibleDepartments: {
      type: [String],
      default: []
    },
    criteria: {
      tenthPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      twelfthPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      cgpa: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
      },
      maxActiveBacklogs: {
        type: Number,
        min: 0,
        default: 0
      },
      graduationYear: {
        type: Number,
        min: 2000,
        max: 2100,
        required: true
      },
      minCodingScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "CLOSED"],
      default: "DRAFT",
      index: true
    }
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, applicationDeadline: 1 });

export default mongoose.model("Drive", driveSchema);
