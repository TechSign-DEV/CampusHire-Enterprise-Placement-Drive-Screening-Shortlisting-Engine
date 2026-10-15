
import express from "express";
import  protect  from "../middleware/authMiddleware.js";
import  allowRoles  from "../middleware/roleMiddleware.js";

import {
  getUsers,
  updateUserStatus,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, allowRoles("ADMIN"));

router.get("/users", getUsers);
router.patch("/users/:userId/status", updateUserStatus);

export default router;
