import { db } from "../db.js";
import { 
  deviceQuestionMappings, 
  productQuestionMappings, 
  questions, 
  answerChoices, 
  questionGroups,
  deviceModels,
  brands,
  deviceTypes,
  insertDeviceQuestionMappingSchema,
  insertProductQuestionMappingSchema
} from "../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";

/**
 * Get all questions mapped to a specific device model
 */
export async function getDeviceModelQuestions(req, res) {
  try {
    const { modelId } = req.params;
    
    if (!modelId || isNaN(Number(modelId))) {
      return res.status(400).json({ error: "Valid model ID is required" });
    }

    // Get questions mapped to the device model with full details
    const mappedQuestions = await db
      .select({
        questionId: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        order: questions.order,
        required: questions.required,
        tooltip: questions.tooltip,
        groupId: questionGroups.id,
        groupName: questionGroups.name,
        groupStatement: questionGroups.statement,
        groupIcon: questionGroups.icon,
        modelId: deviceModels.id,
        modelName: deviceModels.name,
        brandName: brands.name,
        deviceTypeName: deviceTypes.name
      })
      .from(deviceQuestionMappings)
      .innerJoin(questions, eq(deviceQuestionMappings.questionId, questions.id))
      .leftJoin(questionGroups, eq(questions.groupId, questionGroups.id))
      .innerJoin(deviceModels, eq(deviceQuestionMappings.modelId, deviceModels.id))
      .innerJoin(brands, eq(deviceModels.brand_id, brands.id))
      .innerJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .where(and(
        eq(deviceQuestionMappings.modelId, Number(modelId)),
        eq(deviceQuestionMappings.active, true),
        eq(questions.active, true)
      ))
      .orderBy(questions.order);

    // Get answer choices for each question
    const questionIds = mappedQuestions.map(q => q.questionId);
    const answers = questionIds.length > 0 ? await db
      .select()
      .from(answerChoices)
      .where(sql`${answerChoices.questionId} = ANY(${questionIds})`)
      .orderBy(answerChoices.order) : [];

    // Group answers by question ID
    const answersByQuestion = answers.reduce((acc, answer) => {
      if (!acc[answer.questionId]) {
        acc[answer.questionId] = [];
      }
      acc[answer.questionId].push(answer);
      return acc;
    }, {});

    // Combine questions with their answers
    const questionsWithAnswers = mappedQuestions.map(question => ({
      ...question,
      answers: answersByQuestion[question.questionId] || []
    }));

    res.json({
      modelId: Number(modelId),
      modelInfo: mappedQuestions[0] ? {
        name: mappedQuestions[0].modelName,
        brand: mappedQuestions[0].brandName,
        deviceType: mappedQuestions[0].deviceTypeName
      } : null,
      questions: questionsWithAnswers
    });

  } catch (error) {
    console.error("Error fetching device model questions:", error);
    res.status(500).json({ error: "Failed to fetch device model questions" });
  }
}

/**
 * Map questions to a device model
 */
export async function mapQuestionsToDeviceModel(req, res) {
  try {
    const { modelId } = req.params;
    const { questionIds } = req.body;

    if (!modelId || isNaN(Number(modelId))) {
      return res.status(400).json({ error: "Valid model ID is required" });
    }

    if (!Array.isArray(questionIds)) {
      return res.status(400).json({ error: "Question IDs must be an array" });
    }

    // Validate the device model exists
    const model = await db
      .select()
      .from(deviceModels)
      .where(eq(deviceModels.id, Number(modelId)))
      .limit(1);

    if (model.length === 0) {
      return res.status(404).json({ error: "Device model not found" });
    }

    // Remove existing mappings for this model
    await db
      .delete(deviceQuestionMappings)
      .where(eq(deviceQuestionMappings.modelId, Number(modelId)));

    // Add new mappings
    if (questionIds.length > 0) {
      const mappings = questionIds.map((questionId) => ({
        modelId: Number(modelId),
        questionId: Number(questionId),
        active: true
      }));

      await db.insert(deviceQuestionMappings).values(mappings);
    }

    res.json({ 
      success: true, 
      message: `Mapped ${questionIds.length} questions to device model`,
      modelId: Number(modelId),
      questionCount: questionIds.length
    });

  } catch (error) {
    console.error("Error mapping questions to device model:", error);
    res.status(500).json({ error: "Failed to map questions to device model" });
  }
}

/**
 * Get all available questions for mapping
 */
export async function getAvailableQuestions(req, res) {
  try {
    const questionsWithAnswers = await db
      .select({
        questionId: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        order: questions.order,
        required: questions.required,
        tooltip: questions.tooltip,
        groupId: questionGroups.id,
        groupName: questionGroups.name,
        groupStatement: questionGroups.statement,
        groupIcon: questionGroups.icon
      })
      .from(questions)
      .leftJoin(questionGroups, eq(questions.groupId, questionGroups.id))
      .where(eq(questions.active, true))
      .orderBy(questions.order);

    // Get all answer choices
    const answers = await db
      .select()
      .from(answerChoices)
      .orderBy(answerChoices.order);

    // Group answers by question ID
    const answersByQuestion = answers.reduce((acc, answer) => {
      if (!acc[answer.questionId]) {
        acc[answer.questionId] = [];
      }
      acc[answer.questionId].push(answer);
      return acc;
    }, {});

    // Combine questions with their answers
    const result = questionsWithAnswers.map(question => ({
      ...question,
      answers: answersByQuestion[question.questionId] || []
    }));

    res.json(result);

  } catch (error) {
    console.error("Error fetching available questions:", error);
    res.status(500).json({ error: "Failed to fetch available questions" });
  }
}

/**
 * Get question mapping statistics
 */
export async function getQuestionMappingStats(req, res) {
  try {
    // Get total device models
    const totalModels = await db
      .select({ count: sql`count(*)` })
      .from(deviceModels)
      .where(eq(deviceModels.active, true));

    // Get models with questions mapped
    const modelsWithQuestions = await db
      .select({ 
        modelId: deviceQuestionMappings.modelId,
        questionCount: sql`count(*)` 
      })
      .from(deviceQuestionMappings)
      .where(eq(deviceQuestionMappings.active, true))
      .groupBy(deviceQuestionMappings.modelId);

    // Get total questions
    const totalQuestions = await db
      .select({ count: sql`count(*)` })
      .from(questions)
      .where(eq(questions.active, true));

    // Get most mapped questions
    const popularQuestions = await db
      .select({
        questionId: deviceQuestionMappings.questionId,
        questionText: questions.questionText,
        mappingCount: sql`count(*)`
      })
      .from(deviceQuestionMappings)
      .innerJoin(questions, eq(deviceQuestionMappings.questionId, questions.id))
      .where(and(
        eq(deviceQuestionMappings.active, true),
        eq(questions.active, true)
      ))
      .groupBy(deviceQuestionMappings.questionId, questions.questionText)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    res.json({
      totalModels: Number(totalModels[0]?.count || 0),
      modelsWithQuestions: modelsWithQuestions.length,
      totalQuestions: Number(totalQuestions[0]?.count || 0),
      averageQuestionsPerModel: modelsWithQuestions.length > 0 
        ? Math.round(modelsWithQuestions.reduce((sum, m) => sum + Number(m.questionCount), 0) / modelsWithQuestions.length)
        : 0,
      popularQuestions: popularQuestions.map(q => ({
        ...q,
        mappingCount: Number(q.mappingCount)
      }))
    });

  } catch (error) {
    console.error("Error fetching question mapping stats:", error);
    res.status(500).json({ error: "Failed to fetch question mapping statistics" });
  }
}