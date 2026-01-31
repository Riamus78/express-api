import { pathToFileURL } from "node:url";
import db from "./connection.js";
import { users, entries, habitTags, habits, tags } from "./schema.js";
import { hashPassword } from "../utils/password.js";

const seed = async () => {
  try {
    await db.delete(users);
    await db.delete(entries);
    await db.delete(habitTags);
    await db.delete(habits);
    await db.delete(tags);
    const hashedPassword = await hashPassword("Password@123456");
    const [demoUser] = await db
      .insert(users)
      .values({
        email: "testuser@test.com",
        password: hashedPassword,
        userName: "test",
        firstName: "test",
        lastName: "user",
      })
      .returning();

    const [tag] = await db
      .insert(tags)
      .values({
        name: "health",
        color: "#f0f0f0",
      })
      .returning();

    const [habit] = await db
      .insert(habits)
      .values({
        name: "exercise",
        description: "do exercise",
        frequency: "daily",
        targetCount: 1,
        userId: demoUser.id,
      })
      .returning();

    const [habitTag] = await db
      .insert(habitTags)
      .values({
        habitId: habit.id,
        tagId: tag.id,
      })
      .returning();

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await db.insert(entries).values({
        habitId: habit.id,
        note: "completed workout",
        completionDate: date,
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seed;
