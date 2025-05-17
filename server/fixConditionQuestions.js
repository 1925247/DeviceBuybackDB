/**
 * This script ensures that all device models have proper condition question mappings
 * to ensure they appear correctly in the condition assessment page.
 */
import pg from 'pg';
const { Pool } = pg;

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Array of popular device models that we want to ensure have question mappings
const deviceModels = [
  {
    name: 'Samsung Galaxy S21',
    slug: 'samsung-galaxy-s21',
    image: '/images/devices/samsung-s21.jpg',
    brand_id: 2,  // Samsung
    device_type_id: 1, // Smartphone
    variants: ['128GB', '256GB'],
    sku_prefix: 'SGS21'
  },
  {
    name: 'Galaxy S23 Ultra', // Match the existing name in the database
    slug: 'galaxy-s23-ultra', // Match the existing slug in the database
    image: '/assets/models/galaxy-s23-ultra.png',
    brand_id: 2,  // Samsung
    device_type_id: 1, // Smartphone
    variants: ['256GB', '512GB', '1TB'],
    sku_prefix: 'SGS23U'
  },
  {
    name: 'iPhone 13',
    slug: 'iphone-13',
    image: '/assets/models/iphone-13.png',
    brand_id: 1,  // Apple
    device_type_id: 1, // Smartphone
    variants: ['128GB', '256GB', '512GB'],
    sku_prefix: 'IP13'
  }
];

async function ensureDeviceModel(model) {
  // 1. Check if the device model exists
  console.log(`Checking if ${model.name} model exists...`);
  
  const modelResult = await pool.query(`
    SELECT id, name, slug FROM device_models 
    WHERE name = $1 OR slug = $2
  `, [model.name, model.slug]);
  
  let modelId;
  
  if (modelResult.rows.length === 0) {
    console.log(`${model.name} model not found, creating it`);
    const newModel = await pool.query(`
      INSERT INTO device_models (
        name, 
        slug, 
        image, 
        brand_id, 
        device_type_id, 
        active, 
        featured, 
        variants
      ) VALUES (
        $1, $2, $3, $4, $5, true, true, $6::json
      ) RETURNING id, name, slug
    `, [model.name, model.slug, model.image, model.brand_id, model.device_type_id, JSON.stringify(model.variants)]);
    
    modelId = newModel.rows[0].id;
    console.log(`Created new model: ${newModel.rows[0].name} with ID ${modelId}`);
  } else {
    modelId = modelResult.rows[0].id;
    console.log(`Found existing ${model.name} model with ID ${modelId}`);
  }
  
  return modelId;
}

async function ensureProduct(model, modelId) {
  // 2. Check if there is a product for this model
  console.log(`Checking if a product exists for ${model.name}...`);
  
  const productResult = await pool.query(`
    SELECT id, title FROM products WHERE device_model_id = $1 OR title = $2
  `, [modelId, model.name]);
  
  let productId;
  
  if (productResult.rows.length === 0) {
    console.log(`No product found for ${model.name}, creating one`);
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
        $1, 
        $2, 
        $3, 
        699.99, 
        $4, 
        'active', 
        true, 
        true, 
        $5, 
        NOW(), 
        NOW()
      ) RETURNING id, title
    `, [model.name, model.slug, `${model.name} smartphone`, `${model.sku_prefix}-001`, modelId]);
    
    productId = newProduct.rows[0].id;
    console.log(`Created product: ${newProduct.rows[0].title} with ID ${productId}`);
  } else {
    productId = productResult.rows[0].id;
    console.log(`Found existing product: ${productResult.rows[0].title} with ID ${productId}`);
  }
  
  return productId;
}

async function ensureQuestionMappings(model, productId) {
  // 3. Check if the product is mapped to condition questions
  console.log(`Checking if ${model.name} has condition question mappings...`);
  
  const mappingResult = await pool.query(`
    SELECT pqm.id, pqm.product_id, pqm.question_id, pqm.group_id 
    FROM product_question_mappings pqm
    WHERE pqm.product_id = $1
  `, [productId]);
  
  if (mappingResult.rows.length === 0) {
    console.log(`No condition questions mapped to ${model.name}, adding mappings`);
    
    // Get standard condition question groups
    const groupsResult = await pool.query(`
      SELECT id, name FROM question_groups
      WHERE id IN (2, 3, 4, 5)  -- Standard condition group IDs
    `);
    
    if (groupsResult.rows.length > 0) {
      console.log(`Found question groups to map: ${groupsResult.rows.map(g => g.name).join(', ')}`);
      
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
        
        console.log(`Mapped ${questionsResult.rows.length} questions from group "${group.name}" to ${model.name}`);
      }
    } else {
      console.log(`No question groups found to map to ${model.name}`);
    }
  } else {
    console.log(`Found ${mappingResult.rows.length} existing question mappings for ${model.name}`);
  }
}

async function run() {
  console.log('Ensuring all device models have proper condition question mappings...');
  
  try {
    // Process each device model
    for (const model of deviceModels) {
      console.log(`\n--- Processing ${model.name} ---`);
      
      // 1. Ensure the device model exists
      const modelId = await ensureDeviceModel(model);
      
      // 2. Ensure a product exists for this model
      const productId = await ensureProduct(model, modelId);
      
      // 3. Ensure the product has question mappings
      await ensureQuestionMappings(model, productId);
      
      console.log(`--- Completed processing ${model.name} ---\n`);
    }
    
    console.log('Device models and condition questions setup completed successfully');
  } catch (err) {
    console.error('Error setting up device models and condition questions:', err);
  } finally {
    await pool.end();
  }
}

run();