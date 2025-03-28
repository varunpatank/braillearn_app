import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const DATABASE_URL = "postgresql://greenhero_owner:npg_FnySlHt07rEv@ep-shrill-wildflower-a6rxvt60-pooler.us-west-2.aws.neon.tech/greenhero?sslmode=require";

if (!DATABASE_URL) {
  throw new Error('Database URL is not configured');
}

const sql = neon(DATABASE_URL);

// Add error handling for database connection
sql.on('error', (err) => {
  console.error('Database connection error:', err);
});

export const db = drizzle(sql, { schema });