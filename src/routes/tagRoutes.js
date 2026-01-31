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

router
  .route("/")
  .post(validateBody(createTagSchema), createTag)
  .get(getUserTags)
  .all(methodNotAllowed);

router
  .route("/:id")
  .all(validateParams(uuidSchema))
  .get(getUserTagById)
  .delete(deleteTag)
  .patch(validateBody(updateTagSchema), updateTag)
  .all(methodNotAllowed);

export default router;
