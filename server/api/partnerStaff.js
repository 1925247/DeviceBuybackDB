import { Router } from 'express';
import { db } from '../db.js';
import { partnerStaff, users, partners } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all partner staff
router.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: partnerStaff.id,
        userId: partnerStaff.userId,
        partnerId: partnerStaff.partnerId,
        staffRole: partnerStaff.staffRole,
        isActive: partnerStaff.isActive,
        userName: users.firstName,
        userEmail: users.email,
        partnerName: partners.name,
        createdAt: partnerStaff.createdAt
      })
      .from(partnerStaff)
      .leftJoin(users, eq(partnerStaff.userId, users.id))
      .leftJoin(partners, eq(partnerStaff.partnerId, partners.id));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching partner staff:', error);
    res.status(500).json({ message: 'Failed to fetch partner staff' });
  }
});

// Get partner staff by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await db.select().from(partnerStaff).where(eq(partnerStaff.id, parseInt(id))).limit(1);
    
    if (!staff.length) {
      return res.status(404).json({ message: 'Partner staff not found' });
    }
    
    res.json(staff[0]);
  } catch (error) {
    console.error('Error fetching partner staff:', error);
    res.status(500).json({ message: 'Failed to fetch partner staff' });
  }
});

// Create new partner staff
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(partnerStaff).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating partner staff:', error);
    res.status(500).json({ message: 'Failed to create partner staff' });
  }
});

// Update partner staff
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(partnerStaff)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(partnerStaff.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Partner staff not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating partner staff:', error);
    res.status(500).json({ message: 'Failed to update partner staff' });
  }
});

// Delete partner staff
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(partnerStaff).where(eq(partnerStaff.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Partner staff not found' });
    }
    
    res.json({ message: 'Partner staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner staff:', error);
    res.status(500).json({ message: 'Failed to delete partner staff' });
  }
});

export default router;