
import mongoose from "mongoose";

const interviewSlotSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewBatch",
      required: true,
      index: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: true,
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
  },
  { timestamps: true }
);

// A candidate cannot be scheduled for the same round twice
// for the same placement drive.
interviewSlotSchema.index(
  { student: 1, drive: 1, roundName: 1 },
  { unique: true }
);

interviewSlotSchema.index({ student: 1, startsAt: 1, endsAt: 1 });

export default mongoose.model("InterviewSlot", interviewSlotSchema);
