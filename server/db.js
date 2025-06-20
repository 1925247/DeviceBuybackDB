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
  max: 10, // Increase max connections for better performance
  min: 2, // Keep minimum connections
  idleTimeoutMillis: 60000, // Increase idle timeout
  connectionTimeoutMillis: 20000, // Increase timeout
  acquireTimeoutMillis: 20000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Create Drizzle ORM instance with proper type options
export const db = drizzle(pool, { schema });

console.log("Database connection initialized successfully");