const { db } = require('../db');
const { eq, and, or, isNull } = require('drizzle-orm');
const { 
  conditionQuestions, 
  conditionAnswers, 
  brands,
  deviceTypes
} = require('../../shared/schema');

/**
 * Gets brand-specific or generic questionnaires for a device
 * @param {object} params - Query parameters
 * @param {number} params.deviceTypeId - ID of the device type
 * @param {number} params.brandId - ID of the brand (optional)
 * @returns {Promise<array>} - Array of questionnaires with their answers
 */
async function getDeviceQuestionnaire({ deviceTypeId, brandId }) {
  try {
    // First, get questions for this device type
    // If brandId is provided, prioritize brand-specific questions
    // Otherwise, get generic questions (where brand_id is null)
    
    let questionQuery = db
      .select()
      .from(conditionQuestions)
      .where(
        and(
          eq(conditionQuestions.device_type_id, deviceTypeId),
          eq(conditionQuestions.active, true)
        )
      )
      .orderBy(conditionQuestions.order);
    
    // If brand ID is provided, prioritize brand-specific questions
    if (brandId) {
      questionQuery = db
        .select()
        .from(conditionQuestions)
        .where(
          and(
            eq(conditionQuestions.device_type_id, deviceTypeId),
            eq(conditionQuestions.active, true),
            or(
              eq(conditionQuestions.brand_id, brandId),
              isNull(conditionQuestions.brand_id)
            )
          )
        )
        .orderBy(conditionQuestions.brand_id.desc()) // Brand-specific first
        .orderBy(conditionQuestions.order);
    }
    
    const questions = await questionQuery;
    
    // Get all the answers for these questions
    const questionIds = questions.map(q => q.id);
    
    // If no questions found, return empty array
    if (questionIds.length === 0) {
      return [];
    }
    
    const answers = await db
      .select()
      .from(conditionAnswers)
      .where(
        conditionAnswers.question_id.in(questionIds)
      )
      .orderBy(conditionAnswers.order);
    
    // Group answers by question
    const answersMap = {};
    answers.forEach(answer => {
      if (!answersMap[answer.question_id]) {
        answersMap[answer.question_id] = [];
      }
      answersMap[answer.question_id].push(answer);
    });
    
    // Build complete questionnaire
    const questionnaire = questions.map(question => ({
      id: question.id,
      question: question.question,
      questionType: question.question_type,
      required: question.required,
      helpText: question.help_text,
      order: question.order,
      deviceTypeId: question.device_type_id,
      brandId: question.brand_id,
      isBrandSpecific: question.brand_id !== null,
      answers: answersMap[question.id] || []
    }));
    
    return questionnaire;
    
  } catch (error) {
    console.error('Error fetching device questionnaire:', error);
    throw error;
  }
}

/**
 * Gets all available brand-specific questionnaires
 * @returns {Promise<object>} - Object with device types and their brand questionnaires
 */
async function getAllBrandQuestionnaires() {
  try {
    // Get all device types
    const deviceTypesData = await db
      .select()
      .from(deviceTypes)
      .where(eq(deviceTypes.active, true));
    
    // Get all brands
    const brandsData = await db
      .select()
      .from(brands)
      .where(eq(brands.active, true));
    
    // Get all brand-specific questions
    const brandQuestions = await db
      .select()
      .from(conditionQuestions)
      .where(
        and(
          eq(conditionQuestions.active, true),
          isNull(conditionQuestions.brand_id).not()
        )
      );
    
    // Build result structure
    const result = {
      deviceTypes: deviceTypesData,
      brands: brandsData,
      questionnaires: {}
    };
    
    // Group questions by device type and brand
    brandQuestions.forEach(question => {
      if (!result.questionnaires[question.device_type_id]) {
        result.questionnaires[question.device_type_id] = {};
      }
      
      if (!result.questionnaires[question.device_type_id][question.brand_id]) {
        result.questionnaires[question.device_type_id][question.brand_id] = [];
      }
      
      result.questionnaires[question.device_type_id][question.brand_id].push(question);
    });
    
    return result;
    
  } catch (error) {
    console.error('Error fetching all brand questionnaires:', error);
    throw error;
  }
}

/**
 * Creates a new questionnaire question with answers
 * @param {object} data - Questionnaire data
 * @param {string} data.question - Question text
 * @param {number} data.deviceTypeId - Device type ID
 * @param {number} data.brandId - Brand ID (optional)
 * @param {string} data.questionType - Question type (multiple_choice, text, etc.)
 * @param {boolean} data.required - Whether the question is required
 * @param {string} data.helpText - Help text for the question
 * @param {Array} data.answers - Array of answer objects
 * @returns {Promise<object>} - Created question with answers
 */
