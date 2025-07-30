import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";

const router = Router();

router.post('/', validateData(createUserSchema), UserController.createUser)

export default router;