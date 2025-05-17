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
    console.log("Starting Q&A tables fix migration...");

    // Update question_type enum to include text_input
    const updateQuestionTypeEnum = `
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
          ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'text_input';
        ELSE
          CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'text_input');
        END IF;
      END$$
    `;
    await executeSql(updateQuestionTypeEnum);
    console.log("Updated question_type enum");

    // Update questions table to use the enum
    const updateQuestionsTable = `
      DO $$
      BEGIN
        -- First, try to fix existing data by replacing 'text' or 'number' with 'text_input'
        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'questions' AND COLUMN_NAME = 'question_type') THEN
          UPDATE questions 
          SET question_type = 'text_input'
          WHERE question_type IN ('text', 'number');
        END IF;
      END$$
    `;
    await executeSql(updateQuestionsTable);
    console.log("Updated existing question_type values");

    // Update answer_choices table with more fields
    const updateAnswerChoicesTable = `
      DO $$
      BEGIN
        -- Add missing columns to answer_choices if they don't exist
        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'answer_choices') THEN
          -- Add icon field
          IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answer_choices' AND COLUMN_NAME = 'icon') THEN
            ALTER TABLE answer_choices ADD COLUMN icon TEXT;
          END IF;
          
          -- Add weightage field
          IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answer_choices' AND COLUMN_NAME = 'weightage') THEN
            ALTER TABLE answer_choices ADD COLUMN weightage INTEGER DEFAULT 0;
          END IF;
          
          -- Add repair_cost field
          IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answer_choices' AND COLUMN_NAME = 'repair_cost') THEN
            ALTER TABLE answer_choices ADD COLUMN repair_cost DECIMAL(10, 2) DEFAULT 0;
          END IF;
          
          -- Add follow_up_action field
          IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answer_choices' AND COLUMN_NAME = 'follow_up_action') THEN
            ALTER TABLE answer_choices ADD COLUMN follow_up_action TEXT;
          END IF;
          
          -- Rename text to answer_text for better clarity
          IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answer_choices' AND COLUMN_NAME = 'text') 
             AND NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answer_choices' AND COLUMN_NAME = 'answer_text') THEN
            ALTER TABLE answer_choices RENAME COLUMN text TO answer_text;
          END IF;
        END IF;
      END$$
    `;
    await executeSql(updateAnswerChoicesTable);
    console.log("Updated answer_choices table structure");

    // Create model_question_mappings table if it doesn't exist
    const createModelQuestionMappingsTable = `
      CREATE TABLE IF NOT EXISTS model_question_mappings (
        id SERIAL PRIMARY KEY,
        model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        question_group_id INTEGER REFERENCES question_groups(id) ON DELETE CASCADE,
        required BOOLEAN DEFAULT TRUE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT model_question_unique UNIQUE(model_id, question_id)
      )
    `;
    await executeSql(createModelQuestionMappingsTable);
    console.log("Created/checked model_question_mappings table");

    // Create indexes for better performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_model_question_mappings_model_id ON model_question_mappings(model_id);
      CREATE INDEX IF NOT EXISTS idx_model_question_mappings_question_id ON model_question_mappings(question_id);
      CREATE INDEX IF NOT EXISTS idx_model_question_mappings_group_id ON model_question_mappings(question_group_id);
    `;
    await executeSql(createIndexes);
    console.log("Created indexes for model_question_mappings");

    console.log("Q&A tables fix migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main()
  .then(() => {
    console.log("Migration script executed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });