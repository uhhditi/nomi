import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";
import { verifyToken } from "../middlewares/validationMiddleware.js";

const router = Router();

// Wrap async handlers so rejections are passed to error middleware
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/", wrap(UserController.createUser));
// router.post("/", validateData(createUserSchema), wrap(UserController.createUser));

router.post("/login", wrap(UserController.loginUser));
router.post("/refresh-token", wrap(UserController.refreshToken));
router.put("/profile", verifyToken, wrap(UserController.updateProfile));

export default router;