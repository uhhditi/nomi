import { Router } from "express";
import { LogsController } from "../controllers/logsController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createLogSchema, editLogSchema } from "../schemas/logSchema.js";

const router = Router();

router.post('/create', validateData(createLogSchema), LogsController.createLog)
router.post('/edit', validateData(editLogSchema), LogsController.editLog)
router.get('/', LogsController.getAllLogs);

export default router;