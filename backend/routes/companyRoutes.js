
import express from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

import {
  getMyCompany,
  saveMyCompany,
  getAllCompanies
} from "../controllers/companyController.js";

const router = express.Router();

router.use(protect);

router.get(
  "/me",
  allowRoles("RECRUITER"),
  getMyCompany
);

router.put(
  "/me",
  allowRoles("RECRUITER"),
  saveMyCompany
);

router.get(
  "/",
  allowRoles("ADMIN"),
  getAllCompanies
);

export default router;
