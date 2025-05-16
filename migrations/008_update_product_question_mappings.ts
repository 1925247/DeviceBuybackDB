import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function executeSql(query: string) {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    await client.query(query);
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('Starting migration: Add group_id to product_question_mappings table');

    // First check if column already exists
    const checkColumnQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'product_question_mappings' 
        AND column_name = 'group_id'
      );
    `;

    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    const result = await client.query(checkColumnQuery);
    const columnExists = result.rows[0].exists;
    
    if (!columnExists) {
      // Add the group_id column to the product_question_mappings table
      const addGroupIdColumnQuery = `
        ALTER TABLE product_question_mappings 
        ADD COLUMN group_id INTEGER REFERENCES question_groups(id) ON DELETE CASCADE;
      `;
      await client.query(addGroupIdColumnQuery);
      console.log('Added group_id column to product_question_mappings table');
    } else {
      console.log('group_id column already exists in product_question_mappings table, skipping');
    }
    
    // Create index for better performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_product_question_mappings_group_id 
      ON product_question_mappings(group_id);
    `;
    await client.query(createIndexQuery);
    console.log('Created index for group_id in product_question_mappings table');
    
    await client.end();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });