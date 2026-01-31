import { Pool } from "pg";
import { env, isProduction } from "../../env.js";
import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
  });
};

let client;
if (isProduction()) {
  client = createPool();
} else {
  client = remember("dbPool", () => createPool());
}

export const db = drizzle({ client, schema });

export default db;
