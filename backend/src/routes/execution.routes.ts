import { Router } from "express";
import { executionController } from "../controllers/execution.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  runExecutionSchema,
  listExecutionsQuerySchema,
} from "../validators/execution.validator";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.use(authenticate);

router.post("/run", validate({ body: runExecutionSchema }), executionController.run);
router.get("/", validate({ query: listExecutionsQuerySchema }), executionController.list);
router.get("/:id", validate({ params: idParamSchema }), executionController.getById);

export default router;
