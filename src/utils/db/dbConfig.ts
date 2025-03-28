import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use non-pooled connection for migrations
const DATABASE_URL = "postgresql://greenhero_owner:npg_FnySlHt07rEv@ep-shrill-wildflower-a6rxvt60.us-west-2.aws.neon.tech/greenhero?sslmode=require";

if (!DATABASE_URL) {
  throw new Error('Database URL is not configured');
}

// Create neon client
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });