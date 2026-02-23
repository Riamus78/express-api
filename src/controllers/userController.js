import { eq } from "drizzle-orm";
import db from "../db/connection.js";
import { users } from "../db/schema.js";
export const getUserDetails = async (req, res, next) => {
  try {
    const authenticatedUser = req.user;

    const [userDetails] = await db
      .select()
      .from(users)
      .where(eq(users.id, authenticatedUser.id));

    delete userDetails.password;

    res
      .status(200)
      .json({ message: "user details fetched", user: userDetails });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const [updatedUserDetails] = await db
      .update(users)
      .set({
        ...(firstName != undefined && { firstName: firstName }),
        ...(lastName != undefined && { lastName: lastName }),
      })
      .where(eq(users.id, req.user.id))
      .returning();
    delete updatedUserDetails.password;
    res.status(200).json({
      message: "user updated successfully",
      user: updatedUserDetails,
    });
  } catch (error) {
    next(error);
  }
};
