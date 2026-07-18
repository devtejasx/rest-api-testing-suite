import { Router } from "express";
import { collectionController } from "../controllers/collection.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  createCollectionSchema,
  updateCollectionSchema,
  listCollectionsQuerySchema,
} from "../validators/collection.validator";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

// All collection routes require authentication.
router.use(authenticate);

router.get("/", validate({ query: listCollectionsQuerySchema }), collectionController.list);
router.post("/", validate({ body: createCollectionSchema }), collectionController.create);
router.get("/:id", validate({ params: idParamSchema }), collectionController.getById);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateCollectionSchema }),
  collectionController.update,
);
router.delete("/:id", validate({ params: idParamSchema }), collectionController.remove);

export default router;
