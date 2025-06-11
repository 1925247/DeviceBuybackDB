import { Router } from 'express';
import { db } from '../db.js';
import { indianStates, indianCities, indianPostalCodes } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all Indian states
router.get('/states', async (_req, res) => {
  try {
    const result = await db.select().from(indianStates).where(eq(indianStates.active, true));
    res.json(result);
  } catch (error) {
    console.error('Error fetching Indian states:', error);
    res.status(500).json({ message: 'Failed to fetch Indian states' });
  }
});

// Get cities by state ID
router.get('/states/:stateId/cities', async (req, res) => {
  try {
    const { stateId } = req.params;
    const result = await db
      .select()
      .from(indianCities)
      .where(eq(indianCities.stateId, parseInt(stateId)));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Failed to fetch cities' });
  }
});

// Get postal codes by city ID
router.get('/cities/:cityId/postcodes', async (req, res) => {
  try {
    const { cityId } = req.params;
    const result = await db
      .select()
      .from(indianPostalCodes)
      .where(eq(indianPostalCodes.cityId, parseInt(cityId)));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching postal codes:', error);
    res.status(500).json({ message: 'Failed to fetch postal codes' });
  }
});

// Search postal code
router.get('/postcode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const result = await db
      .select({
        pincode: indianPostalCodes.pincode,
        officeName: indianPostalCodes.officeName,
        district: indianPostalCodes.district,
        cityId: indianPostalCodes.cityId,
        stateId: indianPostalCodes.stateId,
        cityName: indianCities.name,
        stateName: indianStates.name
      })
      .from(indianPostalCodes)
      .leftJoin(indianCities, eq(indianPostalCodes.cityId, indianCities.id))
      .leftJoin(indianStates, eq(indianPostalCodes.stateId, indianStates.id))
      .where(eq(indianPostalCodes.pincode, pincode))
      .limit(1);
    
    if (!result.length) {
      return res.status(404).json({ message: 'Postal code not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching postal code:', error);
    res.status(500).json({ message: 'Failed to fetch postal code' });
  }
});

export default router;