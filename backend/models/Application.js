
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: true,
      index: true
    },
    eligibilityStatus: {
      type: String,
      enum: ["PENDING", "ELIGIBLE", "NOT_ELIGIBLE"],
      default: "PENDING",
      index: true
    },
    reasons: {
      type: [String],
      default: []
    },
    codingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    screenedAt: {
      type: Date,
      default: null
    },
    applicationStatus: {
      type: String,
      enum: [
        "NOT_APPLIED",
        "APPLIED",
        "SHORTLISTED",
        "REJECTED",
        "INTERVIEW_SCHEDULED"
      ],
      default: "NOT_APPLIED",
      index: true
    },
    appliedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

applicationSchema.index(
  { student: 1, drive: 1 },
  { unique: true }
);

applicationSchema.index({
  drive: 1,
  eligibilityStatus: 1,
  applicationStatus: 1
});

export default mongoose.model("Application", applicationSchema);
