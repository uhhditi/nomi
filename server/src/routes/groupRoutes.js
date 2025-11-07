import { Router } from "express";
import { GroupController } from "../controllers/groupController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createGroupSchema } from "../schemas/groupSchema.js";

const router = Router();

router.post('/create', validateData(createGroupSchema), GroupController.createGroup)
// router.post('/edit', validateData(editLogSchema), LogsController.editLog)
// router.get('/', LogsController.getAllLogs);

export default router;