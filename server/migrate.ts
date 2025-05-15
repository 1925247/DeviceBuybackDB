import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { SQL } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export async function migrate(migrationQuery: SQL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await pool.query(migrationQuery.toString());
    console.log('Migration executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}