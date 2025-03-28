import type { Config } from 'drizzle-kit';

export default {
  schema: './src/utils/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgresql://greenhero_owner:npg_FnySlHt07rEv@ep-shrill-wildflower-a6rxvt60-pooler.us-west-2.aws.neon.tech/greenhero?sslmode=require",
  },
  verbose: true,
  strict: true,
} satisfies Config;