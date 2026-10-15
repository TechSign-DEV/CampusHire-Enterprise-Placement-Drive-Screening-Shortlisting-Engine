
import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
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
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    evaluatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

assessmentSchema.index(
  { student: 1, drive: 1 },
  { unique: true }
);

export default mongoose.model("Assessment", assessmentSchema);
