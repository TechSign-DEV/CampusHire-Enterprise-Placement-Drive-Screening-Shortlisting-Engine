import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  ...(user.studentId ? { studentId: user.studentId } : {}),
  ...(user.companyName ? { companyName: user.companyName } : {})
});

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      companyName
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: "Name, email, password and role are required"
      });
    }

    const allowedRoles = [
      "ADMIN",
      "STUDENT",
      "RECRUITER"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    if (role === "STUDENT" && !studentId?.trim()) {
      return res.status(400).json({
        message: "Student ID is required"
      });
    }

    if (role === "RECRUITER" && !companyName?.trim()) {
      return res.status(400).json({
        message: "Company name is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role
    };

    if (role === "STUDENT") {
      userData.studentId = studentId.trim();
    }

    if (role === "RECRUITER") {
      userData.companyName = companyName.trim();
    }

    const user = await User.create(userData);
    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or student ID already exists"
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    user: publicUser(req.user)
  });
};