async function createQuestionWithAnswers(data) {
  try {
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // First, get the maximum order for this device type and brand
      const maxOrderQuery = tx
        .select({ maxOrder: sql`MAX(${conditionQuestions.order})` })
        .from(conditionQuestions)
        .where(
          and(
            eq(conditionQuestions.device_type_id, data.deviceTypeId),
            data.brandId 
              ? eq(conditionQuestions.brand_id, data.brandId)
              : isNull(conditionQuestions.brand_id)
          )
        );
      
      const maxOrderResult = await maxOrderQuery;
      const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1;
      
      // Create the question
      const [question] = await tx
        .insert(conditionQuestions)
        .values({
          question: data.question,
          device_type_id: data.deviceTypeId,
          brand_id: data.brandId || null,
          question_type: data.questionType || 'multiple_choice',
          required: data.required !== undefined ? data.required : true,
          help_text: data.helpText || null,
          order: nextOrder,
          active: true,
        })
        .returning();
      
      // Create the answers if provided
      const createdAnswers = [];
      if (data.answers && data.answers.length > 0) {
        let answerOrder = 1;
        for (const answer of data.answers) {
          const [createdAnswer] = await tx
            .insert(conditionAnswers)
            .values({
              question_id: question.id,
              answer: answer.text,
              impact: answer.impact || 0,
              deduction_type: answer.deductionType || 'percentage',
              fixed_amount: answer.fixedAmount || null,
              order: answerOrder++,
              applicable_brands: answer.applicableBrands || [],
              applicable_models: answer.applicableModels || [],
              description: answer.description || null,
            })
            .returning();
          
          createdAnswers.push(createdAnswer);
        }
      }
      
      return {
        question,
        answers: createdAnswers
      };
    });
    
    return result;
    
  } catch (error) {
    console.error('Error creating question with answers:', error);
    throw error;
  }
}

/**
 * Calculates the price impact of answered questionnaires
 * @param {object} params - Parameters for calculation
 * @param {number} params.deviceModelId - Device model ID
 * @param {object} params.answers - Object with question IDs as keys and answer IDs as values
 * @returns {Promise<object>} - Price impact details
 */
async function calculateQuestionnaireImpact({ deviceModelId, answers }) {
  try {
    // Get the device model to access device type and brand
    const [deviceModel] = await db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        deviceTypeId: deviceModels.device_type_id,
        brandId: deviceModels.brand_id,
      })
      .from(deviceModels)
      .where(eq(deviceModels.id, deviceModelId));
    
    if (!deviceModel) {
      throw new Error(`Device model with ID ${deviceModelId} not found`);
    }
    
    // Get all the selected answers
    const answerIds = Object.values(answers);
    
    if (answerIds.length === 0) {
      return {
        deviceModel,
        impacts: [],
        totalPercentageImpact: 0,
        totalFixedImpact: 0,
      };
    }
    
    const selectedAnswers = await db
      .select({
        id: conditionAnswers.id,
        answer: conditionAnswers.answer,
        impact: conditionAnswers.impact,
        deductionType: conditionAnswers.deduction_type,
        fixedAmount: conditionAnswers.fixed_amount,
        questionId: conditionAnswers.question_id,
      })
      .from(conditionAnswers)
      .where(conditionAnswers.id.in(answerIds));
    
    // Get the questions for these answers
    const questionIds = selectedAnswers.map(a => a.questionId);
    
    const questions = await db
      .select({
        id: conditionQuestions.id,
        question: conditionQuestions.question,
      })
      .from(conditionQuestions)
      .where(conditionQuestions.id.in(questionIds));
    
    // Create a map of questions by ID
    const questionsMap = {};
    questions.forEach(q => {
      questionsMap[q.id] = q;
    });
    
    // Calculate impacts
    let totalPercentageImpact = 0;
    let totalFixedImpact = 0;
    
    const impacts = selectedAnswers.map(answer => {
      const question = questionsMap[answer.questionId];
      
      // Calculate impact
      if (answer.deductionType === 'percentage') {
        totalPercentageImpact += Number(answer.impact);
      } else if (answer.deductionType === 'fixed') {
        totalFixedImpact += Number(answer.fixedAmount || 0);
      }
      
      return {
        questionId: answer.questionId,
        question: question ? question.question : `Question ID: ${answer.questionId}`,
        answerId: answer.id,
        answer: answer.answer,
        deductionType: answer.deductionType,
        impact: answer.deductionType === 'percentage' ? Number(answer.impact) : null,
        fixedAmount: answer.deductionType === 'fixed' ? Number(answer.fixedAmount) : null,
      };
    });
    
    return {
      deviceModel,
      impacts,
      totalPercentageImpact,
      totalFixedImpact,
    };
    
  } catch (error) {
    console.error('Error calculating questionnaire impact:', error);
    throw error;
  }
}

module.exports = {
  getDeviceQuestionnaire,
  getAllBrandQuestionnaires,
  createQuestionWithAnswers,
  calculateQuestionnaireImpact,
};