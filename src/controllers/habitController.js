import { and, desc, eq, isNull } from "drizzle-orm";
import db from "../db/connection.js";
import { entries, habits, habitTags, tags } from "../db/schema.js";

export const getAllUserHabits = async (req, res, next) => {
  try {
    const result = await db
      .select()
      .from(habits)
      .leftJoin(habitTags, eq(habits.id, habitTags.habitId))
      .leftJoin(tags, eq(habitTags.tagId, tags.id))
      .where(and(eq(habits.userId, req.user.id), isNull(habits.deletedAt)));

    if (result.length == 0) {
      const error = new Error("Habits not found");
      error.status = 404;
      throw error;
    }

    const habitsMap = new Map();

    result.forEach((row) => {
      const habitId = row.habits.id;
      if (!habitsMap.has(habitId)) {
        habitsMap.set(habitId, {
          ...row.habits,
          tags: [],
        });
      }

      if (row.tags?.id) {
        habitsMap.get(habitId).tags.push({
          ...row.tags,
        });
      }
    });

    const userHabits = Array.from(habitsMap.values());
    res.status(200).json({
      message: "User habits found",
      userHabits: userHabits,
    });
  } catch (error) {
    next(error);
  }
};

// userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   frequency: varchar("frequency", { length: 25 }),
//   targetCount: integer("target_count").default(1),

export const createNewHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, frequency, targetCount, isActive, tagIds } =
      req.body;

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId,
          name,
          frequency,
          targetCount,
          ...(isActive !== undefined && { isActive: isActive }),
          ...(description && { description: description }),
        })
        .returning();

      if (tagIds && tagIds.length > 0) {
        const habitTagsValues = tagIds.map((id) => ({
          habitId: newHabit.id,
          tagId: id,
        }));
        await tx.insert(habitTags).values(habitTagsValues);
      }

      return newHabit;
    });

    res
      .status(200)
      .json({ message: "New habit added successfully", habit: result });
  } catch (error) {
    next(error);
  }
};

export const getHabitById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: habitId } = req.params;
    const result = await db
      .select()
      .from(habits)
      .leftJoin(habitTags, eq(habits.id, habitTags.habitId))
      .leftJoin(tags, eq(habitTags.tagId, tags.id))
      .where(
        and(
          eq(habits.id, habitId),
          eq(habits.userId, userId),
          isNull(habits.deletedAt),
        ),
      );

    const habitsMap = new Map();
    result.forEach((row) => {
      if (!habitsMap.has(row.habits.id)) {
        habitsMap.set(row.habits.id, {
          ...row.habits,
          tags: [],
        });
      }
      if (row.tags?.id) {
        habitsMap.get(row.habits.id).tags.push({
          ...row.tags,
        });
      }
    });
    const habitDetails = habitsMap.get(habitId);
    res.status(habitDetails ? 200 : 404).json({
      message: habitDetails ? "Habit Details found" : "Habit Details not found",
      habitDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitsByTag = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: tagId } = req.params;
    const result = await db
      .select()
      .from(habits)
      .leftJoin(habitTags, eq(habits.id, habitTags.habitId))
      .leftJoin(tags, eq(habitTags.tagId, tags.id))
      .where(
        and(
          eq(habits.userId, userId),
          eq(habitTags.tagId, tagId),
          isNull(habits.deletedAt),
        ),
      );

    if (result.length == 0) {
      const error = new Error("habits not found by tag");
      error.status = 404;
      throw error;
    }

    const habitsMap = new Map();
    result.forEach((row) => {
      if (!habitsMap.has(row.habits.id)) {
        habitsMap.set(row.habits.id, {
          ...row.habits,
          tags: [],
        });
      }
      if (row.tags?.id) {
        habitsMap.get(row.habits.id).tags.push({
          ...row.tags,
        });
      }
    });

    const habitDetails = Array.from(habitsMap.values());

    res.status(200).json({
      message: "Habits found by tag",
      habits: habitDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const { tagIds, ...updates } = req.body;

    await db.transaction(async (tx) => {
      if (Object.keys(updates).length > 0) {
        const [updatedHabit] = await tx
          .update(habits)
          .set({
            ...updates,
          })
          .where(
            and(
              eq(habits.id, habitId),
              eq(habits.userId, userId),
              isNull(habits.deletedAt),
            ),
          )
          .returning();

        if (!updatedHabit) {
          const error = new Error("habit not found");
          error.status = 404;
          throw error;
        }
      }

      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, habitId));
      }

      if (tagIds?.length || 0 > 0) {
        const habitTagValues = tagIds.map((tagId) => ({
          habitId,
          tagId,
        }));
        await tx.insert(habitTags).values(habitTagValues);
      }
    });

    const result = await db
      .select()
      .from(habits)
      .leftJoin(habitTags, eq(habits.id, habitTags.habitId))
      .leftJoin(tags, eq(habitTags.tagId, tags.id))
      .where(
        and(
          eq(habits.id, habitId),
          eq(habits.userId, userId),
          isNull(habits.deletedAt),
        ),
      );

    const habitsMap = new Map();
    result.forEach((row) => {
      if (!habitsMap.has(row.habits.id)) {
        habitsMap.set(row.habits.id, {
          ...row.habits,
          tags: [],
        });
      }
      if (row.tags?.id) {
        habitsMap.get(row.habits.id).tags.push({
          ...row.tags,
        });
      }
    });
    const habitDetails = habitsMap.get(habitId);

    res.status(200).json({
      message: "habit updated successfully",
      habitDetails: habitDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const [deletedHabit] = await db
      .update(habits)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(habits.id, habitId),
          eq(habits.userId, userId),
          isNull(habits.deletedAt),
        ),
      )
      .returning();
    res.status(200).json({
      message: deletedHabit
        ? "habit deleted successfully"
        : "unable to delete habit",
    });
  } catch (error) {
    next(error);
  }
};

export const completeHabit = async (req, res, next) => {
  try {
    const { id: habitId } = req.params;
    const { note } = req.body;
    const { id: userId } = req.user;

    const [habitDetails] = await db
      .select()
      .from(habits)
      .where(
        and(
          eq(habits.id, habitId),
          eq(habits.userId, userId),
          isNull(habits.deletedAt),
        ),
      );

    if (!habitDetails) {
      const error = new Error("habit not found");
      error.status = 404;
      throw error;
    }

    if (!habitDetails.isActive) {
      const error = new Error("Cannot complete an inactive habit");
      error.status = 400;
      throw error;
    }

    const [newEntry] = await db
      .insert(entries)
      .values({
        habitId: habitId,
        ...(note && { note: note }),
      })
      .returning();

    res
      .status(200)
      .json({ message: "New entry added for habit", entry: newEntry });
  } catch (error) {
    next(error);
  }
};
