import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Pooled Neon connection for app traffic; migrations use DATABASE_URL_UNPOOLED (drizzle.config.ts)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Lets Fluid Compute close idle clients before an instance is suspended
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
