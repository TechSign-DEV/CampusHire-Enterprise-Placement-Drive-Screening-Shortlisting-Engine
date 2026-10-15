
import express from "express";

import  protect  from "../middleware/authMiddleware.js";
import  allowRoles  from "../middleware/roleMiddleware.js";

import {
  exportApplications,
  exportScreening,
  exportInterviews,
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect, allowRoles("ADMIN", "RECRUITER"));

router.get("/applications", exportApplications);
router.get("/screening", exportScreening);
router.get("/interviews", exportInterviews);

export default router;
