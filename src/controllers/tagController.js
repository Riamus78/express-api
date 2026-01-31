import { and, eq, isNull, or } from "drizzle-orm";
import db from "../db/connection.js";
import { tags, users } from "../db/schema.js";

export const createTag = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { name, color } = req.body;

    const [newTag] = await db
      .insert(tags)
      .values({
        name,
        color,
        createdById: userId,
      })
      .returning();

    res
      .status(200)
      .json({ message: "new tag created successfully", tagDetails: newTag });
  } catch (error) {
    next(error);
  }
};

export const getUserTags = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const tagsArray = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(tags)
      .leftJoin(users, eq(tags.createdById, users.id))
      .where(
        and(
          or(eq(tags.createdById, userId), isNull(tags.createdById)),
          isNull(tags.deletedAt),
        ),
      );

    if (tagsArray.length == 0) {
      const error = new Error("user habit tags not found");
      error.status = 200;
      throw error;
    }

    res.status(200).json({
      message: "user habit tags found",
      tags: tagsArray,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTagById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tagId } = req.params;
    const [tagDetails] = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(tags)
      .leftJoin(users, eq(tags.createdById, users.id))
      .where(and(eq(tags.id, tagId)));

    if (!tagDetails) {
      const error = new Error("tag details not found");
      error.status = 404;
      throw error;
    }
    res.status(200).json({
      message: "habit tag details found",
      tagDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const { id: tagId } = req.params;
    const userId = req.user.id;

    const [tagDetails] = await db.select().from(tags).where(eq(tags.id, tagId));

    if (!tagDetails) {
      const error = new Error("habit tag not found");
      error.status = 404;
      throw error;
    }

    if (tagDetails.deletedAt !== null) {
      const error = new Error("habit tag has already been deleted");
      error.status = 400;
      throw error;
    }

    if (tagDetails.createdById === null) {
      const error = new Error(
        "system default habit tags cannot be deleted by users",
      );
      error.status = 400;
      throw error;
    }

    const [isDeleted] = await db
      .update(tags)
      .set({
        deletedAt: new Date(),
      })
      .where(and(eq(tags.id, tagId), eq(tags.createdById, userId)))
      .returning();

    if (!isDeleted) {
      const error = new Error("unable to delete habit tag");
      error.status = 400;
      throw error;
    }

    res.status(200).json({ message: "user habit tag deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const { id: tagId } = req.params;
    const userId = req.user.id;
    const { name, color } = req.body;

    const [tagDetails] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, tagId), isNull(tags.deletedAt)));

    if (!tagDetails) {
      const error = new Error("habit tag not found");
      error.status = 404;
      throw error;
    }

    if (tagDetails.createdById === null) {
      const error = new Error(
        "system default habit tags cannot be updated by users",
      );
      error.status = 400;
      throw error;
    }

    const [isUpdated] = await db
      .update(tags)
      .set({
        ...(name && { name: name }),
        ...(color && { color: color }),
      })
      .where(and(eq(tags.id, tagId), eq(tags.createdById, userId)))
      .returning();

    if (!isUpdated) {
      const error = new Error("unable to update habit tag");
      error.status = 400;
      throw error;
    }

    const [updatedTagDetails] = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(tags)
      .leftJoin(users, eq(tags.createdById, users.id))
      .where(eq(tags.id, tagId));

    res.status(200).json({
      message: "habit tag updated successfully",
      tagDetails: updatedTagDetails,
    });
  } catch (error) {
    next(error);
  }
};
