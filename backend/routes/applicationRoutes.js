
import express from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

import {
  runDriveScreening,
  recordAssessment,
  getDriveResults,
  applyToDrive,
  getMyApplications,
  shortlistApplicants
} from "../controllers/applicationController.js";

const router = express.Router();

router.use(protect);

router.get(
  "/me",
  allowRoles("STUDENT"),
  getMyApplications
);

router.post(
  "/drives/:driveId/apply",
  allowRoles("STUDENT"),
  applyToDrive
);

router.post(
  "/drives/:driveId/screen",
  allowRoles("ADMIN", "RECRUITER"),
  runDriveScreening
);

router.post(
  "/drives/:driveId/assessments",
  allowRoles("ADMIN", "RECRUITER"),
  recordAssessment
);

router.get(
  "/drives/:driveId/results",
  allowRoles("ADMIN", "RECRUITER"),
  getDriveResults
);

router.post(
  "/drives/:driveId/shortlist",
  allowRoles("ADMIN", "RECRUITER"),
  shortlistApplicants
);

export default router;
