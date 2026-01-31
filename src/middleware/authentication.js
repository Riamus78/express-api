import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      const error = new Error("Bad request");
      error.status = 401;
      throw error;
    }

    const payload = await verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
