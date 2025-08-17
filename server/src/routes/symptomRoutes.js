import { Router } from "express";
import { SymptomController } from "../controllers/symptomController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createSymptomSchema } from "../schemas/symptomSchema.js";

const router = Router();

router.post('/add', validateData(createSymptomSchema), SymptomController.createSymptom)

export default router;