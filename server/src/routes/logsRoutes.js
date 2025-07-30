import { Router } from "express";
import { LogsController } from "../controllers/logsController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createLogSchema } from "../schemas/logSchema.js";

const router = Router();

router.post('/', validateData(createLogSchema), LogsController.createLog)

export default router;