
import mongoose from "mongoose";
import User from "../models/User.js";

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { q = "", role = "", status = "" } = req.query;

    const filter = {};

    if (role && ["ADMIN", "STUDENT", "RECRUITER"].includes(role)) {
      filter.role = role;
    } else if (role) {
      return res.status(400).json({
        message: "Invalid user role filter.",
      });
    }

    if (status === "active") {
      filter.isActive = { $ne: false };
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status) {
      return res.status(400).json({
        message: "Invalid status filter.",
      });
    }

    const search = String(q).trim().slice(0, 100);

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { name: regex },
        { email: regex },
      ];
    }

    const users = await User.find(filter)
      .select("_id name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.json({
      count: users.length,
      users: users.map((user) => ({
        ...user,
        isActive: user.isActive !== false,
      })),
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
};

// PATCH /api/admin/users/:userId/status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false.",
      });
    }

    if (String(req.user._id) === String(userId) && !isActive) {
      return res.status(400).json({
        message: "You cannot deactivate your own account.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.isActive === isActive) {
      return res.json({
        message: `Account is already ${isActive ? "active" : "inactive"}.`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive !== false,
        },
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.json({
      message: `User account ${isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error.message);

    return res.status(500).json({
      message: "Failed to update user status.",
    });
  }
};
