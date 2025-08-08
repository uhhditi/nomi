import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";

const router = Router();

router.post('/', UserController.createUser);
// router.post('/', validateData(createUserSchema), UserController.createUser);
router.post('/login', UserController.loginUser);
router.post('/refresh-token', UserController.refreshToken);
router.get('/test', (req, res) => {
    res.send('✅ User route is active');
});
export default router;