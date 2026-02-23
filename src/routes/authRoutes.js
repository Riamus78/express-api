import express from "express";
import { login, register } from "../controllers/authController.js";
import z from "zod";
import { validateBody } from "../middleware/validation.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";

const router = express.Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "password must be atleast 8 charachters"),
  userName: z.string().min(8, "username must be atleast 8 charachters"),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "password must be atleast 8 charachters"),
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, userName, firstName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password (min 8 characters)
 *                 example: MySecurePassword123
 *               userName:
 *                 type: string
 *                 minLength: 8
 *                 description: Unique username (min 8 characters)
 *                 example: uniqueUser
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 description: User's first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: User's last name (optional)
 *                 example: Doe
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   description: Created user object (sensitive fields omitted)
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 7b33ae6a-458f-4554-868e-45387cfdc9ef
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     userName:
 *                       type: string
 *                       example: uniqueUser
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T06:32:35.635Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T06:32:35.635Z
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Bad request (e.g., invalid input, user already exists)
 *       500:
 *         description: Server error
 */
router
  .route("/register")
  .post(validateBody(registerSchema), register)
  .all(methodNotAllowed);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns a token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   description: Created user object (sensitive fields omitted)
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 7b33ae6a-458f-4554-868e-45387cfdc9ef
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     userName:
 *                       type: string
 *                       example: uniqueUser
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T06:32:35.635Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T06:32:35.635Z
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: Unauthorized (e.g., invalid credentials)
 *       400:
 *         description: Bad request (e.g., invalid input)
 *       500:
 *         description: Server error
 */
router
  .route("/login")
  .post(validateBody(loginSchema), login)
  .all(methodNotAllowed);

export default router;
