import { env as loadEnv } from "custom-env";
import z, { ZodError } from "zod";

process.env.APP_STAGE = process.env.APP_STAGE || "dev";

const isProd = process.env.APP_STAGE == "prod";
const isDev = process.env.APP_STAGE == "dev";
const isTest = process.env.APP_STAGE == "test";

if (isDev) {
  loadEnv();
} else if (isTest) {
  loadEnv("test");
}

const envSchema = z.object({
  APP_STAGE: z.enum(["prod", "dev", "test"]).default("dev"),
  NODE_ENV: z
    .enum(["production", "development", "testing"])
    .default("development"),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  PORT: z.coerce.number().positive().default(3000),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
  UPSTASH_REDIS_REST_URL: z.string().min("1", "cannot be empty"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min("1", "cannot be empty"),
});

/**
 * @typedef {object} Env
 * @property {'production' | 'development' | 'testing'} NODE_ENV
 * @property {'prod' | 'dev' | 'test'} APP_STAGE
 * @property {number} PORT
 * @property {string} DATABASE_URL
 * @property {string} JWT_SECRET
 * @property {string} JWT_EXPIRES_IN
 * @property {number} BCRYPT_ROUNDS
 * @property {string} UPSTASH_REDIS_REST_URL
 * @property {string} UPSTASH_REDIS_REST_TOKEN
 */

/** @type {Env} */

let env;
try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof ZodError) {
    console.error("invalid env variables");
    console.log(e.flatten().fieldErrors, null, 2);
    e.issues.forEach((e) => {
      console.log(e.path.join("."));
      console.log(e.message);
    });
    process.exit(1);
  }
  throw e;
}

export const isProduction = () => process.env.APP_STAGE === "prod";
export const isDevelopment = () => process.env.APP_STAGE === "development";
export const isTesting = () => process.env.APP_STAGE === "testing";

export { env };

export default env;
