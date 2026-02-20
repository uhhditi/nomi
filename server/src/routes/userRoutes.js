import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";

const router = Router();

// Wrap async handlers so rejections are passed to error middleware (avoids FUNCTION_INVOCATION_FAILED)
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', wrap(UserController.createUser));
// router.post('/', validateData(createUserSchema), UserController.createUser);
router.post('/login', wrap(UserController.loginUser));
router.post('/refresh-token', wrap(UserController.refreshToken));
export default router;