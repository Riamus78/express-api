import express from "express";
import { login, register } from "../controllers/authController.js";
import z from "zod";
import { validateBody } from "../middleware/validation.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import { rateLimiting } from "../middleware/rateLimiting.js";

const router = express.Router();

router.use(rateLimiting);

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "password must be atleast 8 charachters"),
  userName: z.string().min(8, "username must be atleast 8 charachters"),
  firstName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "password must be atleast 8 charachters"),
});

router
  .route("/register")
  .post(validateBody(registerSchema), register)
  .all(methodNotAllowed);
router
  .route("/login")
  .post(validateBody(loginSchema), login)
  .all(methodNotAllowed);

export default router;
