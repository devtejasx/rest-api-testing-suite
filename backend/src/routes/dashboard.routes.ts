import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();

// Public read — aggregated metrics for the dashboard overview.
router.get("/", dashboardController.overview);

export default router;
