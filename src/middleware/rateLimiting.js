import redis from "../db/redis.js";
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimiting = async (req, res, next) => {
  try {
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "20 s"),
      analytics: true,
    });

    const identifier = req?.user?.id || req.ip || "anonymous_api_consumer";
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      const error = new Error("Unable to process at this time");
      error.status = 429;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
};
