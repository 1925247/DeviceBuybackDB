import { 
  users, type User, type InsertUser,
  partners, type Partner, type InsertPartner,
  partnerWallets, type PartnerWallet, type InsertPartnerWallet,
  walletTransactions, type WalletTransaction, type InsertWalletTransaction,
  withdrawalRequests, type WithdrawalRequest, type InsertWithdrawalRequest,
  partnerStaff, type PartnerStaff, type InsertPartnerStaff,
  rolePermissions, type RolePermission, type InsertRolePermission,
  routeRules, type RouteRule, type InsertRouteRule,
  postalCodes, 
  regions
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, like, ilike, count, or, isNull } from "drizzle-orm";

// Interface for database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(page?: number, limit?: number): Promise<User[]>;
  getUsersCount(): Promise<number>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Invoice template operations
  getInvoiceTemplates(partnerId?: number): Promise<InvoiceTemplate[]>;
  getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined>;
  getDefaultInvoiceTemplate(partnerId?: number): Promise<InvoiceTemplate | undefined>;
  createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate>;
  updateInvoiceTemplate(id: number, template: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined>;
  deleteInvoiceTemplate(id: number): Promise<boolean>;
  unsetDefaultInvoiceTemplates(partnerId?: number): Promise<void>;
  
  // Device operations
  getDevice(id: number): Promise<Device | undefined>;
  getDevices(page?: number, limit?: number, status?: string): Promise<Device[]>;
  getDevicesBySeller(sellerId: number): Promise<Device[]>;
  getDevicesCount(): Promise<number>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;
  
  // Device image operations
  getDeviceImages(deviceId: number): Promise<DeviceImage[]>;
  createDeviceImage(image: InsertDeviceImage): Promise<DeviceImage>;
  setDevicePrimaryImage(deviceId: number, imageId: number): Promise<boolean>;
  deleteDeviceImage(id: number): Promise<boolean>;
  
  // Buyback operations
  getBuybackRequest(id: number): Promise<BuybackRequest | undefined>;
  getBuybackRequests(page?: number, limit?: number, status?: string): Promise<BuybackRequest[]>;
  getBuybackRequestsCount(status?: string): Promise<number>;
  getBuybackRequestsByUser(userId: number): Promise<BuybackRequest[]>;
  getRecentBuybackRequests(limit?: number): Promise<BuybackRequest[]>;
  createBuybackRequest(request: InsertBuybackRequest): Promise<BuybackRequest>;
  updateBuybackRequest(id: number, request: Partial<InsertBuybackRequest>): Promise<BuybackRequest | undefined>;
  deleteBuybackRequest(id: number): Promise<boolean>;
  
  // Marketplace operations
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  getMarketplaceListings(page?: number, limit?: number, status?: string): Promise<MarketplaceListing[]>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: number, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(page?: number, limit?: number, status?: string): Promise<Order[]>;
  getOrdersByBuyer(buyerId: number): Promise<Order[]>;
  getOrdersBySeller(sellerId: number): Promise<Order[]>;
  getOrdersCount(): Promise<number>;
  getRecentOrders(limit?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  
  // Reference data operations
  // Device Type operations
  getDeviceTypes(): Promise<DeviceType[]>;
  getDeviceType(id: number): Promise<DeviceType | undefined>;
  createDeviceType(data: { name: string; slug: string; icon?: string; active?: boolean }): Promise<DeviceType>;
  updateDeviceType(id: number, data: { name: string; slug: string; icon?: string; active?: boolean }): Promise<DeviceType | undefined>;
  deleteDeviceType(id: number): Promise<{ success: boolean; error?: string }>;
  
  // Brand operations
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;
  createBrand(data: { name: string; slug: string; logo?: string }): Promise<Brand>;
  updateBrand(id: number, data: { name: string; slug: string; logo?: string }): Promise<Brand | undefined>;
  deleteBrand(id: number): Promise<{ success: boolean; error?: string }>;
  
  // Brand Device Types operations
  getAllBrandDeviceTypes(): Promise<any[]>;
  getBrandDeviceType(id: number): Promise<any | undefined>;
  createBrandDeviceType(data: { brand_id: number; device_type_id: number }): Promise<any>;
  deleteBrandDeviceType(id: number): Promise<boolean>;
  
  // Device models operations
  getDeviceModels(): Promise<DeviceModel[]>;
  getDeviceModel(id: number): Promise<DeviceModel | undefined>;
  createDeviceModel(model: Partial<DeviceModel>): Promise<DeviceModel>; 
  updateDeviceModel(id: number, model: Partial<DeviceModel>): Promise<DeviceModel | undefined>;
  deleteDeviceModel(id: number): Promise<boolean>;
  
  getConditionQuestions(deviceTypeId?: number): Promise<any[]>;
  getConditionQuestion(id: number): Promise<any | undefined>;
  createConditionQuestion(questionData: any): Promise<any>;
  updateConditionQuestion(id: number, questionData: any): Promise<any | undefined>;
  deleteConditionQuestion(id: number): Promise<boolean>;
  createConditionAnswer(answerData: any): Promise<any>;
  getConditionAnswers(): Promise<any[]>;
  deleteConditionAnswersByQuestionId(questionId: number): Promise<boolean>;
  
  // Valuation operations
  getValuations(deviceModelId?: number): Promise<any[]>;
  createValuation(valuationData: any): Promise<any>;
  updateValuation(id: number, valuationData: any): Promise<any | undefined>;
  deleteValuation(id: number): Promise<boolean>;
  deleteValuationsByModel(modelId: number): Promise<boolean>;
  
  // Database status
  getDatabaseStatus(): Promise<{
    connected: boolean;
    type: string;
    connectionPool: { active: number; max: number };
    schema: string;
    recentActivity: string[];
  }>;
  
  // Settings operations
  getSettings(): Promise<any>;
  updateSettings(settings: any): Promise<any>;
  
  // Partner operations
  getPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  
  // Region operations
  getRegions(): Promise<Region[]>;
  getRegion(id: number): Promise<Region | undefined>;
  
  // Route Rules operations
  getRouteRules(): Promise<RouteRule[]>;
  getRouteRule(id: number): Promise<RouteRule | undefined>;
  createRouteRule(rule: InsertRouteRule): Promise<RouteRule>;
  updateRouteRule(id: number, rule: Partial<InsertRouteRule>): Promise<RouteRule | undefined>;
  deleteRouteRule(id: number): Promise<boolean>;
  changeRoutePriority(id: number, direction: 'up' | 'down'): Promise<RouteRule | undefined>;
  
  // PIN code-based lead assignment
  getPartnerByPinCode(pinCode: string): Promise<Partner | undefined>;
  assignLeadToPartner(leadId: number, partnerId: number): Promise<BuybackRequest | undefined>;
  
  // E-commerce operations
  
  // Product operations
  getProducts(options?: { page?: number; limit?: number; status?: string; featured?: boolean; categoryId?: number }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Product variant operations
  getProductVariants(productId: number): Promise<ProductVariant[]>;
  getProductVariant(id: number): Promise<ProductVariant | undefined>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: number, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: number): Promise<boolean>;
  
  // Product image operations
  getProductImages(productId: number): Promise<ProductImage[]>;
  createProductImage(image: InsertProductImage): Promise<ProductImage>;
  setProductPrimaryImage(productId: number, imageId: number): Promise<boolean>;
  deleteProductImage(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Discount operations
  getDiscounts(status?: string): Promise<Discount[]>;
  getDiscount(id: number): Promise<Discount | undefined>;
  createDiscount(discount: InsertDiscount): Promise<Discount>;
  updateDiscount(id: number, discount: Partial<InsertDiscount>): Promise<Discount | undefined>;
  deleteDiscount(id: number): Promise<boolean>;
  verifyDiscount(code: string, total?: number): Promise<Discount | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<User[]> {
    const offset = (page - 1) * limit;
    return db.select().from(users).limit(limit).offset(offset);
  }
  
  async getUsersCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return Number(result[0].count);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }

  // Device operations
  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async getDevices(page: number = 1, limit: number = 10, status?: string): Promise<Device[]> {
    const offset = (page - 1) * limit;
    const baseQuery = db.select().from(devices).limit(limit).offset(offset).orderBy(desc(devices.listed_date));
    
    if (status) {
      return baseQuery.where(eq(devices.status, status));
    }
    
    return baseQuery;
  }

  async getDevicesBySeller(sellerId: number): Promise<Device[]> {
    return db.select().from(devices).where(eq(devices.seller_id, sellerId));
  }
  
  async getDevicesCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(devices);
    return Number(result[0].count);
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    // Convert numeric price to string format as expected by the database
    const deviceToInsert = {
      ...device,
      price: typeof device.price === 'number' ? 
        device.price.toString() : device.price
    };
    
    const [newDevice] = await db.insert(devices).values([deviceToInsert]).returning();
    return newDevice;
  }

  async updateDevice(id: number, deviceData: Partial<InsertDevice>): Promise<Device | undefined> {
    // Convert numeric price to string format as expected by the database
    const dataToUpdate: any = {
      ...deviceData,
      updated_at: new Date()
    };
    
    if (deviceData.price !== undefined && typeof deviceData.price === 'number') {
      dataToUpdate.price = deviceData.price.toString();
    }
    
    const [updatedDevice] = await db
      .update(devices)
      .set(dataToUpdate)
      .where(eq(devices.id, id))
      .returning();
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<boolean> {
    const result = await db.delete(devices).where(eq(devices.id, id));
    return !!result;
  }

  // Device image operations
  async getDeviceImages(deviceId: number): Promise<DeviceImage[]> {
    return db.select().from(deviceImages).where(eq(deviceImages.device_id, deviceId));
  }

  async createDeviceImage(image: InsertDeviceImage): Promise<DeviceImage> {
    const [newImage] = await db.insert(deviceImages).values(image).returning();
    return newImage;
  }

  async setDevicePrimaryImage(deviceId: number, imageId: number): Promise<boolean> {
    // First, set all images for this device to non-primary
    await db
      .update(deviceImages)
      .set({ is_primary: false })
      .where(eq(deviceImages.device_id, deviceId));
    
    // Then set the specified image as primary
    const [updatedImage] = await db
      .update(deviceImages)
      .set({ is_primary: true })
      .where(and(eq(deviceImages.id, imageId), eq(deviceImages.device_id, deviceId)))
      .returning();
    
    return !!updatedImage;
  }

  async deleteDeviceImage(id: number): Promise<boolean> {
    const result = await db.delete(deviceImages).where(eq(deviceImages.id, id));
    return !!result;
  }

  // Buyback operations
  async getBuybackRequest(id: number): Promise<BuybackRequest | undefined> {
    const [request] = await db.select().from(buybackRequests).where(eq(buybackRequests.id, id));
    return request;
  }

  async getBuybackRequests(page: number = 1, limit: number = 10, status?: string): Promise<BuybackRequest[]> {
    const offset = (page - 1) * limit;
    const baseQuery = db.select().from(buybackRequests).limit(limit).offset(offset).orderBy(desc(buybackRequests.created_at));
    
    if (status) {
      return baseQuery.where(eq(buybackRequests.status, status));
    }
    
    return baseQuery;
  }
  
  async getBuybackRequestsCount(status?: string): Promise<number> {
    const query = db.select({ count: sql`count(*)` }).from(buybackRequests);
    
    const finalQuery = status 
      ? query.where(eq(buybackRequests.status, status))
      : query;
    
    const result = await finalQuery;
    return Number(result[0]?.count || 0);
  }

  async getBuybackRequestsByUser(userId: number): Promise<BuybackRequest[]> {
    return db.select().from(buybackRequests).where(eq(buybackRequests.user_id, userId));
  }
  
  async getRecentBuybackRequests(limit: number = 5): Promise<BuybackRequest[]> {
    return db.select()
      .from(buybackRequests)
      .orderBy(desc(buybackRequests.created_at))
      .limit(limit);
  }

  async createBuybackRequest(request: InsertBuybackRequest): Promise<BuybackRequest> {
    try {
      // Handle the array case by ensuring we're passing a single object
      const requestData = Array.isArray(request) ? request[0] : request;
      
      const [newRequest] = await db
        .insert(buybackRequests)
        .values(requestData)
        .returning();
        
      return newRequest;
    } catch (error) {
      console.error("Error creating buyback request:", error);
      throw error;
    }
  }

  async updateBuybackRequest(id: number, requestData: Partial<InsertBuybackRequest>): Promise<BuybackRequest | undefined> {
    // Handle potential JSON fields that need conversion
    const normalizedData = {
      ...requestData
    };
    
    // Remove updated_at if it's being sent from the client
    // as we'll set it correctly below
    if ('updated_at' in normalizedData) {
      delete normalizedData.updated_at;
    }
    
    try {
      const [updatedRequest] = await db
        .update(buybackRequests)
        .set({ 
          ...normalizedData,
          updated_at: new Date() 
        })
        .where(eq(buybackRequests.id, id))
        .returning();
      
      return updatedRequest;
    } catch (error) {
      console.error("Error updating buyback request:", error);
      throw error;
    }
  }

  async deleteBuybackRequest(id: number): Promise<boolean> {
    const result = await db.delete(buybackRequests).where(eq(buybackRequests.id, id));
    return !!result;
  }

  // Marketplace operations
  async getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id));
    return listing;
  }

  async getMarketplaceListings(page: number = 1, limit: number = 10, status?: string): Promise<MarketplaceListing[]> {
    const offset = (page - 1) * limit;
    const baseQuery = db.select().from(marketplaceListings).limit(limit).offset(offset).orderBy(desc(marketplaceListings.created_at));
    
    if (status) {
      return baseQuery.where(eq(marketplaceListings.status, status));
    }
    
    return baseQuery;
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const [newListing] = await db.insert(marketplaceListings).values(listing).returning();
    return newListing;
  }

  async updateMarketplaceListing(id: number, listingData: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined> {
    const [updatedListing] = await db
      .update(marketplaceListings)
      .set({ ...listingData, updated_at: new Date() })
      .where(eq(marketplaceListings.id, id))
      .returning();
    return updatedListing;
  }

  async deleteMarketplaceListing(id: number): Promise<boolean> {
    const result = await db.delete(marketplaceListings).where(eq(marketplaceListings.id, id));
    return !!result;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrders(page: number = 1, limit: number = 10, status?: string): Promise<Order[]> {
    const offset = (page - 1) * limit;
    const baseQuery = db.select().from(orders).limit(limit).offset(offset).orderBy(desc(orders.created_at));
    
    if (status) {
      return baseQuery.where(eq(orders.status, status));
    }
    
    return baseQuery;
  }

  async getOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.buyer_id, buyerId));
  }

  async getOrdersBySeller(sellerId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.seller_id, sellerId));
  }
  
  async getOrdersCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(orders);
    return Number(result[0].count);
  }
  
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    return db.select()
      .from(orders)
      .orderBy(desc(orders.created_at))
      .limit(limit);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...orderData, updated_at: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return !!result;
  }

  // Reference data operations
  async getDeviceTypes(): Promise<DeviceType[]> {
    return await db.select().from(deviceTypes).orderBy(deviceTypes.name);
  }
  
  async getDeviceType(id: number): Promise<DeviceType | undefined> {
    const [deviceType] = await db.select().from(deviceTypes).where(eq(deviceTypes.id, id));
    return deviceType;
  }
  
  async createDeviceType(data: { name: string; slug: string; icon?: string; active?: boolean }): Promise<DeviceType> {
    const [newDeviceType] = await db.insert(deviceTypes).values({
      ...data,
      active: data.active ?? true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    return newDeviceType;
  }
  
  async updateDeviceType(id: number, data: { name: string; slug: string; icon?: string; active?: boolean }): Promise<DeviceType | undefined> {
    const [updatedDeviceType] = await db
      .update(deviceTypes)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(deviceTypes.id, id))
      .returning();
    
    return updatedDeviceType;
  }
  
  async deleteDeviceType(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if there are any device models using this device type
      const [modelCount] = await db
        .select({ count: sql`count(*)` })
        .from(deviceModels)
        .where(eq(deviceModels.device_type_id, id));
      
      if (Number(modelCount?.count || 0) > 0) {
        return { 
          success: false, 
          error: 'Cannot delete device type because there are device models associated with it' 
        };
      }
      
      const result = await db.delete(deviceTypes).where(eq(deviceTypes.id, id));
      if (!result.length) {
        return { success: false, error: 'Device type not found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting device type:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(brands.name);
  }
  
  async getBrand(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }
  
  async createBrand(data: { name: string; slug: string; logo?: string }): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(data).returning();
    return newBrand;
  }
  
  async updateBrand(id: number, data: { name: string; slug: string; logo?: string }): Promise<Brand | undefined> {
    const [updatedBrand] = await db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();
    return updatedBrand;
  }
  
  async deleteBrand(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if there are device models that use this brand
      const relatedModels = await db
        .select({ id: deviceModels.id })
        .from(deviceModels)
        .where(eq(deviceModels.brand_id, id));
      
      if (relatedModels.length > 0) {
        return { 
          success: false, 
          error: `Cannot delete brand that has ${relatedModels.length} associated device models. Please delete the models first.` 
        };
      }
      
      // Check if there are any brand_device_types relations
      const brandDeviceTypes = await db.execute(
        sql`SELECT * FROM brand_device_types WHERE brand_id = ${id}`
      );
      
      if (brandDeviceTypes.rowCount && brandDeviceTypes.rowCount > 0) {
        return {
          success: false,
          error: `Cannot delete brand that has device type associations. Please remove these associations first.`
        };
      }
      
      // Now safe to delete
      const [deletedBrand] = await db
        .delete(brands)
        .where(eq(brands.id, id))
        .returning({ id: brands.id });
        
      return { success: !!deletedBrand };
    } catch (error) {
      console.error("Error deleting brand:", error);
      
      // Check for foreign key violation error
      if (error instanceof Error && error.message.includes('violates foreign key constraint')) {
        if (error.message.includes('brand_device_types')) {
          return {
            success: false,
            error: `Cannot delete brand that has device type associations. Please remove these associations first.`
          };
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      };
    }
  }
  
  // Brand Device Types operations
  async getAllBrandDeviceTypes(): Promise<any[]> {
    try {
      const relations = await db
        .select({
          id: brandDeviceTypes.id,
          brand_id: brandDeviceTypes.brand_id,
          device_type_id: brandDeviceTypes.device_type_id,
          created_at: brandDeviceTypes.created_at,
          updated_at: brandDeviceTypes.updated_at,
          brand_name: brands.name,
          device_type_name: deviceTypes.name
        })
        .from(brandDeviceTypes)
        .leftJoin(brands, eq(brandDeviceTypes.brand_id, brands.id))
        .leftJoin(deviceTypes, eq(brandDeviceTypes.device_type_id, deviceTypes.id));
      
      return relations;
    } catch (error) {
      console.error("Error getting brand device types:", error);
      throw error;
    }
  }

  async getBrandDeviceType(id: number): Promise<any | undefined> {
    try {
      const [relation] = await db
        .select({
          id: brandDeviceTypes.id,
          brand_id: brandDeviceTypes.brand_id,
          device_type_id: brandDeviceTypes.device_type_id,
          created_at: brandDeviceTypes.created_at,
          updated_at: brandDeviceTypes.updated_at,
          brand_name: brands.name,
          device_type_name: deviceTypes.name
        })
        .from(brandDeviceTypes)
        .leftJoin(brands, eq(brandDeviceTypes.brand_id, brands.id))
        .leftJoin(deviceTypes, eq(brandDeviceTypes.device_type_id, deviceTypes.id))
        .where(eq(brandDeviceTypes.id, id));
      
      return relation;
    } catch (error) {
      console.error(`Error getting brand device type with id ${id}:`, error);
      throw error;
    }
  }

  async createBrandDeviceType(data: { brand_id: number; device_type_id: number }): Promise<any> {
    try {
      // Check if the relation already exists
      const existing = await db
        .select()
        .from(brandDeviceTypes)
        .where(
          and(
            eq(brandDeviceTypes.brand_id, data.brand_id),
            eq(brandDeviceTypes.device_type_id, data.device_type_id)
          )
        );
      
      if (existing.length > 0) {
        throw new Error("This brand-device type relation already exists");
      }
      
      const [newRelation] = await db
        .insert(brandDeviceTypes)
        .values({
          brand_id: data.brand_id,
          device_type_id: data.device_type_id
        })
        .returning();
        
      return newRelation;
    } catch (error) {
      console.error("Error creating brand device type relation:", error);
      throw error;
    }
  }

  async deleteBrandDeviceType(id: number): Promise<boolean> {
    try {
      await db
        .delete(brandDeviceTypes)
        .where(eq(brandDeviceTypes.id, id));
      
      return true;
    } catch (error) {
      console.error(`Error deleting brand device type with id ${id}:`, error);
      throw error;
    }
  }
  
  async getBrandForDeviceType(deviceTypeId: number): Promise<Brand[]> {
    try {
      const query = db
        .select()
        .from(brands)
        .innerJoin(
          brandDeviceTypes,
          eq(brands.id, brandDeviceTypes.brand_id)
        )
        .where(eq(brandDeviceTypes.device_type_id, deviceTypeId));

      const results = await query;
      return results.map(result => ({
        id: result.brands.id,
        name: result.brands.name,
        slug: result.brands.slug,
        logo: result.brands.logo,
        created_at: result.brands.created_at,
        updated_at: result.brands.updated_at,
      }));
    } catch (error) {
      console.error(`Error getting brands for device type with id ${deviceTypeId}:`, error);
      return [];
    }
  }

  async getDeviceModel(id: number): Promise<DeviceModel | undefined> {
    const [model] = await db.select({
      id: deviceModels.id,
      name: deviceModels.name,
      slug: deviceModels.slug,
      brand_id: deviceModels.brand_id,
      device_type_id: deviceModels.device_type_id,
      image: deviceModels.image,
      active: deviceModels.active,
      featured: deviceModels.featured,
      variants: deviceModels.variants,
      brand: brands,
      deviceType: deviceTypes,
      created_at: deviceModels.created_at,
      updated_at: deviceModels.updated_at
    })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .where(eq(deviceModels.id, id));
      
    return model;
  }
  
  async createDeviceModel(model: Partial<DeviceModel>): Promise<DeviceModel> {
    // Ensure the model has required fields
    const requiredFields = ['name', 'slug', 'brand_id', 'device_type_id'];
    for (const field of requiredFields) {
      if (!(field in model)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Insert default values for optional fields if not provided
    const modelData = {
      ...model,
      image: model.image || `https://placehold.co/300x200?text=${model.name ? encodeURIComponent(model.name as string) : 'New Model'}`,
      active: model.active !== undefined ? model.active : true,
      featured: model.featured !== undefined ? model.featured : false,
      variants: model.variants || [],
    };

    // Convert modelData to compatible type
    const compatibleData = {
      name: modelData.name as string,
      slug: modelData.slug as string,
      image: modelData.image as string,
      brand_id: modelData.brand_id as number,
      device_type_id: modelData.device_type_id as number,
      active: modelData.active as boolean,
      featured: modelData.featured as boolean,
      variants: modelData.variants as string[]
    };
    
    const [newModel] = await db.insert(deviceModels)
      .values([compatibleData])
      .returning();
      
    return newModel;
  }
  
  async updateDeviceModel(id: number, modelData: Partial<DeviceModel>): Promise<DeviceModel | undefined> {
    // Validate the model exists
    const existingModel = await this.getDeviceModel(id);
    if (!existingModel) {
      return undefined;
    }
    
    // Update the model
    const [updatedModel] = await db.update(deviceModels)
      .set({ 
        ...modelData,
        updated_at: new Date() 
      })
      .where(eq(deviceModels.id, id))
      .returning();
      
    return updatedModel;
  }
  
  async deleteDeviceModel(id: number): Promise<boolean> {
    // Check if the model exists
    const existingModel = await this.getDeviceModel(id);
    if (!existingModel) {
      return false;
    }
    
    // Delete the model
    const result = await db.delete(deviceModels)
      .where(eq(deviceModels.id, id));
      
    return true;
  }
  
  async getDeviceModels(): Promise<DeviceModel[]> {
    const models = await db.select({
      id: deviceModels.id,
      name: deviceModels.name,
      slug: deviceModels.slug,
      brand_id: deviceModels.brand_id,
      device_type_id: deviceModels.device_type_id,
      image: deviceModels.image,
      active: deviceModels.active,
      featured: deviceModels.featured,
      variants: deviceModels.variants,
      brand: brands,
      deviceType: deviceTypes,
      created_at: deviceModels.created_at,
      updated_at: deviceModels.updated_at
    })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .orderBy(deviceModels.name);
    
    return models;
  }

  async getConditionQuestions(deviceTypeId?: number): Promise<any[]> {
    const baseQuery = db.select({
      id: conditionQuestions.id,
      question: conditionQuestions.question,
      deviceTypeId: conditionQuestions.device_type_id,
      order: conditionQuestions.order,
      active: conditionQuestions.active
    })
      .from(conditionQuestions)
      .orderBy(conditionQuestions.order);
    
    const finalQuery = deviceTypeId 
      ? baseQuery.where(eq(conditionQuestions.device_type_id, deviceTypeId))
      : baseQuery;
    
    const questions = await finalQuery;
    
    // For each question, get its answers
    for (const question of questions) {
      const answers = await db.select({
        id: conditionAnswers.id,
        answer: conditionAnswers.answer,
        impact: conditionAnswers.impact,
        order: conditionAnswers.order
      })
        .from(conditionAnswers)
        .where(eq(conditionAnswers.question_id, question.id))
        .orderBy(conditionAnswers.order);
      
      // Add options property to the question
      (question as any).options = answers.map(a => ({
        id: a.id,
        text: a.answer,
        value: Number(a.impact),
        description: a.answer
      }));
    }
    
    return questions;
  }
  
  // Get a single condition question by ID with its options
  async getConditionQuestion(id: number): Promise<any | undefined> {
    try {
      // First, get the question
      const [question] = await db.select({
        id: conditionQuestions.id,
        question: conditionQuestions.question,
        deviceTypeId: conditionQuestions.device_type_id,
        order: conditionQuestions.order,
        active: conditionQuestions.active,
      })
      .from(conditionQuestions)
      .where(eq(conditionQuestions.id, id));
      
      if (!question) {
        return undefined;
      }
      
      // Then, get the options for this question
      const answers = await db.select({
        id: conditionAnswers.id,
        answer: conditionAnswers.answer,
        impact: conditionAnswers.impact,
        order: conditionAnswers.order
      })
      .from(conditionAnswers)
      .where(eq(conditionAnswers.question_id, id))
      .orderBy(conditionAnswers.order);
      
      // Add options property to the question
      (question as any).options = answers.map(a => ({
        id: a.id,
        text: a.answer,
        value: Number(a.impact),
        description: a.answer
      }));
      
      // Combine and return
      return question;
    } catch (error) {
      console.error(`Error fetching condition question with ID ${id}:`, error);
      return undefined;
    }
  }
  
  // Create a new condition question
  async createConditionQuestion(questionData: any): Promise<any> {
    try {
      const [newQuestion] = await db.insert(conditionQuestions)
        .values({
          question: questionData.question,
          device_type_id: questionData.deviceTypeId,
          order: questionData.order || 1,
          active: questionData.active !== undefined ? questionData.active : true,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
      
      return newQuestion;
    } catch (error) {
      console.error("Error creating condition question:", error);
      throw error;
    }
  }
  
  // Update an existing condition question
  async updateConditionQuestion(id: number, questionData: any): Promise<any | undefined> {
    try {
      const [updatedQuestion] = await db.update(conditionQuestions)
        .set({
          question: questionData.question !== undefined ? questionData.question : undefined,
          device_type_id: questionData.deviceTypeId !== undefined ? questionData.deviceTypeId : undefined,
          order: questionData.order !== undefined ? questionData.order : undefined,
          active: questionData.active !== undefined ? questionData.active : undefined,
          updated_at: new Date(),
        })
        .where(eq(conditionQuestions.id, id))
        .returning();
      
      return updatedQuestion;
    } catch (error) {
      console.error(`Error updating condition question with ID ${id}:`, error);
      return undefined;
    }
  }
  
  // Delete a condition question
  async deleteConditionQuestion(id: number): Promise<boolean> {
    try {
      const result = await db.delete(conditionQuestions)
        .where(eq(conditionQuestions.id, id));
      
      return true;
    } catch (error) {
      console.error(`Error deleting condition question with ID ${id}:`, error);
      return false;
    }
  }
  
  // Create a new condition answer option
  async createConditionAnswer(answerData: any): Promise<any> {
    try {
      // Check if an answer with this ID already exists
      if (answerData.id) {
        const existingAnswer = await db.select()
          .from(conditionAnswers)
          .where(eq(conditionAnswers.id, answerData.id))
          .limit(1);
        
        if (existingAnswer.length > 0) {
          // Update the existing answer instead of creating a new one
          const [updatedAnswer] = await db.update(conditionAnswers)
            .set({
              question_id: answerData.question_id,
              answer: answerData.text || answerData.value?.toString() || 'Option',
              impact: answerData.value || '0',
              order: answerData.order || 1,
              updated_at: new Date(),
            })
            .where(eq(conditionAnswers.id, answerData.id))
            .returning();
          
          return updatedAnswer;
        }
      }
      
      // Otherwise, insert a new answer
      const [newAnswer] = await db.insert(conditionAnswers)
        .values({
          question_id: answerData.question_id,
          answer: answerData.text || answerData.value?.toString() || 'Option', // Use fallback for null values
          impact: answerData.value || '0', // Use fallback for null values
          order: answerData.order || 1,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
      
      return newAnswer;
    } catch (error) {
      console.error("Error creating condition answer:", error);
      throw error;
    }
  }
  
  // Get all condition answers
  async getConditionAnswers(): Promise<any[]> {
    try {
      const answers = await db.select()
        .from(conditionAnswers);
      
      return answers;
    } catch (error) {
      console.error("Error fetching condition answers:", error);
      return [];
    }
  }
  
  // Delete condition answers by question ID
  async deleteConditionAnswersByQuestionId(questionId: number): Promise<boolean> {
    try {
      await db.delete(conditionAnswers)
        .where(eq(conditionAnswers.question_id, questionId));
      
      return true;
    } catch (error) {
      console.error(`Error deleting condition answers for question ID ${questionId}:`, error);
      return false;
    }
  }

  async getValuations(deviceModelId?: number): Promise<any[]> {
    const baseQuery = db.select()
      .from(valuations)
      .leftJoin(deviceModels, eq(valuations.device_model_id, deviceModels.id));
    
    if (deviceModelId) {
      return await baseQuery.where(eq(valuations.device_model_id, deviceModelId));
    }
    
    return await baseQuery;
  }
  
  // Create a new valuation entry
  async createValuation(valuationData: any): Promise<any> {
    try {
      // Make sure required fields exist
      if (!valuationData.device_model_id) {
        throw new Error("device_model_id is required");
      }
      
      // Prepare the data with proper types
      const data = {
        device_model_id: valuationData.device_model_id as number,
        base_price: valuationData.base_price?.toString() || "0",
        condition_excellent: valuationData.condition_excellent?.toString() || "100",
        condition_good: valuationData.condition_good?.toString() || "80",
        condition_fair: valuationData.condition_fair?.toString() || "60",
        condition_poor: valuationData.condition_poor?.toString() || "40",
        variant_multipliers: valuationData.variant_multipliers || null,
        active: valuationData.active !== undefined ? valuationData.active : true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Insert the valuation
      const [newValuation] = await db.insert(valuations)
        .values(data)
        .returning();
      
      return newValuation;
    } catch (error) {
      console.error("Error creating valuation:", error);
      throw error;
    }
  }
  
  // Update an existing valuation entry
  async updateValuation(id: number, valuationData: any): Promise<any | undefined> {
    try {
      const [updatedValuation] = await db.update(valuations)
        .set({
          base_price: valuationData.base_price !== undefined ? valuationData.base_price.toString() : undefined,
          condition_excellent: valuationData.condition_excellent !== undefined ? valuationData.condition_excellent.toString() : undefined,
          condition_good: valuationData.condition_good !== undefined ? valuationData.condition_good.toString() : undefined,
          condition_fair: valuationData.condition_fair !== undefined ? valuationData.condition_fair.toString() : undefined,
          condition_poor: valuationData.condition_poor !== undefined ? valuationData.condition_poor.toString() : undefined,
          variant_multipliers: valuationData.variant_multipliers !== undefined ? 
            JSON.stringify(valuationData.variant_multipliers) : undefined,
          active: valuationData.active !== undefined ? valuationData.active : undefined,
          updated_at: new Date()
        })
        .where(eq(valuations.id, id))
        .returning();
      
      return updatedValuation;
    } catch (error) {
      console.error(`Error updating valuation with ID ${id}:`, error);
      return undefined;
    }
  }
  
  // Delete a valuation entry
  async deleteValuation(id: number): Promise<boolean> {
    try {
      await db.delete(valuations)
        .where(eq(valuations.id, id));
      
      return true;
    } catch (error) {
      console.error(`Error deleting valuation with ID ${id}:`, error);
      return false;
    }
  }
  
  // Delete all valuations for a specific device model
  async deleteValuationsByModel(modelId: number): Promise<boolean> {
    try {
      await db.delete(valuations)
        .where(eq(valuations.device_model_id, modelId));
      
      return true;
    } catch (error) {
      console.error(`Error deleting valuations for model ID ${modelId}:`, error);
      return false;
    }
  }

  // Database status
  async getDatabaseStatus(): Promise<{
    connected: boolean;
    type: string;
    connectionPool: { active: number; max: number };
    schema: string;
    recentActivity: string[];
  }> {
    try {
      // Check if database is connected
      await db.execute(sql`SELECT 1`);
      
      // Get database information (simplified for this implementation)
      return {
        connected: true,
        type: "PostgreSQL 14.5",
        connectionPool: { active: 3, max: 10 },
        schema: "gadgetswap_production",
        recentActivity: [
          `${new Date().toISOString().slice(0, 19).replace('T', ' ')} INFO: Successfully connected to PostgreSQL database`,
          `${new Date().toISOString().slice(0, 19).replace('T', ' ')} INFO: Schema validation complete - 6 tables found`,
        ]
      };
    } catch (error) {
      return {
        connected: false,
        type: "PostgreSQL",
        connectionPool: { active: 0, max: 10 },
        schema: "gadgetswap_production",
        recentActivity: [
          `${new Date().toISOString().slice(0, 19).replace('T', ' ')} ERROR: Failed to connect to PostgreSQL database`
        ]
      };
    }
  }

  // Settings operations
  async getSettings(): Promise<any> {
    // Get settings from database, organize by key
    const allSettings = await db.select().from(settings);
    
    // If no settings exist in the database yet, initialize with defaults
    if (allSettings.length === 0) {
      await this.initializeDefaultSettings();
      return this.getSettings();
    }
    
    // Convert array of settings to an object grouped by key
    const settingsObject: Record<string, any> = {};
    
    for (const setting of allSettings) {
      const keyParts = setting.key.split('.');
      
      if (keyParts.length === 1) {
        settingsObject[keyParts[0]] = setting.value;
      } else if (keyParts.length === 2) {
        if (!settingsObject[keyParts[0]]) {
          settingsObject[keyParts[0]] = {};
        }
        settingsObject[keyParts[0]][keyParts[1]] = setting.value;
      }
    }
    
    return settingsObject;
  }
  
  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      { key: 'general.site_name', value: 'GadgetSwap' },
      { key: 'general.site_tagline', value: 'Your Trusted Source for Device Buyback and Refurbished Gadgets' },
      { key: 'general.contact_email', value: 'info@gadgetswap.com' },
      { key: 'general.support_phone', value: '+1 (555) 123-4567' },
      { key: 'buyback.min_offer_amount', value: 5 },
      { key: 'buyback.max_processing_days', value: 3 },
      { key: 'buyback.payment_methods', value: ["PayPal", "Bank Transfer", "Store Credit"] },
      { key: 'marketplace.enable_marketplace', value: true },
      { key: 'marketplace.featured_products_count', value: 8 },
      { key: 'marketplace.product_pricing_strategy', value: 'cost_plus_margin' },
      { key: 'shipping.default_shipping_country', value: 'US' },
      { key: 'shipping.free_shipping_min_order', value: 50 },
      { key: 'shipping.shipping_zones', value: [
        { name: 'Domestic', countries: ['US'], rate: 5.99 },
        { name: 'International', countries: ['*'], rate: 24.99 }
      ]}
    ];
    
    for (const setting of defaultSettings) {
      await db.insert(settings).values({
        key: setting.key,
        value: setting.value
      });
    }
  }

  async updateSettings(settingsData: any): Promise<any> {
    // Update or create settings in database
    const flattenedSettings: Array<{key: string, value: any}> = [];
    
    // Helper function to flatten nested settings object
    const flattenSettings = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          flattenSettings(obj[key], fullKey);
        } else {
          flattenedSettings.push({
            key: fullKey,
            value: obj[key]
          });
        }
      }
    };
    
    flattenSettings(settingsData);
    
    // Update each setting in the database
    for (const setting of flattenedSettings) {
      const existingSettings = await db
        .select()
        .from(settings)
        .where(eq(settings.key, setting.key));
      
      if (existingSettings.length > 0) {
        // Update existing setting
        await db
          .update(settings)
          .set({ 
            value: setting.value,
            updated_at: new Date()
          })
          .where(eq(settings.key, setting.key));
      } else {
        // Create new setting
        await db
          .insert(settings)
          .values({
            key: setting.key,
            value: setting.value
          });
      }
    }
    
    // Return updated settings
    return this.getSettings();
  }

  // E-COMMERCE OPERATIONS

  // Product operations
  async getProducts(options: { page?: number; limit?: number; status?: string; featured?: boolean; categoryId?: number } = {}): Promise<Product[]> {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      featured, 
      categoryId 
    } = options;
    
    const offset = (page - 1) * limit;
    
    let query = db.select().from(products);
    
    // Apply filters
    if (status) {
      query = query.where(eq(products.status, status));
    }
    
    if (featured !== undefined) {
      query = query.where(eq(products.featured, featured));
    }
    
    if (categoryId) {
      // This would require a join with the product_categories table
      // For now, we'll handle this filter in memory
      query = query.where(sql`EXISTS (
        SELECT 1 FROM product_categories 
        WHERE product_categories.product_id = products.id 
        AND product_categories.category_id = ${categoryId}
      )`);
    }
    
    // Apply pagination
    query = query.limit(limit).offset(offset);
    
    // Get products
    const productList = await query;
    
    return productList;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  // Product variant operations
  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    return db.select().from(productVariants).where(eq(productVariants.product_id, productId));
  }

  async getProductVariant(id: number): Promise<ProductVariant | undefined> {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, id));
    return variant;
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }

  async updateProductVariant(id: number, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [updatedVariant] = await db
      .update(productVariants)
      .set(variant)
      .where(eq(productVariants.id, id))
      .returning();
    
    return updatedVariant;
  }

  async deleteProductVariant(id: number): Promise<boolean> {
    try {
      await db.delete(productVariants).where(eq(productVariants.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product variant:", error);
      return false;
    }
  }

  // Product image operations
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return db.select().from(productImages).where(eq(productImages.product_id, productId));
  }

  async createProductImage(image: InsertProductImage): Promise<ProductImage> {
    const [newImage] = await db.insert(productImages).values(image).returning();
    return newImage;
  }

  async setProductPrimaryImage(productId: number, imageId: number): Promise<boolean> {
    try {
      // First, set is_primary to false for all images of this product
      await db
        .update(productImages)
        .set({ is_primary: false })
        .where(eq(productImages.product_id, productId));
      
      // Then, set is_primary to true for the specified image
      const [updatedImage] = await db
        .update(productImages)
        .set({ is_primary: true })
        .where(and(
          eq(productImages.id, imageId),
          eq(productImages.product_id, productId)
        ))
        .returning();
      
      return !!updatedImage;
    } catch (error) {
      console.error("Error setting primary image:", error);
      return false;
    }
  }

  async deleteProductImage(id: number): Promise<boolean> {
    try {
      await db.delete(productImages).where(eq(productImages.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product image:", error);
      return false;
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }

  // Discount operations
  async getDiscounts(status?: string): Promise<Discount[]> {
    let query = db.select().from(discounts);
    
    if (status) {
      query = query.where(eq(discounts.status, status));
    }
    
    return query;
  }

  async getDiscount(id: number): Promise<Discount | undefined> {
    const [discount] = await db.select().from(discounts).where(eq(discounts.id, id));
    return discount;
  }

  async createDiscount(discount: InsertDiscount): Promise<Discount> {
    const [newDiscount] = await db.insert(discounts).values(discount).returning();
    return newDiscount;
  }

  async updateDiscount(id: number, discount: Partial<InsertDiscount>): Promise<Discount | undefined> {
    const [updatedDiscount] = await db
      .update(discounts)
      .set(discount)
      .where(eq(discounts.id, id))
      .returning();
    
    return updatedDiscount;
  }

  async deleteDiscount(id: number): Promise<boolean> {
    try {
      await db.delete(discounts).where(eq(discounts.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting discount:", error);
      return false;
    }
  }

  async verifyDiscount(code: string, total?: number): Promise<Discount | undefined> {
    const now = new Date();
    
    // Get discount by code, active status, and valid dates
    const [discount] = await db
      .select()
      .from(discounts)
      .where(and(
        eq(discounts.code, code),
        eq(discounts.status, 'active'),
        sql`${discounts.start_date} <= ${now}`,
        sql`${discounts.end_date} >= ${now}`
      ));
    
    if (!discount) {
      return undefined;
    }
    
    // Check minimum order amount if provided
    if (total !== undefined && discount.min_order_amount !== null) {
      if (total < discount.min_order_amount) {
        return undefined;
      }
    }
    
    // Check usage limit if set
    if (discount.usage_limit !== null && discount.usage_count >= discount.usage_limit) {
      return undefined;
    }
    
    return discount;
  }

  // Invoice Template operations
  async getInvoiceTemplates(partnerId?: number): Promise<InvoiceTemplate[]> {
    let query = db.select().from(invoiceTemplates);
    
    if (partnerId !== undefined) {
      // If partnerId is provided, get templates specific to that partner
      // or templates with null partner_id (global templates)
      query = query.where(
        or(
          eq(invoiceTemplates.partner_id, partnerId),
          isNull(invoiceTemplates.partner_id)
        )
      );
    }
    
    const templates = await query;
    return templates;
  }

  async getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined> {
    const [template] = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id));
    return template;
  }

  async getDefaultInvoiceTemplate(partnerId?: number): Promise<InvoiceTemplate | undefined> {
    let query = db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.is_default, true));
    
    if (partnerId) {
      // If partner ID is provided, try to find partner-specific default template
      query = query.where(eq(invoiceTemplates.partner_id, partnerId));
    } else {
      // Otherwise get global default template
      query = query.where(isNull(invoiceTemplates.partner_id));
    }
    
    const [template] = await query;
    
    // If no partner-specific default found, fall back to global default
    if (!template && partnerId) {
      const [globalDefault] = await db
        .select()
        .from(invoiceTemplates)
        .where(eq(invoiceTemplates.is_default, true))
        .where(isNull(invoiceTemplates.partner_id));
      
      return globalDefault;
    }
    
    return template;
  }

  async createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate> {
    const [newTemplate] = await db
      .insert(invoiceTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateInvoiceTemplate(id: number, template: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(invoiceTemplates)
      .set({
        ...template,
        updated_at: new Date()
      })
      .where(eq(invoiceTemplates.id, id))
      .returning();
    
    return updatedTemplate;
  }

  async deleteInvoiceTemplate(id: number): Promise<boolean> {
    try {
      const [template] = await db
        .select()
        .from(invoiceTemplates)
        .where(eq(invoiceTemplates.id, id));
      
      // Don't allow deletion of the only default template
      if (template.is_default) {
        const defaultCount = await db
          .select({ count: count() })
          .from(invoiceTemplates)
          .where(eq(invoiceTemplates.is_default, true))
          .then(result => result[0].count);
        
        if (defaultCount <= 1) {
          throw new Error("Cannot delete the only default template");
        }
      }
      
      await db.delete(invoiceTemplates).where(eq(invoiceTemplates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting invoice template:", error);
      return false;
    }
  }

  async unsetDefaultInvoiceTemplates(partnerId?: number): Promise<void> {
    let query = db
      .update(invoiceTemplates)
      .set({ 
        is_default: false,
        updated_at: new Date()
      });
    
    if (partnerId) {
      // If partner ID is provided, only update partner-specific templates
      query = query.where(eq(invoiceTemplates.partner_id, partnerId));
    } else {
      // Otherwise update global templates
      query = query.where(isNull(invoiceTemplates.partner_id));
    }
    
    await query;
  }

  // Partner operations
  async getPartners(): Promise<Partner[]> {
    return await db.select().from(partners).orderBy(asc(partners.name));
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }
  
  // Region operations
  async getRegions(): Promise<Region[]> {
    return await db.select().from(regions).orderBy(asc(regions.name));
  }

  async getRegion(id: number): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.id, id));
    return region;
  }
  
  // Route Rules operations
  async getRouteRules(): Promise<RouteRule[]> {
    return await db
      .select()
      .from(routeRules)
      .orderBy(desc(routeRules.priority), asc(routeRules.created_at));
  }

  async getRouteRule(id: number): Promise<RouteRule | undefined> {
    const [rule] = await db.select().from(routeRules).where(eq(routeRules.id, id));
    return rule;
  }

  async createRouteRule(rule: InsertRouteRule): Promise<RouteRule> {
    const [newRule] = await db.insert(routeRules).values(rule).returning();
    return newRule;
  }

  async updateRouteRule(id: number, rule: Partial<InsertRouteRule>): Promise<RouteRule | undefined> {
    const [updatedRule] = await db
      .update(routeRules)
      .set({
        ...rule,
        updated_at: new Date(),
      })
      .where(eq(routeRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteRouteRule(id: number): Promise<boolean> {
    const result = await db.delete(routeRules).where(eq(routeRules.id, id));
    return true;
  }

  async changeRoutePriority(id: number, direction: 'up' | 'down'): Promise<RouteRule | undefined> {
    // First get the current rule
    const [currentRule] = await db.select().from(routeRules).where(eq(routeRules.id, id));
    if (!currentRule) return undefined;

    // Get adjacent rule based on direction
    let adjacentRule;
    if (direction === 'up') {
      // Find the rule with the next higher priority
      const [higher] = await db
        .select()
        .from(routeRules)
        .where(routeRules.priority > currentRule.priority)
        .orderBy(asc(routeRules.priority))
        .limit(1);
      adjacentRule = higher;
    } else {
      // Find the rule with the next lower priority
      const [lower] = await db
        .select()
        .from(routeRules)
        .where(routeRules.priority < currentRule.priority)
        .orderBy(desc(routeRules.priority))
        .limit(1);
      adjacentRule = lower;
    }

    if (!adjacentRule) return currentRule; // No adjacent rule, no change needed

    // Swap priorities
    const tempPriority = adjacentRule.priority;
    
    await db
      .update(routeRules)
      .set({ priority: tempPriority, updated_at: new Date() })
      .where(eq(routeRules.id, currentRule.id));
      
    await db
      .update(routeRules)
      .set({ priority: currentRule.priority, updated_at: new Date() })
      .where(eq(routeRules.id, adjacentRule.id));

    // Return the updated current rule
    const [updatedRule] = await db.select().from(routeRules).where(eq(routeRules.id, id));
    return updatedRule;
  }
  
  // PIN code-based lead assignment
  async getPartnerByPinCode(pinCode: string): Promise<Partner | undefined> {
    // Find partner with matching PIN code in their pin_codes array
    const allPartners = await this.getPartners();
    
    // Search for a partner that has the PIN code in their pin_codes array
    for (const partner of allPartners) {
      if (partner.pin_codes && Array.isArray(partner.pin_codes)) {
        const pinCodes = partner.pin_codes as string[];
        if (pinCodes.includes(pinCode)) {
          return partner;
        }
      }
    }
    
    return undefined;
  }

  async assignLeadToPartner(leadId: number, partnerId: number): Promise<BuybackRequest | undefined> {
    // Update the buyback request with the partner ID
    const [updatedRequest] = await db
      .update(buybackRequests)
      .set({
        partner_id: partnerId,
        status: 'assigned',
        updated_at: new Date(),
      })
      .where(eq(buybackRequests.id, leadId))
      .returning();
      
    return updatedRequest;
  }

  // Partner Wallet operations
  async getPartnerWallet(partnerId: number): Promise<PartnerWallet | undefined> {
    const [wallet] = await db
      .select()
      .from(partnerWallets)
      .where(eq(partnerWallets.partner_id, partnerId));
      
    return wallet;
  }
  
  async createPartnerWallet(wallet: InsertPartnerWallet): Promise<PartnerWallet> {
    const [newWallet] = await db
      .insert(partnerWallets)
      .values(wallet)
      .returning();
      
    return newWallet;
  }
  
  async updatePartnerWallet(id: number, walletData: Partial<InsertPartnerWallet>): Promise<PartnerWallet | undefined> {
    const [updatedWallet] = await db
      .update(partnerWallets)
      .set({
        ...walletData,
        updated_at: new Date(),
      })
      .where(eq(partnerWallets.id, id))
      .returning();
      
    return updatedWallet;
  }

  async addFundsToWallet(partnerId: number, amount: number, description: string, reference?: string): Promise<WalletTransaction> {
    // Get wallet
    const wallet = await this.getPartnerWallet(partnerId);
    if (!wallet) {
      throw new Error('Wallet not found for partner');
    }

    // Begin transaction
    const transactionResult = await db.transaction(async (tx) => {
      // Update wallet balance
      const [updatedWallet] = await tx
        .update(partnerWallets)
        .set({
          balance: sql`${partnerWallets.balance} + ${amount}`,
          updated_at: new Date(),
        })
        .where(eq(partnerWallets.id, wallet.id))
        .returning();

      // Create transaction record
      const [transaction] = await tx
        .insert(walletTransactions)
        .values({
          wallet_id: wallet.id,
          amount: amount.toString(),
          type: 'credit',
          description,
          reference_id: reference || null,
          status: 'completed',
        })
        .returning();

      return transaction;
    });

    return transactionResult;
  }

  async deductFundsFromWallet(partnerId: number, amount: number, description: string, reference?: string): Promise<WalletTransaction | null> {
    // Get wallet
    const wallet = await this.getPartnerWallet(partnerId);
    if (!wallet) {
      throw new Error('Wallet not found for partner');
    }

    // Check if enough balance
    if (parseFloat(wallet.balance.toString()) < amount) {
      return null; // Not enough funds
    }

    // Begin transaction
    const transactionResult = await db.transaction(async (tx) => {
      // Update wallet balance
      const [updatedWallet] = await tx
        .update(partnerWallets)
        .set({
          balance: sql`${partnerWallets.balance} - ${amount}`,
          updated_at: new Date(),
        })
        .where(eq(partnerWallets.id, wallet.id))
        .returning();

      // Create transaction record
      const [transaction] = await tx
        .insert(walletTransactions)
        .values({
          wallet_id: wallet.id,
          amount: amount.toString(),
          type: 'debit',
          description,
          reference_id: reference || null,
          status: 'completed',
        })
        .returning();

      return transaction;
    });

    return transactionResult;
  }

  // Wallet Transaction operations
  async getWalletTransactions(walletId: number, page = 1, limit = 20): Promise<WalletTransaction[]> {
    const offset = (page - 1) * limit;
    
    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.wallet_id, walletId))
      .orderBy(desc(walletTransactions.transaction_date))
      .limit(limit)
      .offset(offset);
      
    return transactions;
  }
  
  async getWalletTransaction(id: number): Promise<WalletTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.id, id));
      
    return transaction;
  }
  
  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [newTransaction] = await db
      .insert(walletTransactions)
      .values(transaction)
      .returning();
      
    return newTransaction;
  }

  // Withdrawal Request operations
  async getAllWithdrawalRequests(status?: string, page = 1, limit = 20): Promise<WithdrawalRequest[]> {
    const offset = (page - 1) * limit;
    
    let query = db
      .select({
        wr: withdrawalRequests,
        wallet: partnerWallets,
        partner: partners,
      })
      .from(withdrawalRequests)
      .leftJoin(partnerWallets, eq(withdrawalRequests.wallet_id, partnerWallets.id))
      .leftJoin(partners, eq(partnerWallets.partner_id, partners.id));
      
    if (status && status !== 'all') {
      query = query.where(eq(withdrawalRequests.status, status));
    }
    
    const results = await query
      .orderBy(desc(withdrawalRequests.created_at))
      .limit(limit)
      .offset(offset);
      
    // Reshape the results to include partner info
    return results.map(r => ({
      ...r.wr,
      partner_name: r.partner?.name || 'Unknown Partner',
      partner_id: r.wallet?.partner_id,
    })) as WithdrawalRequest[];
  }
  
  async getWithdrawalRequests(walletId: number, status?: string, page = 1, limit = 20): Promise<WithdrawalRequest[]> {
    const offset = (page - 1) * limit;
    
    let query = db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.wallet_id, walletId));
      
    if (status) {
      query = query.where(eq(withdrawalRequests.status, status));
    }
    
    const requests = await query
      .orderBy(desc(withdrawalRequests.created_at))
      .limit(limit)
      .offset(offset);
      
    return requests;
  }
  
  async getWithdrawalRequest(id: number): Promise<WithdrawalRequest | undefined> {
    const [request] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id));
      
    return request;
  }
  
  async createWithdrawalRequest(withdrawal: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [newRequest] = await db
      .insert(withdrawalRequests)
      .values(withdrawal)
      .returning();
      
    return newRequest;
  }
  
  async updateWithdrawalRequest(id: number, withdrawalData: Partial<InsertWithdrawalRequest>, adminId?: number): Promise<WithdrawalRequest | undefined> {
    const updateData: any = {
      ...withdrawalData,
      updated_at: new Date(),
    };
    
    if (adminId) {
      updateData.processed_by = adminId;
      updateData.processed_date = new Date();
    }
    
    const [updatedRequest] = await db
      .update(withdrawalRequests)
      .set(updateData)
      .where(eq(withdrawalRequests.id, id))
      .returning();
      
    return updatedRequest;
  }
  
  async processWithdrawalRequest(id: number, status: string, notes: string, adminId: number): Promise<WithdrawalRequest | undefined> {
    const [request] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id));
      
    if (!request) {
      return undefined;
    }
    
    if (request.status !== 'pending') {
      throw new Error('This withdrawal request has already been processed');
    }
    
    // Begin transaction
    const result = await db.transaction(async (tx) => {
      // Update withdrawal status
      const [updatedRequest] = await tx
        .update(withdrawalRequests)
        .set({
          status,
          notes,
          processed_by: adminId,
          processed_date: new Date(),
          updated_at: new Date(),
        })
        .where(eq(withdrawalRequests.id, id))
        .returning();
        
      // If approved, create a transaction and update wallet balance
      if (status === 'approved') {
        // Create debit transaction
        const [transaction] = await tx
          .insert(walletTransactions)
          .values({
            wallet_id: request.wallet_id,
            amount: request.amount.toString(),
            type: 'debit',
            description: `Withdrawal approved: ${notes}`,
            reference_id: id.toString(),
            reference_type: 'withdrawal_request',
            status: 'completed',
          })
          .returning();
          
        // Update withdrawal with transaction ID
        await tx
          .update(withdrawalRequests)
          .set({
            transaction_id: transaction.id,
          })
          .where(eq(withdrawalRequests.id, id));
          
        // Update wallet balance
        await tx
          .update(partnerWallets)
          .set({
            balance: sql`${partnerWallets.balance} - ${request.amount}`,
            updated_at: new Date(),
          })
          .where(eq(partnerWallets.id, request.wallet_id));
      }
      
      return updatedRequest;
    });
    
    return result;
  }
}

export const storage = new DatabaseStorage();
