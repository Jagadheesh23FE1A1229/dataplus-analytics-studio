import express from "express";
import {
  createDashboard,
  getDashboards,
  getDashboardById,
  updateDashboard,
  duplicateDashboard,
  deleteDashboard,
  getOverviewStats,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/stats/overview", getOverviewStats);
router.post("/", createDashboard);
router.get("/", getDashboards);
router.get("/:id", getDashboardById);
router.put("/:id", updateDashboard);
router.post("/:id/duplicate", duplicateDashboard);
router.delete("/:id", deleteDashboard);

export default router;
