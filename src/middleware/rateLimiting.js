import redis from "../db/redis.js";
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimiting = async (req, res, next) => {
  try {
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(10, "30 s"),
    });

    const identifier = req?.user?.id || req.ip || "anonymous_api_consumer";
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      const error = new Error("too many requests,");
      error.status = 429;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
};
