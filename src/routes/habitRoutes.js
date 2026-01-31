import express from "express";
import { methodNotAllowed } from "../middleware/methodNotAllowed.js";
import { authenticate } from "../middleware/authentication.js";
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

// GET /api/habits getAllUserHabits
// POST /api/habits createNewHabit
// GET /api/habits/:id getHabitById
// PATCH /api/habits/:id updateHabit
// DELETE /api/habits/:id deleteHabit

// userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   frequency: varchar("frequency", { length: 25 }),
//   targetCount: integer("target_count").default(1),

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

router
  .route("/")
  .get(getAllUserHabits)
  .post(validateBody(createNewHabitSchema), createNewHabit)
  .all(methodNotAllowed);

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

router
  .route("/tag/:id")
  .get(validateParams(uuidSchema), getHabitsByTag)
  .all(methodNotAllowed);

export default router;
