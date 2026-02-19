import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";
import { verifyToken } from "../middlewares/validationMiddleware.js";

const router = Router();

router.post('/', UserController.createUser);
// router.post('/', validateData(createUserSchema), UserController.createUser);
router.post('/login', UserController.loginUser);
router.post('/refresh-token', UserController.refreshToken);
router.put('/profile', verifyToken, UserController.updateProfile);
export default router;