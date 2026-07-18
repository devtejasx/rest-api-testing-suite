import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  idParamSchema,
  paginationQuerySchema,
} from "../validators/common.validator";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: paginationQuerySchema }), reportController.list);
router.get("/:id", validate({ params: idParamSchema }), reportController.getById);

export default router;
