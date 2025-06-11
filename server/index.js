import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { db } from "./db.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test database connection
try {
  console.log('Database URL defined:', !!process.env.DATABASE_URL);
  await db.execute('SELECT 1');
  console.log('Database connection initialized successfully');
} catch (error) {
  console.error('Database connection failed:', error.message);
}

(async () => {
  const server = app.listen(5000, "0.0.0.0", () => {
    log(`serving on port 5000`);
  });

  registerRoutes(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();