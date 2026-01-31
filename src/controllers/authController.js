import db from "../db/connection.js";
import { users } from "../db/schema.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { and, eq, isNull } from "drizzle-orm";

export const register = async (req, res, next) => {
  try {
    const { email, password, userName, firstName, lastName } = req.body;
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email,
        password: hashedPassword,
        userName: userName,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
      })
      .returning();

    delete newUser.password;

    const token = await generateToken(newUser);

    res.status(200).json({
      message: "new user created successfully",
      user: newUser,
      jwt: token,
    });
  } catch (e) {
    if (e.cause && e.cause.code == "23505") {
      const error = new Error(
        "Account with this email or username already exists",
      );
      error.status = 409;
      next(error);
    } else {
      next(e);
    }
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // const [user] = await db.select().from(users).where(eq(users.email, email));
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)));
    if (!user) {
      const error = new Error("Invalid Credentials");
      error.status = 400;
      throw error;
    }
    // console.log(user);
    const validatedUser = await comparePassword(password, user.password);

    if (!validatedUser) {
      const error = new Error("Invalid Credentials");
      error.status = 400;
      throw error;
    }

    delete user.password;

    const token = await generateToken(user);

    res.status(200).json({
      message: "user logged in",
      user,
      token,
    });
  } catch (e) {
    next(e);
  }
};
