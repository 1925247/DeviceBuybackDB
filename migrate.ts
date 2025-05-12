import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  console.log("Migration started");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migration completed");

  await sql.end();
}

main().catch((e) => {
  console.error("Migration failed");
  console.error(e);
  process.exit(1);
});
