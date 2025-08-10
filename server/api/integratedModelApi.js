import { db } from '../db.js';
import { deviceModels, brands, deviceTypes, deviceModelVariants, questionGroups, groupModelMappings, variantQuestionMappings } from '../../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';

// POST /admin/models - Create new model
export const createModel = async (req, res) => {
  try {
    const { name, slug, brandId, deviceTypeId, image, description, featured, active } = req.body;
    
    // Generate slug if not provided
    const modelSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const [newModel] = await db.insert(deviceModels).values({
      name,
      slug: modelSlug,
      brandId: parseInt(brandId),
      deviceTypeId: parseInt(deviceTypeId),
      image: image || null,
      description: description || null,
      featured: featured || false,
      active: active !== false
    }).returning();

    // Fetch the complete model with brand and device type info
    const completeModel = await db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        slug: deviceModels.slug,
        brandId: deviceModels.brandId,
        deviceTypeId: deviceModels.deviceTypeId,
        image: deviceModels.image,
        description: deviceModels.description,
        featured: deviceModels.featured,
        active: deviceModels.active,
        brandName: brands.name,
        deviceTypeName: deviceTypes.name
      })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brandId, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.deviceTypeId, deviceTypes.id))
      .where(eq(deviceModels.id, newModel.id))
      .limit(1);

    // Fetch existing variants for this model
    const modelVariants = await db
      .select()
      .from(deviceModelVariants)
      .where(eq(deviceModelVariants.modelId, newModel.id));

    const modelWithVariants = {
      ...completeModel[0],
      variants: modelVariants
    };

    res.status(201).json(modelWithVariants);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create model' });
  }
};

// POST /admin/models/:modelId/variants - Add variant to model
export const addVariant = async (req, res) => {
  try {
    const { modelId } = req.params;
    const { name, basePrice, storage, color, condition } = req.body;

    // Check if model exists
    const modelExists = await db.select().from(deviceModels).where(eq(deviceModels.id, parseInt(modelId))).limit(1);
    if (modelExists.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const [newVariant] = await db.insert(deviceModelVariants).values({
      modelId: parseInt(modelId),
      name,
      basePrice: parseFloat(basePrice),
      storage: storage || null,
      color: color || null,
      condition: condition || 'excellent',
      active: true
    }).returning();

    res.json(newVariant);
  } catch (error) {
    console.error('Error adding variant:', error);
    res.status(500).json({ error: 'Failed to add variant' });
  }
};

// GET /admin/variants/:variantId/mappings - Get variant question mappings
export const getVariantMappings = async (req, res) => {
  try {
    const { variantId } = req.params;

    const mappings = await db
      .select({
        groupId: questionGroups.id,
        groupName: questionGroups.name,
        mapped: sql`CASE WHEN ${variantQuestionMappings.variantId} IS NOT NULL THEN true ELSE false END`.as('mapped')
      })
      .from(questionGroups)
      .leftJoin(variantQuestionMappings, 
        and(
          eq(variantQuestionMappings.variantId, parseInt(variantId)),
          eq(variantQuestionMappings.groupId, questionGroups.id)
        )
      )
      .where(eq(questionGroups.active, true));

    res.json(mappings);
  } catch (error) {
    console.error('Error fetching variant mappings:', error);
    res.status(500).json({ error: 'Failed to fetch mappings' });
  }
};

// POST /admin/variants/:variantId/map-questions - Map questions to variant
export const mapQuestionsToVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const mappingData = req.body;

    // First, remove existing mappings for this variant
    await db.delete(variantQuestionMappings).where(eq(variantQuestionMappings.variantId, parseInt(variantId)));

    // Add new mappings based on selected groups
    const newMappings = [];
    for (const [key, value] of Object.entries(mappingData)) {
      if (key.startsWith('group-') && value === true) {
        const groupId = parseInt(key.replace('group-', ''));
        newMappings.push({
          variantId: parseInt(variantId),
          groupId: groupId,
          active: true
        });
      }
    }

    if (newMappings.length > 0) {
      await db.insert(variantQuestionMappings).values(newMappings);
    }

    res.json({ success: true, mappedGroups: newMappings.length });
  } catch (error) {
    console.error('Error mapping questions to variant:', error);
    res.status(500).json({ error: 'Failed to map questions' });
  }
};

