import express from "express";
import { getUserDetails, updateUser } from "../controllers/userController.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import z from "zod";
import { validateBody } from "../middleware/validation.js";

const updateUserSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.firstName ?? "").trim() !== "" ||
      (data.lastName ?? "").trim() !== "",
    {
      error:
        "atleast one of the firsName & lastName must be provided & must not be empty",
    },
  );

const router = express.Router();

/**
 * @openapi
 * /api/user:
 *   get:
 *     summary: Get authenticated user's details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user details fetched
 *                 user:
 *                   type: object
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
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update authenticated user's first and/or last name
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: At least one of firstName or lastName must be provided and non-empty
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 example: Johny boy
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 example: Doe
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user updated successfully
 *                 user:
 *                   type: object
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
 *                       example: Johny boy
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
 *                       example: 2026-02-03T07:00:52.941Z
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */

router
  .route("/")
  .get(getUserDetails)
  .patch(validateBody(updateUserSchema), updateUser)
  .all(methodNotAllowed);

export default router;
