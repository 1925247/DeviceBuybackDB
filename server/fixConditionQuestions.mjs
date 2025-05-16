/**
 * This script manually injects the Samsung Galaxy S21 questions into the database
 * to ensure they appear properly in the condition assessment page.
 */
import pg from 'pg';
const { Pool } = pg;

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  console.log('Fixing Samsung Galaxy S21 condition questions');
  
  try {
    // 1. Check if Samsung Galaxy S21 model exists
    const modelResult = await pool.query(`
      SELECT id, name, slug FROM device_models 
      WHERE name = 'Samsung Galaxy S21' OR slug = 'samsung-galaxy-s21'
    `);
    
    if (modelResult.rows.length === 0) {
      console.log('Samsung Galaxy S21 model not found, creating it');
      const newModel = await pool.query(`
        INSERT INTO device_models (name, slug, image, brand_id, device_type_id, active, featured, variants)
        VALUES ('Samsung Galaxy S21', 'samsung-galaxy-s21', '/images/devices/samsung-s21.jpg', 2, 1, true, true, '["128GB", "256GB"]'::json)
        RETURNING id, name, slug
      `);
      console.log('Created new model:', newModel.rows[0]);
    } else {
      console.log('Found existing Samsung Galaxy S21 model:', modelResult.rows[0]);
    }
    
    // 2. Check if there is a product for this model
    const s21ModelId = modelResult.rows.length > 0 ? modelResult.rows[0].id : null;
    
    if (s21ModelId) {
      const productResult = await pool.query(`
        SELECT id, title FROM products WHERE device_model_id = $1 OR title = 'Samsung Galaxy S21'
      `, [s21ModelId]);
      
      let productId;
      
      if (productResult.rows.length === 0) {
        console.log('No product found for Samsung Galaxy S21, creating one');
        const newProduct = await pool.query(`
          INSERT INTO products (
            title, 
            slug, 
            description, 
            price, 
            sku,
            status, 
            is_physical, 
            requires_shipping,
            device_model_id,
            created_at, 
            updated_at
          ) VALUES (
            'Samsung Galaxy S21', 
            'samsung-galaxy-s21', 
            'Samsung Galaxy S21 smartphone', 
            699.99, 
            'SGS21-01',
            'active', 
            true, 
            true,
            $1,
            NOW(), 
            NOW()
          ) RETURNING id, title
        `, [s21ModelId]);
        
        productId = newProduct.rows[0].id;
        console.log('Created new product:', newProduct.rows[0]);
      } else {
        productId = productResult.rows[0].id;
        console.log('Found existing product:', productResult.rows[0]);
      }
      
      // 3. Check if we have question mappings for this product
      const mappingResult = await pool.query(`
        SELECT pqm.id, pqm.product_id, pqm.question_id, pqm.group_id, q.text
        FROM product_question_mappings pqm
        JOIN questions q ON pqm.question_id = q.id
        WHERE pqm.product_id = $1
      `, [productId]);
      
      if (mappingResult.rows.length === 0) {
        console.log('No question mappings found for Samsung Galaxy S21, creating default mappings');
        
        // Get a list of condition question groups
        const groupsResult = await pool.query(`
          SELECT id, name FROM question_groups
          WHERE id IN (2, 3, 4, 5)  -- Standard condition group IDs
        `);
        
        if (groupsResult.rows.length > 0) {
          console.log('Found question groups to map:', groupsResult.rows.map(g => g.name).join(', '));
          
          // For each group, get the questions and map them to the product
          for (const group of groupsResult.rows) {
            const questionsResult = await pool.query(`
              SELECT id FROM questions WHERE group_id = $1
            `, [group.id]);
            
            for (const question of questionsResult.rows) {
              await pool.query(`
                INSERT INTO product_question_mappings (
                  product_id, question_id, group_id, required, impact_multiplier, created_at, updated_at
                ) VALUES (
                  $1, $2, $3, true, 1.0, NOW(), NOW()
                ) ON CONFLICT (product_id, question_id) DO NOTHING
              `, [productId, question.id, group.id]);
            }
            
            console.log(`Mapped ${questionsResult.rows.length} questions from group "${group.name}" to Samsung Galaxy S21`);
          }
        } else {
          console.log('No question groups found to map to Samsung Galaxy S21');
        }
      } else {
        console.log(`Found ${mappingResult.rows.length} existing question mappings for Samsung Galaxy S21`);
      }

      // 4. Also update the model ID in case frontend is looking for ID 2 (which appears to be the case)
      const modelFixResult = await pool.query(`
        SELECT id, name FROM device_models WHERE id = 2
      `);
      
      if (modelFixResult.rows.length > 0) {
        console.log(`Model ID 2 is currently: ${modelFixResult.rows[0].name}`);
        
        // Check if there are questions mapped to a product with this model ID
        const modelIdProductsResult = await pool.query(`
          SELECT COUNT(*) as count FROM products WHERE device_model_id = 2
        `);
        
        if (modelIdProductsResult.rows[0].count === '0') {
          console.log('No products using model ID 2, updating Samsung Galaxy S21 to use ID 2');
          
          // Create a copy of the Samsung Galaxy S21 product that points to model ID 2
          await pool.query(`
            INSERT INTO products (
              title, 
              slug, 
              description, 
              price, 
              sku,
              status, 
              is_physical, 
              requires_shipping,
              device_model_id,
              created_at, 
              updated_at
            ) VALUES (
              'Samsung Galaxy S21 (ID 2)', 
              'samsung-galaxy-s21-id2', 
              'Samsung Galaxy S21 smartphone (ID 2)', 
              699.99, 
              'SGS21-ID2',
              'active', 
              true, 
              true,
              2,
              NOW(), 
              NOW()
            ) ON CONFLICT DO NOTHING
          `);
          
          // Copy the question mappings from the original product to this new one
          const newProductResult = await pool.query(`
            SELECT id FROM products WHERE slug = 'samsung-galaxy-s21-id2'
          `);
          
          if (newProductResult.rows.length > 0) {
            const newProductId = newProductResult.rows[0].id;
            console.log(`Created backup product with ID: ${newProductId} linked to model ID 2`);
            
            // Copy the mappings
            await pool.query(`
              INSERT INTO product_question_mappings (
                product_id, question_id, group_id, required, impact_multiplier, created_at, updated_at
              )
              SELECT 
                $1, question_id, group_id, required, impact_multiplier, NOW(), NOW()
              FROM 
                product_question_mappings
              WHERE 
                product_id = $2
              ON CONFLICT DO NOTHING
            `, [newProductId, productId]);
            
            console.log('Copied question mappings to the backup product');
          }
        } else {
          console.log(`Model ID 2 already has ${modelIdProductsResult.rows[0].count} products associated with it`);
        }
      }
    }
    
    console.log('Samsung Galaxy S21 condition questions setup completed successfully');
  } catch (err) {
    console.error('Error fixing Samsung Galaxy S21 condition questions:', err);
  } finally {
    await pool.end();
  }
}

run();