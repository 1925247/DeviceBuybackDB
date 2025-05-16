import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure neon with websocket
neonConfig.webSocketConstructor = ws;

// Log for debugging purposes
console.log("Database URL defined:", !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with proper SSL configuration for Neon database
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some cloud environments
  }
});

// Create Drizzle ORM instance with proper type options
export const db = drizzle(pool, { schema });

console.log("Database connection initialized successfully");