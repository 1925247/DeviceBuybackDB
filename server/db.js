import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log for debugging purposes
console.log("Database URL defined:", !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with proper SSL configuration and optimized settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 3, // Minimal connections
  min: 1, // Keep at least one connection
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 second timeout
  acquireTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Create Drizzle ORM instance with proper type options
export const db = drizzle(pool, { schema });

console.log("Database connection initialized successfully");