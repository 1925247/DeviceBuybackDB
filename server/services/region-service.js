const { db } = require('../db');
const { eq, and, inArray } = require('drizzle-orm');
const { regions, partners, products, marketplaceListings } = require('../../shared/schema');

/**
 * Gets all regions
 * @param {boolean} activeOnly - Whether to return active regions only
 * @returns {Promise<array>} - Array of regions
 */
async function getAllRegions(activeOnly = true) {
  try {
    let query = db.select().from(regions);
    
    if (activeOnly) {
      query = query.where(eq(regions.active, true));
    }
    
    return await query.orderBy(regions.name);
    
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw error;
  }
}

/**
 * Gets a region by ID
 * @param {number} regionId - ID of the region
 * @returns {Promise<object>} - Region data
 */
async function getRegionById(regionId) {
  try {
    const [region] = await db
      .select()
      .from(regions)
      .where(eq(regions.id, regionId));
    
    if (!region) {
      throw new Error(`Region with ID ${regionId} not found`);
    }
    
    return region;
    
  } catch (error) {
    console.error('Error fetching region by ID:', error);
    throw error;
  }
}

/**
 * Creates a new region
 * @param {object} regionData - Region data
 * @returns {Promise<object>} - Created region
 */
async function createRegion(regionData) {
  try {
    const [region] = await db
      .insert(regions)
      .values({
        name: regionData.name,
        code: regionData.code,
        active: regionData.active !== undefined ? regionData.active : true,
      })
      .returning();
    
    return region;
    
  } catch (error) {
    console.error('Error creating region:', error);
    throw error;
  }
}

/**
 * Updates a region
 * @param {number} regionId - ID of the region to update
 * @param {object} regionData - Updated region data
 * @returns {Promise<object>} - Updated region
 */
async function updateRegion(regionId, regionData) {
  try {
    const [region] = await db
      .update(regions)
      .set({
        name: regionData.name,
        code: regionData.code,
        active: regionData.active,
        updated_at: new Date(),
      })
      .where(eq(regions.id, regionId))
      .returning();
    
    if (!region) {
      throw new Error(`Region with ID ${regionId} not found`);
    }
    
    return region;
    
  } catch (error) {
    console.error('Error updating region:', error);
    throw error;
  }
}

/**
 * Gets partners by region
 * @param {number} regionId - ID of the region
 * @returns {Promise<array>} - Array of partners in the region
 */
async function getPartnersByRegion(regionId) {
  try {
    // This is a more complex query that needs SQL to check for region ID in the regions array
    const partnersInRegion = await db.query(`
      SELECT * FROM partners 
      WHERE regions @> ARRAY[${regionId}]::int[] 
      AND status = 'active'
      ORDER BY name
    `);
    
    return partnersInRegion;
    
  } catch (error) {
    console.error('Error fetching partners by region:', error);
    throw error;
  }
}

/**
 * Gets products available in a specific region
 * @param {number} regionId - ID of the region
 * @returns {Promise<array>} - Array of products available in the region
 */
async function getProductsByRegion(regionId) {
  try {
    // For products with null or empty regions, they are available in all regions
    const productsInRegion = await db.query(`
      SELECT * FROM products 
      WHERE (regions IS NULL OR regions = '[]' OR regions @> ARRAY[${regionId}]::int[])
      AND status = 'active'
      ORDER BY title
    `);
    
    return productsInRegion;
    
  } catch (error) {
    console.error('Error fetching products by region:', error);
    throw error;
  }
}

/**
 * Gets marketplace listings available in a specific region
 * @param {number} regionId - ID of the region
 * @returns {Promise<array>} - Array of listings available in the region
 */
async function getMarketplaceListingsByRegion(regionId) {
  try {
    // For listings with null or empty regions, they are available in all regions
    const listingsInRegion = await db.query(`
      SELECT ml.*, d.name as device_name, d.manufacturer, d.model, d.condition
      FROM marketplace_listings ml
      JOIN devices d ON ml.device_id = d.id
      WHERE (ml.regions IS NULL OR ml.regions = '[]' OR ml.regions @> ARRAY[${regionId}]::int[])
      AND ml.status = 'active'
      ORDER BY ml.title
    `);
    
    return listingsInRegion;
    
  } catch (error) {
    console.error('Error fetching marketplace listings by region:', error);
    throw error;
  }
}

/**
 * Assigns regions to a product
 * @param {number} productId - ID of the product
 * @param {array} regionIds - Array of region IDs
 * @returns {Promise<object>} - Updated product
 */
async function assignRegionsToProduct(productId, regionIds) {
  try {
    const [product] = await db
      .update(products)
      .set({
        regions: regionIds,
        updated_at: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    return product;
    
  } catch (error) {
    console.error('Error assigning regions to product:', error);
    throw error;
  }
}

module.exports = {
  getAllRegions,
  getRegionById,
  createRegion,
  updateRegion,
  getPartnersByRegion,
  getProductsByRegion,
  getMarketplaceListingsByRegion,
  assignRegionsToProduct,
};