import express from "express";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import {
  completeHabit,
  createNewHabit,
  deleteHabit,
  getAllUserHabits,
  getHabitById,
  getHabitsByTag,
  updateHabit,
} from "../controllers/habitController.js";
import z from "zod";
import { validateBody, validateParams } from "../middleware/validation.js";

const createNewHabitSchema = z.object({
  name: z
    .string("this field is required")
    .trim()
    .min(1, "this field is required")
    .max(100, "too long"),
  description: z.string().trim().optional(),
  frequency: z.enum(
    ["daily", "monthly", "annually"],
    "Value must be daily,monthly,annually",
  ),
  targetCount: z.int("Must be a number").positive("Must be a positive number"),
  isActive: z.boolean("must be true or false").optional(),
  tagIds: z
    .array(z.uuid("must be a valid uuid"), "must be an array of valid uuids")
    .optional(),
});

const uuidSchema = z.object({
  id: z.uuid("must be a valid uuid"),
});

const updateHabitSchema = z
  .object({
    name: z
      .string("this field is required")
      .trim()
      .min(1, "this field is required")
      .max(100, "too long")
      .optional(),
    description: z.string().trim().optional(),
    frequency: z
      .enum(
        ["daily", "monthly", "annually"],
        "Value must be daily,monthly,annually",
      )
      .optional(),
    targetCount: z
      .int("Must be a number")
      .positive("Must be a positive number")
      .optional(),
    isActive: z.boolean("must be true or false").optional(),
    tagIds: z
      .array(z.uuid("must be a valid uuid"), "must be an array of valid uuids")
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.frequency !== undefined ||
      data.targetCount !== undefined ||
      data.tagIds !== undefined ||
      data.isActive !== undefined,

    "At least one field must be provided for update.",
  );

const router = express.Router();

/**
 * @openapi
 * /api/habits:
 *   get:
 *     summary: Get all habits for authenticated user
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User habits found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User habits found
 *                 userHabits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: dd2f3193-eb45-473b-8302-90ad9cf68f3d
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                       name:
 *                         type: string
 *                         example: testing
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: amir
 *                       frequency:
 *                         type: string
 *                         enum: [daily, monthly, annually]
 *                         example: daily
 *                       targetCount:
 *                         type: integer
 *                         example: 30
 *                       isActive:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-24T09:43:49.816Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-24T09:43:49.816Z
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: 3b458fae-10f0-4404-a4bc-ea44a1403f26
 *                             name:
 *                               type: string
 *                               example: health
 *                             color:
 *                               type: string
 *                               example: "#f0f0f0"
 *                             createdById:
 *                               type: string
 *                               format: uuid
 *                               nullable: true
 *                               example: null
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: 2026-01-10T10:59:09.340Z
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: 2026-01-10T10:59:09.340Z
 *                             deletedAt:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               example: null
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new habit for the authenticated user
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, frequency, targetCount]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: My Habit
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               frequency:
 *                 type: string
 *                 enum: [daily, monthly, annually]
 *                 example: daily
 *               targetCount:
 *                 type: integer
 *                 example: 10
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: []
 *     responses:
 *       200:
 *         description: New habit added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New habit added successfully
 *                 habit:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 1733ac1b-f3d8-4178-998a-811cc66cfbb8
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                     name:
 *                       type: string
 *                       example: My Habit
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     frequency:
 *                       type: string
 *                       example: daily
 *                     targetCount:
 *                       type: integer
 *                       example: 10
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T07:55:07.145Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T07:55:07.145Z
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
  .get(getAllUserHabits)
  .post(validateBody(createNewHabitSchema), createNewHabit)
  .all(methodNotAllowed);

/**
 * @openapi
 * /api/habits/{id}:
 *   get:
 *     summary: Get a single habit by id for the authenticated user
 *     tags: [Habits]
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
 *         description: Habit Details found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Habit Details found
 *                 habitDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: dd2f3193-eb45-473b-8302-90ad9cf68f3d
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                     name:
 *                       type: string
 *                       example: testing
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: amir
 *                     frequency:
 *                       type: string
 *                       enum: [daily, monthly, annually]
 *                       example: daily
 *                     targetCount:
 *                       type: integer
 *                       example: 30
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-24T09:43:49.816Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-24T09:43:49.816Z
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 3b458fae-10f0-4404-a4bc-ea44a1403f26
 *                           name:
 *                             type: string
 *                             example: health
 *                           color:
 *                             type: string
 *                             example: "#f0f0f0"
 *                           createdById:
 *                             type: string
 *                             format: uuid
 *                             nullable: true
 *                             example: null
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-01-10T10:59:09.340Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-01-10T10:59:09.340Z
 *                           deletedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *       400:
 *         description: Bad request (invalid id)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update a habit for the authenticated user
 *     tags: [Habits]
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
 *             description: At least one field must be provided for update
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: their Habits
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               frequency:
 *                 type: string
 *                 enum: [daily, monthly, annually]
 *                 example: daily
 *               targetCount:
 *                 type: integer
 *                 example: 10
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - 3b458fae-10f0-4404-a4bc-ea44a1403f26
 *     responses:
 *       200:
 *         description: habit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: habit updated successfully
 *                 habitDetails:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 1733ac1b-f3d8-4178-998a-811cc66cfbb8
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                     name:
 *                       type: string
 *                       example: their Habits
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     frequency:
 *                       type: string
 *                       enum: [daily, monthly, annually]
 *                       example: daily
 *                     targetCount:
 *                       type: integer
 *                       example: 10
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T07:55:07.145Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T08:08:18.391Z
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 3b458fae-10f0-4404-a4bc-ea44a1403f26
 *                           name:
 *                             type: string
 *                             example: health
 *                           color:
 *                             type: string
 *                             example: "#f0f0f0"
 *                           createdById:
 *                             type: string
 *                             format: uuid
 *                             nullable: true
 *                             example: null
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-01-10T10:59:09.340Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-01-10T10:59:09.340Z
 *                           deletedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a habit for the authenticated user
 *     tags: [Habits]
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
 *         description: Habit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: habit deleted successfully
 *       400:
 *         description: Bad request (invalid id)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router
  .route("/:id")
  .get(validateParams(uuidSchema), getHabitById)
  .patch(
    validateParams(uuidSchema),
    validateBody(updateHabitSchema),
    updateHabit,
  )
  .delete(validateParams(uuidSchema), deleteHabit)
  .all(methodNotAllowed);

/**
 * @openapi
 * /api/habits/{id}/complete:
 *   post:
 *     summary: Add a completion entry for a habit
 *     tags: [Habits]
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *     responses:
 *       200:
 *         description: New entry added for habit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New entry added for habit
 *                 entry:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 7a68d7a1-61d0-4dac-8452-19de02cc9934
 *                     habitId:
 *                       type: string
 *                       format: uuid
 *                       example: 0f8f2a33-2211-448c-83e0-b3eddd917af1
 *                     completionDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T08:26:44.515Z
 *                     note:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-03T08:26:44.515Z
 *       400:
 *         description: Bad request (validation error or habit inactive)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Habit not found
 *       500:
 *         description: Server error
 */
router
  .route("/:id/complete")
  .post(
    validateParams(uuidSchema),
    validateBody(
      z.object({ note: z.string().min("1", "required").optional() }),
    ),
    completeHabit,
  )
  .all(methodNotAllowed);

/**
 * @openapi
 * /api/habits/tag/{id}:
 *   get:
 *     summary: Get habits by tag for the authenticated user
 *     tags: [Habits]
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
 *         description: Habits found by tag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Habits found by tag
 *                 habits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 3f8e1f09-0d3e-44fa-a07d-7b432dea1ac3
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: 307a4af8-2950-4d22-ad62-3a82d1cd15a3
 *                       name:
 *                         type: string
 *                         example: boxing
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: amir
 *                       frequency:
 *                         type: string
 *                         enum: [daily, monthly, annually]
 *                         example: daily
 *                       targetCount:
 *                         type: integer
 *                         example: 30
 *                       isActive:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-26T07:56:44.378Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-26T07:56:44.378Z
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: 3b458fae-10f0-4404-a4bc-ea44a1403f26
 *                             name:
 *                               type: string
 *                               example: health
 *                             color:
 *                               type: string
 *                               example: "#f0f0f0"
 *                             createdById:
 *                               type: string
 *                               format: uuid
 *                               nullable: true
 *                               example: null
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: 2026-01-10T10:59:09.340Z
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: 2026-01-10T10:59:09.340Z
 *                             deletedAt:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               example: null
 *       400:
 *         description: Bad request (invalid id)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Habits not found by tag
 *       500:
 *         description: Server error
 */
router
  .route("/tag/:id")
  .get(validateParams(uuidSchema), getHabitsByTag)
  .all(methodNotAllowed);

export default router;
