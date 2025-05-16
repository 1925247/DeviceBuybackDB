import { sql } from "drizzle-orm";
import { pool } from "../server/db";

async function executeSql(query: string) {
  try {
    await pool.query(query);
    return true;
  } catch (error) {
    console.error(`SQL Error: ${error}`);
    return false;
  }
}

async function main() {
  try {
    console.log("Starting Q&A Management tables migration...");

    // Create question groups table
    const createQuestionGroupsTable = `
      CREATE TABLE IF NOT EXISTS question_groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        statement TEXT NOT NULL,
        device_type_id INTEGER REFERENCES device_types(id),
        icon TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await executeSql(createQuestionGroupsTable);
    console.log("Created question_groups table");

    // Create question type enum
    const createQuestionTypeEnum = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
          CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'text', 'number', 'boolean');
        END IF;
      END$$
    `;
    await executeSql(createQuestionTypeEnum);
    console.log("Created question_type enum");

    // Create questions table
    const createQuestionsTable = `
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'single_choice' NOT NULL,
        group_id INTEGER REFERENCES question_groups(id) ON DELETE CASCADE,
        "order" INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        tooltip TEXT,
        required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await executeSql(createQuestionsTable);
    console.log("Created questions table");

    // Create answer choices table
    const createAnswerChoicesTable = `
      CREATE TABLE IF NOT EXISTS answer_choices (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
        text TEXT NOT NULL,
        value TEXT NOT NULL,
        impact DECIMAL(10, 2) DEFAULT 0,
        is_default BOOLEAN DEFAULT FALSE,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await executeSql(createAnswerChoicesTable);
    console.log("Created answer_choices table");

    // Create product question mappings table
    const createProductQuestionMappingsTable = `
      CREATE TABLE IF NOT EXISTS product_question_mappings (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
        required BOOLEAN DEFAULT TRUE,
        impact_multiplier DECIMAL(5, 2) DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await executeSql(createProductQuestionMappingsTable);
    console.log("Created product_question_mappings table");

    // Add indexes for better performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_questions_group_id ON questions(group_id);
      CREATE INDEX IF NOT EXISTS idx_answer_choices_question_id ON answer_choices(question_id);
      CREATE INDEX IF NOT EXISTS idx_product_question_mappings_product_id ON product_question_mappings(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_question_mappings_question_id ON product_question_mappings(question_id)
    `;
    await executeSql(createIndexes);
    console.log("Created indexes for Q&A Management tables");

    console.log("Q&A Management tables migration completed successfully!");
  } catch (error) {
    console.error("Error during Q&A Management tables migration:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("Q&A Management tables migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });