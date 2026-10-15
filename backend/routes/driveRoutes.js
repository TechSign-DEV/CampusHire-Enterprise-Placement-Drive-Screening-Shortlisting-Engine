
import express from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

import {
  createDrive,
  getDrives,
  updateDrive
} from "../controllers/driveController.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  allowRoles("ADMIN", "STUDENT", "RECRUITER"),
  getDrives
);

router.post(
  "/",
  allowRoles("RECRUITER"),
  createDrive
);

router.put(
  "/:id",
  allowRoles("ADMIN", "RECRUITER"),
  updateDrive
);

export default router;
