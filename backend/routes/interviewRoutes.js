
import express from "express";
import  protect  from "../middleware/authMiddleware.js";
import  allowRoles  from "../middleware/roleMiddleware.js";

import {
  createInterviewBatch,
  getDriveInterviews,
  getMyInterviews,
  updateInterviewStatus,
} from "../controllers/interviewController.js";

const router = express.Router();

router.use(protect);

router.get("/me", allowRoles("STUDENT"), getMyInterviews);

router.post(
  "/drives/:driveId/batches",
  allowRoles("ADMIN", "RECRUITER"),
  createInterviewBatch
);

router.get(
  "/drives/:driveId",
  allowRoles("ADMIN", "RECRUITER"),
  getDriveInterviews
);

router.patch(
  "/slots/:slotId/status",
  allowRoles("ADMIN", "RECRUITER"),
  updateInterviewStatus
);

export default router;
