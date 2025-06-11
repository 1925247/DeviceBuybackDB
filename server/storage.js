import { 
  users,
  partners,
  partnerWallets,
  walletTransactions,
  withdrawalRequests,
  partnerStaff,
  rolePermissions,
  routeRules,
  postalCodes, 
  regions,
  deviceTypes,
  brands,
  deviceModels,
  deviceModelVariants,
  brandDeviceTypes,
  featureToggles,
  // Question Management
  questionGroups,
  questions,
  answerChoices,
  // Legacy condition questions
  conditionQuestions, conditionAnswers,
  // Indian database tables
  indianStates,
  indianCities,
  indianPostalCodes,
  gstConfiguration,
  kycDocumentTypes,
  kycDocuments,
  partnerServiceAreas,
  tenantConfigurations,
  tenantCustomizations,
  // Buyback functionality
  buybackRequests
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, asc, sql, like, ilike, count, or, isNull } from "drizzle-orm";

// Database operations class
export class DatabaseStorage {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsers() {
    return await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      partnerId: users.partnerId,
      regionId: users.regionId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id, updateData) {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
  }

  // Partner operations
  async getPartners() {
    return await db.select().from(partners).orderBy(desc(partners.createdAt));
  }

  async getPartner(id) {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async createPartner(insertPartner) {
    const [partner] = await db
      .insert(partners)
      .values(insertPartner)
      .returning();
    return partner;
  }

  async updatePartner(id, updateData) {
    const [partner] = await db
      .update(partners)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async deletePartner(id) {
    await db.delete(partners).where(eq(partners.id, id));
  }

  // Partner Wallet operations
  async getPartnerWallet(partnerId) {
    const [wallet] = await db
      .select()
      .from(partnerWallets)
      .where(eq(partnerWallets.partnerId, partnerId));
    return wallet || undefined;
  }

  async createPartnerWallet(insertWallet) {
    const [wallet] = await db
      .insert(partnerWallets)
      .values(insertWallet)
      .returning();
    return wallet;
  }

  async updatePartnerWallet(id, updateData) {
    const [wallet] = await db
      .update(partnerWallets)
      .set({ ...updateData, lastUpdated: new Date() })
      .where(eq(partnerWallets.id, id))
      .returning();
    return wallet;
  }

  // Wallet Transaction operations
  async getWalletTransactions(walletId) {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.processedAt));
  }

  async createWalletTransaction(insertTransaction) {
    const [transaction] = await db
      .insert(walletTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  // Withdrawal Request operations
  async getWithdrawalRequests(partnerId) {
    const query = partnerId
      ? db.select().from(withdrawalRequests).where(eq(withdrawalRequests.partnerId, partnerId))
      : db.select().from(withdrawalRequests);
    
    return await query.orderBy(desc(withdrawalRequests.createdAt));
  }

  async createWithdrawalRequest(insertRequest) {
    const [request] = await db
      .insert(withdrawalRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateWithdrawalRequest(id, updateData) {
    const [request] = await db
      .update(withdrawalRequests)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request;
  }

  // Route Rules operations
  async getRouteRules() {
    return await db.select().from(routeRules).orderBy(asc(routeRules.priority));
  }

  async createRouteRule(insertRouteRule) {
    const [routeRule] = await db
      .insert(routeRules)
      .values(insertRouteRule)
      .returning();
    return routeRule;
  }

  async updateRouteRule(id, updateData) {
    const [routeRule] = await db
      .update(routeRules)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(routeRules.id, id))
      .returning();
    return routeRule;
  }

  async deleteRouteRule(id) {
    await db.delete(routeRules).where(eq(routeRules.id, id));
  }

  // Device Types operations
  async getDeviceTypes() {
    return await db.select().from(deviceTypes).where(eq(deviceTypes.active, true));
  }

  async createDeviceType(insertDeviceType) {
    const [deviceType] = await db
      .insert(deviceTypes)
      .values(insertDeviceType)
      .returning();
    return deviceType;
  }

  async updateDeviceType(id, updateData) {
    const [deviceType] = await db
      .update(deviceTypes)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deviceTypes.id, id))
      .returning();
    return deviceType;
  }

  // Brands operations
  async getBrands() {
    return await db.select().from(brands).where(eq(brands.active, true));
  }

  async createBrand(insertBrand) {
    const [brand] = await db
      .insert(brands)
      .values(insertBrand)
      .returning();
    return brand;
  }

  async updateBrand(id, updateData) {
    const [brand] = await db
      .update(brands)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  // Device Models operations
  async getDeviceModels() {
    return await db.select().from(deviceModels).where(eq(deviceModels.active, true));
  }

  async getDeviceModelsByBrand(brandId) {
    return await db.select().from(deviceModels)
      .where(and(eq(deviceModels.brand_id, brandId), eq(deviceModels.active, true)))
      .orderBy(deviceModels.name);
  }

  async getDeviceModelVariants(modelId) {
    return await db.select().from(deviceModelVariants)
      .where(and(eq(deviceModelVariants.model_id, modelId), eq(deviceModelVariants.active, true)))
      .orderBy(deviceModelVariants.variant_name);
  }

  async createDeviceModelVariant(insertVariant) {
    const [variant] = await db
      .insert(deviceModelVariants)
      .values(insertVariant)
      .returning();
    return variant;
  }

  async updateDeviceModelVariant(id, updateData) {
    const [variant] = await db
      .update(deviceModelVariants)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deviceModelVariants.id, id))
      .returning();
    return variant;
  }

