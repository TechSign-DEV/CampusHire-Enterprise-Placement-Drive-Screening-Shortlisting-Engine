
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    graduationYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100
    },

    tenthPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    twelfthPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    activeBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger
    },

    totalBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger
    },

    skills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

studentSchema.pre("validate", function () {
  if (this.activeBacklogs > this.totalBacklogs) {
    this.invalidate(
      "activeBacklogs",
      "Active backlogs cannot exceed total backlogs"
    );
  }
});

export default mongoose.model("Student", studentSchema);
