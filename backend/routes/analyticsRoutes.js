
import express from "express";
import protect  from "../middleware/authMiddleware.js";
import  allowRoles  from "../middleware/roleMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("ADMIN", "RECRUITER"),
  getAnalytics
);

export default router;
