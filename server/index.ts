import express, { Express } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { db } from "./db.js";
import { sql } from 'drizzle-orm';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test database connection with retry logic
const testDatabaseConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log('Database URL defined:', !!process.env.DATABASE_URL);
      await db.execute(sql`SELECT 1 as test`);
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }
  }
  console.warn('Database connection failed, but continuing startup...');
  return false;
};

// Start server
(async () => {
  // Test database connection first
  await testDatabaseConnection();
  
  // Register API routes BEFORE starting server and Vite middleware
  await registerRoutes(app);
  
  const server = app.listen(5000, "0.0.0.0", () => {
    log(`serving on port 5000`);
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();