// Script to clean up dummy/test data from the database
const { db } = require('./server/db');
const { sql } = require('drizzle-orm');

async function cleanupDummyData() {
  console.log('Starting database cleanup...');
  
  try {
    // Begin transaction
    await db.execute(sql`BEGIN`);
    
    // Delete dummy shop entries
    console.log('Removing dummy shop entries...');
    const deletedShops = await db.execute(
      sql`DELETE FROM shops WHERE name LIKE 'Shop No%' OR name LIKE 'Test Shop%' RETURNING id`
    );
    console.log(`Deleted ${deletedShops.rowCount} dummy shop entries`);
    
    // Delete dummy sale entries
    console.log('Removing dummy sale entries...');
    const deletedSales = await db.execute(
      sql`DELETE FROM sales WHERE reference LIKE 'Sale No%' OR reference LIKE 'Test Sale%' RETURNING id`
    );
    console.log(`Deleted ${deletedSales.rowCount} dummy sale entries`);
    
    // Delete placeholder products
    console.log('Removing placeholder product entries...');
    const deletedProducts = await db.execute(
      sql`DELETE FROM products WHERE title LIKE 'Placeholder%' OR title LIKE 'Test Product%' OR description LIKE '%placeholder%' RETURNING id`
    );
    console.log(`Deleted ${deletedProducts.rowCount} placeholder product entries`);
    
    // Delete any test buyback requests
    console.log('Removing test buyback requests...');
    const deletedBuybacks = await db.execute(
      sql`DELETE FROM buyback_requests WHERE customer_name LIKE 'Test%' OR customer_email LIKE 'test%@%' RETURNING id`
    );
    console.log(`Deleted ${deletedBuybacks.rowCount} test buyback requests`);
    
    // Commit transaction
    await db.execute(sql`COMMIT`);
    console.log('Database cleanup completed successfully');
    
  } catch (error) {
    // Rollback in case of error
    await db.execute(sql`ROLLBACK`);
    console.error('Error during database cleanup:', error);
  }
}

// Run the cleanup
cleanupDummyData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });