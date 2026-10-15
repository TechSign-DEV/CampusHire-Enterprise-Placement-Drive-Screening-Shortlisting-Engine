
import mongoose from "mongoose";

const interviewBatchSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    slotMinutes: {
      type: Number,
      required: true,
      min: 5,
      max: 240,
    },
    candidateCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewBatch", interviewBatchSchema);
