import { SQL, sql } from "drizzle-orm";
import { db, pool } from "../server/db";

async function executeSql(query: string) {
  try {
    console.log(`Executing: ${query.substring(0, 100)}...`);
    const result = await pool.query(query);
    console.log(`✓ Success: ${result.rowCount || 0} rows affected`);
    return result;
  } catch (error) {
    console.error(`✗ Error executing SQL:`, error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting migration: Create Device Question Mappings Tables");

  try {
    // Create device_question_mappings table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS device_question_mappings (
        id SERIAL PRIMARY KEY,
        model_id INTEGER NOT NULL REFERENCES device_models(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(model_id, question_id)
      );
    `);

    // Create index for better query performance
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_device_question_mappings_model 
      ON device_question_mappings(model_id);
    `);

    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_device_question_mappings_question 
      ON device_question_mappings(question_id);
    `);

    // Update product_question_mappings table to reference device_models instead of products
    await executeSql(`
      CREATE TABLE IF NOT EXISTS product_question_mappings (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES device_models(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(product_id, question_id)
      );
    `);

    // Create indexes for product_question_mappings
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_product_question_mappings_product 
      ON product_question_mappings(product_id);
    `);

    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_product_question_mappings_question 
      ON product_question_mappings(question_id);
    `);

    // Migrate any existing product-question mappings to device model mappings
    const existingMappings = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'product_question_mappings';
    `);

    if (existingMappings.rows[0]?.count > 0) {
      console.log("📦 Migrating existing product-question mappings...");
      
      // Copy existing mappings if any exist
      await executeSql(`
        INSERT INTO device_question_mappings (model_id, question_id, active, created_at, updated_at)
        SELECT product_id, question_id, active, created_at, updated_at
        FROM product_question_mappings
        WHERE product_id IN (SELECT id FROM device_models)
        ON CONFLICT (model_id, question_id) DO NOTHING;
      `);
    }

    // Create sample mappings for existing device models and questions
    console.log("🔗 Creating sample question mappings for device models...");
    
    const sampleMappings = await pool.query(`
      WITH device_model_sample AS (
        SELECT dm.id as model_id, dt.id as device_type_id
        FROM device_models dm
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dm.active = true
        LIMIT 10
      ),
      question_sample AS (
        SELECT q.id as question_id, qg.device_type_id
        FROM questions q
        LEFT JOIN question_groups qg ON q.group_id = qg.id
        WHERE q.active = true
        LIMIT 20
      )
      INSERT INTO device_question_mappings (model_id, question_id, active)
      SELECT dms.model_id, qs.question_id, true
      FROM device_model_sample dms
      CROSS JOIN question_sample qs
      WHERE qs.device_type_id IS NULL OR qs.device_type_id = dms.device_type_id
      ON CONFLICT (model_id, question_id) DO NOTHING
      RETURNING model_id, question_id;
    `);

    console.log(`✅ Created ${sampleMappings.rowCount || 0} sample question mappings`);

    // Create a summary view for easy querying
    await executeSql(`
      CREATE OR REPLACE VIEW device_model_question_summary AS
      SELECT 
        dm.id as model_id,
        dm.name as model_name,
        b.name as brand_name,
        dt.name as device_type_name,
        COUNT(dqm.question_id) as question_count,
        ARRAY_AGG(q.question_text ORDER BY q.order) as questions
      FROM device_models dm
      LEFT JOIN brands b ON dm.brand_id = b.id
      LEFT JOIN device_types dt ON dm.device_type_id = dt.id
      LEFT JOIN device_question_mappings dqm ON dm.id = dqm.model_id AND dqm.active = true
      LEFT JOIN questions q ON dqm.question_id = q.id AND q.active = true
      WHERE dm.active = true
      GROUP BY dm.id, dm.name, b.name, dt.name
      ORDER BY dm.name;
    `);

    console.log("📊 Created device_model_question_summary view");

    // Get final statistics
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM device_models WHERE active = true) as total_models,
        (SELECT COUNT(*) FROM questions WHERE active = true) as total_questions,
        (SELECT COUNT(*) FROM device_question_mappings WHERE active = true) as total_mappings,
        (SELECT COUNT(DISTINCT model_id) FROM device_question_mappings WHERE active = true) as models_with_questions
    `);

    const stat = stats.rows[0];
    console.log("📈 Migration Statistics:");
    console.log(`   • Total Device Models: ${stat.total_models}`);
    console.log(`   • Total Questions: ${stat.total_questions}`);
    console.log(`   • Total Mappings: ${stat.total_mappings}`);
    console.log(`   • Models with Questions: ${stat.models_with_questions}`);

    console.log("✅ Migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export default main;