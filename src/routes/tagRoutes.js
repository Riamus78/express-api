import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { validateBody, validateParams } from "../middleware/validation.js";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import z from "zod";
import {
  createTag,
  deleteTag,
  getUserTagById,
  getUserTags,
  updateTag,
} from "../controllers/tagController.js";

const uuidSchema = z.object({
  id: z.uuid("must be a valid uuid"),
});

const createTagSchema = z.object({
  name: z.string().trim().min("3"),
  color: z
    .string()
    .trim()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Invalid color format. Must be a 3 or 6 digit hex code (e.g., #FFF or #FFFFFF)",
    ),
});

const updateTagSchema = z
  .object({
    name: z.string().trim().min("3").optional(),
    color: z
      .string()
      .trim()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Invalid color format. Must be a 3 or 6 digit hex code (e.g., #FFF or #FFFFFF)",
      )
      .optional(),
  })
  .refine(
    (data) => data.color !== undefined || data.name !== undefined,
    "Either name or color must be provided to update the habit tag",
  );

const router = express.Router();

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: Get user habit tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User habit tags found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user habit tags found
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 3b458fae-10f0-4404-a4bc-ea44a1403f26
 *                       name:
 *                         type: string
 *                         example: health
 *                       color:
 *                         type: string
 *                         example: "#f0f0f0"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-10T10:59:09.340Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-24T07:59:48.790Z
 *                       createdBy:
 *                         type: object
 *                         nullable: true
 *                         description: Creator details; null indicates a system-created tag
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                           firstName:
 *                             type: string
 *                             example: sumair
 *                           lastName:
 *                             type: string
 *                             example: sumair
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router
  .route("/")
  .get(getUserTags)
  .post(validateBody(createTagSchema), createTag)
  .all(methodNotAllowed);

/**
 * @openapi
 * /api/tags/{id}:
 *   get:
 *     summary: Get a habit tag by id
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: habit tag details found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: habit tag details found
 *                 tagDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: ffaa4888-3145-4776-af97-98c5ba2c5d61
 *                     name:
 *                       type: string
 *                       example: Productivity
 *                     color:
 *                       type: string
 *                       example: "#000000"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-27T08:47:45.012Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-27T08:47:45.012Z
 *                     createdBy:
 *                       type: object
 *                       nullable: true
 *                       description: Creator details; null indicates a system-created tag
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                         firstName:
 *                           type: string
 *                           example: sumair
 *                         lastName:
 *                           type: string
 *                           example: sumair
 *       400:
 *         description: Bad request (invalid id)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update a habit tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide at least one of 'name' or 'color'
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: noodle soup
 *               color:
 *                 type: string
 *                 pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
 *                 example: "#000000"
 *     responses:
 *       200:
 *         description: habit tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: habit tag updated successfully
 *                 tagDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: ffaa4888-3145-4776-af97-98c5ba2c5d61
 *                     name:
 *                       type: string
 *                       example: noodle soup
 *                     color:
 *                       type: string
 *                       example: "#000000"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-27T08:47:45.012Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-27T08:47:45.012Z
 *                     createdBy:
 *                       type: object
 *                       nullable: true
 *                       description: Creator details; null indicates a system-created tag
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                         firstName:
 *                           type: string
 *                           example: sumair
 *                         lastName:
 *                           type: string
 *                           example: sumair
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a habit tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user habit tag deleted successfully
 *       400:
 *         description: Bad request (invalid id)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */

router
  .route("/:id")
  .all(validateParams(uuidSchema))
  .get(getUserTagById)
  .delete(deleteTag)
  .patch(validateBody(updateTagSchema), updateTag)
  .all(methodNotAllowed);

export default router;