  async createDeviceModel(insertDeviceModel) {
    const [deviceModel] = await db
      .insert(deviceModels)
      .values(insertDeviceModel)
      .returning();
    return deviceModel;
  }

  async updateDeviceModel(id, updateData) {
    const [deviceModel] = await db
      .update(deviceModels)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deviceModels.id, id))
      .returning();
    return deviceModel;
  }

  // Feature Toggles operations
  async getFeatureToggles() {
    return await db.select().from(featureToggles).orderBy(asc(featureToggles.category));
  }

  async getFeatureToggle(featureKey) {
    const [toggle] = await db
      .select()
      .from(featureToggles)
      .where(eq(featureToggles.featureKey, featureKey));
    return toggle || undefined;
  }

  async createFeatureToggle(insertToggle) {
    const [toggle] = await db
      .insert(featureToggles)
      .values(insertToggle)
      .returning();
    return toggle;
  }

  async updateFeatureToggle(id, updateData) {
    const [toggle] = await db
      .update(featureToggles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(featureToggles.id, id))
      .returning();
    return toggle;
  }

  // Question Groups operations
  async getQuestionGroups() {
    return await db.select().from(questionGroups).where(eq(questionGroups.active, true));
  }

  async createQuestionGroup(insertGroup) {
    const [group] = await db
      .insert(questionGroups)
      .values(insertGroup)
      .returning();
    return group;
  }

  async updateQuestionGroup(id, updateData) {
    const [group] = await db
      .update(questionGroups)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(questionGroups.id, id))
      .returning();
    return group;
  }

  // Questions operations
  async getQuestions() {
    return await db.select().from(questions).where(eq(questions.active, true));
  }

  async createQuestion(insertQuestion) {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async updateQuestion(id, updateData) {
    const [question] = await db
      .update(questions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  // Answer Choices operations
  async getAnswerChoices(questionId) {
    const query = questionId
      ? db.select().from(answerChoices).where(eq(answerChoices.questionId, questionId))
      : db.select().from(answerChoices);
    
    return await query.orderBy(asc(answerChoices.order));
  }

  async createAnswerChoice(insertChoice) {
    const [choice] = await db
      .insert(answerChoices)
      .values(insertChoice)
      .returning();
    return choice;
  }

  async updateAnswerChoice(id, updateData) {
    const [choice] = await db
      .update(answerChoices)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(answerChoices.id, id))
      .returning();
    return choice;
  }

  // Buyback Requests operations
  async getBuybackRequests() {
    return await db.select().from(buybackRequests).orderBy(desc(buybackRequests.createdAt));
  }

  async getBuybackRequest(id) {
    const [request] = await db.select().from(buybackRequests).where(eq(buybackRequests.id, id));
    return request || undefined;
  }

  async createBuybackRequest(insertRequest) {
    try {
      console.log('Inserting buyback request:', insertRequest);
      
      // Generate order ID if not provided
      const orderId = insertRequest.orderId || insertRequest.order_id || `BR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Map the request data to match database schema
      const dbRequest = {
        user_id: insertRequest.user_id || 1,
        device_type: insertRequest.deviceType || insertRequest.device_type || 'smartphones',
        manufacturer: insertRequest.manufacturer || insertRequest.brand || 'unknown',
        model: insertRequest.model || 'unknown',
        condition: insertRequest.condition || 'pending-assessment',
        offered_price: parseFloat(insertRequest.offeredPrice || insertRequest.offered_price || 0),
        status: insertRequest.status || 'pending',
        customer_name: insertRequest.customerName || insertRequest.customer_name || '',
        customer_email: insertRequest.customerEmail || insertRequest.customer_email || '',
        customer_phone: insertRequest.customerPhone || insertRequest.customer_phone || '',
        pickup_address: insertRequest.pickupAddress || insertRequest.pickup_address || '',
        pickup_date: insertRequest.pickup_date || null,
        pickup_time: insertRequest.pickup_time || null,
        device_model_id: insertRequest.deviceModelId || insertRequest.device_model_id || null,
        notes: insertRequest.notes || '',
        order_id: orderId,
        condition_answers: insertRequest.conditionAnswers || insertRequest.condition_answers || null,
        pin_code: insertRequest.pin_code || null,
        final_price: parseFloat(insertRequest.final_price || insertRequest.offeredPrice || insertRequest.offered_price || 0)
      };
      
      console.log('Mapped database request:', dbRequest);
      
      const [request] = await db
        .insert(buybackRequests)
        .values(dbRequest)
        .returning();
        
      console.log('Successfully created buyback request:', request);
      return request;
    } catch (error) {
      console.error('Database error in createBuybackRequest:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async updateBuybackRequest(id, updateData) {
    const [request] = await db
      .update(buybackRequests)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(buybackRequests.id, id))
      .returning();
    return request;
  }

  // Database status check
  async getDatabaseStatus() {
    try {
      const result = await db.select({ count: count() }).from(users);
      return {
        status: "connected",
        userCount: result[0]?.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const storage = new DatabaseStorage();