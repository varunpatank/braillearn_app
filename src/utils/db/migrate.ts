import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://greenhero_owner:npg_FnySlHt07rEv@ep-shrill-wildflower-a6rxvt60.us-west-2.aws.neon.tech/greenhero?sslmode=require";

// Use non-pooled connection for migrations
const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main();