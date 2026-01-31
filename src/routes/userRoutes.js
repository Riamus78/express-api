import express from "express";
import { authenticate } from "../middleware/authentication.js";
import {
  deleteUser,
  getUserDetails,
  updateUser,
} from "../controllers/userController.js";
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

router
  .route("/")
  .get(getUserDetails)
  .patch(validateBody(updateUserSchema), updateUser)
  .delete(deleteUser)
  .all(methodNotAllowed);

export default router;