// GET /models/:modelId/variants - Get model variants with mappings (for frontend)
export const getModelVariants = async (req, res) => {
  try {
    const { modelId } = req.params;

    const variants = await db
      .select({
        id: deviceModelVariants.id,
        name: deviceModelVariants.name,
        basePrice: deviceModelVariants.basePrice,
        storage: deviceModelVariants.storage,
        color: deviceModelVariants.color,
        condition: deviceModelVariants.condition,
        active: deviceModelVariants.active,
        mappedGroups: sql`COUNT(${variantQuestionMappings.groupId})`.as('mappedGroups')
      })
      .from(deviceModelVariants)
      .leftJoin(variantQuestionMappings, eq(variantQuestionMappings.variantId, deviceModelVariants.id))
      .where(eq(deviceModelVariants.modelId, parseInt(modelId)))
      .groupBy(deviceModelVariants.id);

    res.json(variants);
  } catch (error) {
    console.error('Error fetching model variants:', error);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
};

// GET /api/device-models?includeDetails=true - Enhanced models endpoint with variant info
export const getModelsWithVariants = async (req, res) => {
  try {
    const { includeDetails } = req.query;

    if (includeDetails === 'true') {
      // Fetch models with variant counts and full variant details
      const modelsWithDetails = await db
        .select({
          id: deviceModels.id,
          name: deviceModels.name,
          slug: deviceModels.slug,
          brandId: deviceModels.brandId,
          deviceTypeId: deviceModels.deviceTypeId,
          image: deviceModels.image,
          description: deviceModels.description,
          featured: deviceModels.featured,
          active: deviceModels.active,
          brandName: brands.name,
          deviceTypeName: deviceTypes.name,
          variantCount: sql`COUNT(${deviceModelVariants.id})`.as('variantCount')
        })
        .from(deviceModels)
        .leftJoin(brands, eq(deviceModels.brandId, brands.id))
        .leftJoin(deviceTypes, eq(deviceModels.deviceTypeId, deviceTypes.id))
        .leftJoin(deviceModelVariants, eq(deviceModelVariants.modelId, deviceModels.id))
        .where(eq(deviceModels.active, true))
        .groupBy(
          deviceModels.id, deviceModels.name, deviceModels.slug, deviceModels.brandId, deviceModels.deviceTypeId,
          deviceModels.image, deviceModels.description, deviceModels.featured, deviceModels.active,
          brands.name, deviceTypes.name
        )
        .orderBy(deviceModels.name);

      // Fetch variants for each model
      const allVariants = await db
        .select()
        .from(deviceModelVariants)
        .where(eq(deviceModelVariants.active, true));

      // Group variants by model ID
      const variantsByModel = allVariants.reduce((acc, variant) => {
        if (!acc[variant.modelId]) acc[variant.modelId] = [];
        acc[variant.modelId].push(variant);
        return acc;
      }, {});

      // For each model, fetch its variants with mapping info
      const modelsWithVariants = await Promise.all(
        modelsWithDetails.map(async (model) => {
          const variants = await db
            .select({
              id: deviceModelVariants.id,
              name: deviceModelVariants.name,
              basePrice: deviceModelVariants.basePrice,
              storage: deviceModelVariants.storage,
              color: deviceModelVariants.color,
              condition: deviceModelVariants.condition,
              active: deviceModelVariants.active,
              mappedGroups: sql`COUNT(${variantQuestionMappings.groupId})`.as('mappedGroups')
            })
            .from(deviceModelVariants)
            .leftJoin(variantQuestionMappings, eq(variantQuestionMappings.variantId, deviceModelVariants.id))
            .where(eq(deviceModelVariants.modelId, model.id))
            .groupBy(deviceModelVariants.id);

          return {
            ...model,
            variants
          };
        })
      );

      res.json(modelsWithVariants);
    } else {
      // Standard models endpoint
      const modelsList = await db
        .select({
          id: deviceModels.id,
          name: deviceModels.name,
          slug: deviceModels.slug,
          brandName: brands.name,
          deviceTypeName: deviceTypes.name,
          image: deviceModels.image,
          featured: deviceModels.featured,
          active: deviceModels.active
        })
        .from(deviceModels)
        .leftJoin(brands, eq(deviceModels.brandId, brands.id))
        .leftJoin(deviceTypes, eq(deviceModels.deviceTypeId, deviceTypes.id))
        .where(eq(deviceModels.active, true))
        .orderBy(deviceModels.name);

      res.json(modelsList);
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
};