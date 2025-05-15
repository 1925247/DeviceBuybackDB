import { Router } from "express";
import { db } from "../db";
import { partnerStaff, partners, regions, rolePermissions, users } from "../../shared/schema";
import { desc, eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

// Get all staff for a partner
router.get("/partners/:partnerId/staff", async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const staffMembers = await db.select()
      .from(partnerStaff)
      .leftJoin(users, eq(partnerStaff.userId, users.id))
      .leftJoin(partners, eq(partnerStaff.partnerId, partners.id))
      .where(eq(partnerStaff.partnerId, parseInt(partnerId)))
      .orderBy(desc(partnerStaff.createdAt));
    
    const staffData = staffMembers.map(staff => ({
      id: staff.partner_staff.id,
      userId: staff.partner_staff.userId,
      partnerId: staff.partner_staff.partnerId,
      role: staff.partner_staff.role,
      status: staff.partner_staff.status,
      email: staff.users?.email,
      firstName: staff.users?.firstName,
      lastName: staff.users?.lastName,
      phone: staff.users?.phone,
      assignedRegions: staff.partner_staff.assignedRegions,
      assignedPincodes: staff.partner_staff.assignedPincodes,
      lastLogin: staff.users?.lastLogin,
      createdAt: staff.partner_staff.createdAt,
    }));
    
    res.json(staffData);
  } catch (error) {
    console.error("Error fetching partner staff:", error);
    res.status(500).json({ message: "Failed to fetch partner staff" });
  }
});

// Get a single staff member
router.get("/partners/:partnerId/staff/:staffId", async (req, res) => {
  try {
    const { partnerId, staffId } = req.params;
    
    const staffMember = await db.select()
      .from(partnerStaff)
      .leftJoin(users, eq(partnerStaff.userId, users.id))
      .where(
        and(
          eq(partnerStaff.id, parseInt(staffId)),
          eq(partnerStaff.partnerId, parseInt(partnerId))
        )
      )
      .limit(1);
    
    if (staffMember.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    const staffData = {
      id: staffMember[0].partner_staff.id,
      userId: staffMember[0].partner_staff.userId,
      partnerId: staffMember[0].partner_staff.partnerId,
      role: staffMember[0].partner_staff.role,
      status: staffMember[0].partner_staff.status,
      email: staffMember[0].users?.email,
      firstName: staffMember[0].users?.firstName,
      lastName: staffMember[0].users?.lastName,
      phone: staffMember[0].users?.phone,
      assignedRegions: staffMember[0].partner_staff.assignedRegions,
      assignedPincodes: staffMember[0].partner_staff.assignedPincodes,
      lastLogin: staffMember[0].users?.lastLogin,
      createdAt: staffMember[0].partner_staff.createdAt,
    };
    
    res.json(staffData);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ message: "Failed to fetch staff member" });
  }
});

// Create a new staff member
router.post("/partners/:partnerId/staff", async (req, res) => {
  try {
    const { partnerId } = req.params;
    const {
      email,
      firstName,
      lastName,
      phone,
      role,
      password,
      assignedRegions,
      assignedPincodes,
      status
    } = req.body;
    
    // Check if partner exists
    const partner = await db.select()
      .from(partners)
      .where(eq(partners.id, parseInt(partnerId)))
      .limit(1);
    
    if (partner.length === 0) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await db.insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role as any,
        status: status as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    // Create staff record
    const [newStaff] = await db.insert(partnerStaff)
      .values({
        userId: newUser.id,
        partnerId: parseInt(partnerId),
        role: role as any,
        status: status as any,
        assignedRegions: assignedRegions || [],
        assignedPincodes: assignedPincodes || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    res.status(201).json({
      id: newStaff.id,
      userId: newStaff.userId,
      partnerId: newStaff.partnerId,
      role: newStaff.role,
      status: newStaff.status,
      email,
      firstName,
      lastName,
      phone,
      assignedRegions: newStaff.assignedRegions,
      assignedPincodes: newStaff.assignedPincodes,
      createdAt: newStaff.createdAt,
    });
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).json({ message: "Failed to create staff member" });
  }
});

// Update staff member
router.put("/partners/:partnerId/staff/:staffId", async (req, res) => {
  try {
    const { partnerId, staffId } = req.params;
    const {
      firstName,
      lastName,
      phone,
      role,
      password,
      assignedRegions,
      assignedPincodes,
      status
    } = req.body;
    
    // Get staff record
    const staffMember = await db.select()
      .from(partnerStaff)
      .where(
        and(
          eq(partnerStaff.id, parseInt(staffId)),
          eq(partnerStaff.partnerId, parseInt(partnerId))
        )
      )
      .limit(1);
    
    if (staffMember.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    // Update user
    const updateUserData: any = {
      firstName,
      lastName,
      phone,
      role: role as any,
      status: status as any,
      updatedAt: new Date(),
    };
    
    // Only update password if provided
    if (password) {
      updateUserData.password = await bcrypt.hash(password, 10);
    }
    
    await db.update(users)
      .set(updateUserData)
      .where(eq(users.id, staffMember[0].userId));
    
    // Update staff record
    const [updatedStaff] = await db.update(partnerStaff)
      .set({
        role: role as any,
        status: status as any,
        assignedRegions: assignedRegions || [],
        assignedPincodes: assignedPincodes || [],
        updatedAt: new Date(),
      })
      .where(eq(partnerStaff.id, parseInt(staffId)))
      .returning();
    
    // Get updated user info
    const [updatedUser] = await db.select()
      .from(users)
      .where(eq(users.id, staffMember[0].userId));
    
    res.json({
      id: updatedStaff.id,
      userId: updatedStaff.userId,
      partnerId: updatedStaff.partnerId,
      role: updatedStaff.role,
      status: updatedStaff.status,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      assignedRegions: updatedStaff.assignedRegions,
      assignedPincodes: updatedStaff.assignedPincodes,
      createdAt: updatedStaff.createdAt,
      updatedAt: updatedStaff.updatedAt,
    });
  } catch (error) {
    console.error("Error updating staff member:", error);
    res.status(500).json({ message: "Failed to update staff member" });
  }
});

// Delete staff member
router.delete("/partners/:partnerId/staff/:staffId", async (req, res) => {
  try {
    const { partnerId, staffId } = req.params;
    
    // Get staff record
    const staffMember = await db.select()
      .from(partnerStaff)
      .where(
        and(
          eq(partnerStaff.id, parseInt(staffId)),
          eq(partnerStaff.partnerId, parseInt(partnerId))
        )
      )
      .limit(1);
    
    if (staffMember.length === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    // First delete staff record
    await db.delete(partnerStaff)
      .where(eq(partnerStaff.id, parseInt(staffId)));
    
    // Then delete user
    await db.delete(users)
      .where(eq(users.id, staffMember[0].userId));
    
    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).json({ message: "Failed to delete staff member" });
  }
});

// Get all regions (for assignment)
router.get("/regions", async (req, res) => {
  try {
    const allRegions = await db.select()
      .from(regions)
      .orderBy(regions.name);
    
    res.json(allRegions);
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ message: "Failed to fetch regions" });
  }
});

export default router;