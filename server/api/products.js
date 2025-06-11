import { Router } from 'express';
import { db } from '../db.js';
import { deviceModels, brands, deviceTypes } from '../../shared/schema.js';
import { eq, like } from 'drizzle-orm';

const router = Router();

// Get all products (device models)
router.get('/', async (req, res) => {
  try {
    const { search, brand, deviceType } = req.query;
    
    let query = db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        slug: deviceModels.slug,
        image: deviceModels.image,
        active: deviceModels.active,
        featured: deviceModels.featured,
        variants: deviceModels.variants,
        brandId: deviceModels.brand_id,
        brandName: brands.name,
        brandSlug: brands.slug,
        deviceTypeId: deviceModels.device_type_id,
        deviceTypeName: deviceTypes.name,
        deviceTypeSlug: deviceTypes.slug
      })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .where(eq(deviceModels.active, true));

    // Apply filters
    if (search) {
      query = query.where(like(deviceModels.name, `%${search}%`));
    }
    
    if (brand) {
      query = query.where(eq(brands.slug, brand));
    }
    
    if (deviceType) {
      query = query.where(eq(deviceTypes.slug, deviceType));
    }
    
    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        slug: deviceModels.slug,
        image: deviceModels.image,
        active: deviceModels.active,
        featured: deviceModels.featured,
        variants: deviceModels.variants,
        brandId: deviceModels.brand_id,
        brandName: brands.name,
        brandSlug: brands.slug,
        deviceTypeId: deviceModels.device_type_id,
        deviceTypeName: deviceTypes.name,
        deviceTypeSlug: deviceTypes.slug,
        createdAt: deviceModels.createdAt,
        updatedAt: deviceModels.updatedAt
      })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .where(eq(deviceModels.id, parseInt(id)))
      .limit(1);
    
    if (!product.length) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Get featured products
router.get('/featured', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        slug: deviceModels.slug,
        image: deviceModels.image,
        brandName: brands.name,
        deviceTypeName: deviceTypes.name
      })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .where(eq(deviceModels.featured, true))
      .limit(12);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
});

export default router;