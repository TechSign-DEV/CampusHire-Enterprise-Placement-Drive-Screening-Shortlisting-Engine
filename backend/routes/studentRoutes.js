
import express from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

import {
  getMyProfile,
  saveMyProfile,
  getAllStudents,
  getStudentById
} from "../controllers/studentController.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  allowRoles("STUDENT"),
  getMyProfile
);

router.put(
  "/me",
  protect,
  allowRoles("STUDENT"),
  saveMyProfile
);

router.get(
  "/",
  protect,
  allowRoles("ADMIN"),
  getAllStudents
);

router.get(
  "/:id",
  protect,
  allowRoles("ADMIN"),
  getStudentById
);

export default router;
