
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["ADMIN", "STUDENT", "RECRUITER"],
      required: true,
      default: "STUDENT"
    },

    companyName: {
      type: String,
      trim: true
    },
isActive: {
  type: Boolean,
  default: true,
},
    studentId: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
