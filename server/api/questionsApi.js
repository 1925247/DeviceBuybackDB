import { db } from '../db.js';
import { questions, answerChoices, questionGroups } from '../../shared/schema.js';
import { eq, and, inArray, asc } from 'drizzle-orm';

/**
 * Get all questions with their answer choices
 */
export async function getQuestions(req, res) {
  try {
    console.log('Fetching all questions...');
    
    const allQuestions = await db
      .select({
        id: questions.id,
        questionGroupId: questions.questionGroupId,
        text: questions.text,
        type: questions.type,
        required: questions.required,
        helpText: questions.helpText,
        sortOrder: questions.sortOrder,
        active: questions.active,
        deviceModelIds: questions.deviceModelIds,
        brandIds: questions.brandIds,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        groupName: questionGroups.name
      })
      .from(questions)
      .leftJoin(questionGroups, eq(questions.questionGroupId, questionGroups.id))
      .orderBy(asc(questions.sortOrder), asc(questions.text));
    
    // Get answer choices for each question
    const questionsWithAnswers = await Promise.all(
      allQuestions.map(async (question) => {
        const answers = await db
          .select()
          .from(answerChoices)
          .where(eq(answerChoices.questionId, question.id))
          .orderBy(asc(answerChoices.sortOrder));
        
        return {
          ...question,
          answers
        };
      })
    );
    
    console.log(`Found ${questionsWithAnswers.length} questions`);
    res.json(questionsWithAnswers);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
}

/**
 * Get a specific question by ID
 */
export async function getQuestion(req, res) {
  try {
    const { id } = req.params;
    console.log(`Fetching question with ID: ${id}`);
    
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)));
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Get answer choices
    const answers = await db
      .select()
      .from(answerChoices)
      .where(eq(answerChoices.questionId, question.id))
      .orderBy(asc(answerChoices.sortOrder));
    
    res.json({
      ...question,
      answers
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
}

/**
 * Create a new question with answer choices
 */
export async function createQuestion(req, res) {
  try {
    console.log('Creating question:', req.body);
    
    const {
      questionGroupId,
      text,
      type,
      required,
      helpText,
      sortOrder,
      active,
      deviceModelIds,
      brandIds,
      answers
    } = req.body;
    
    // Create the question
    const [newQuestion] = await db
      .insert(questions)
      .values({
        questionGroupId,
        text,
        type,
        required: required !== undefined ? required : true,
        helpText,
        sortOrder: sortOrder || 0,
        active: active !== undefined ? active : true,
        deviceModelIds: deviceModelIds && deviceModelIds.length > 0 ? deviceModelIds : null,
        brandIds: brandIds && brandIds.length > 0 ? brandIds : null
      })
      .returning();
    
    // Create answer choices if provided
    let createdAnswers = [];
    if (answers && answers.length > 0) {
      const answerValues = answers.map((answer, index) => ({
        questionId: newQuestion.id,
        text: answer.text,
        value: answer.value,
        priceImpact: answer.priceImpact || 0,
        percentageImpact: answer.percentageImpact || 0,
        severity: answer.severity || 'none',
        iconColor: answer.iconColor || 'gray',
        sortOrder: answer.sortOrder !== undefined ? answer.sortOrder : index,
        active: answer.active !== undefined ? answer.active : true,
        deviceSpecific: answer.deviceSpecific || false
      }));
      
      createdAnswers = await db
        .insert(answerChoices)
        .values(answerValues)
        .returning();
    }
    
    const result = {
      ...newQuestion,
      answers: createdAnswers
    };
    
    console.log('Question created:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
}

/**
 * Update a question and its answer choices
 */
export async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    console.log(`Updating question ${id}:`, req.body);
    
    const {
      text,
      type,
      required,
      helpText,
      sortOrder,
      active,
      deviceModelIds,
      brandIds,
      answers
    } = req.body;
    
    // Update the question
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        text,
        type,
        required,
        helpText,
        sortOrder,
        active,
        deviceModelIds: deviceModelIds && deviceModelIds.length > 0 ? deviceModelIds : null,
        brandIds: brandIds && brandIds.length > 0 ? brandIds : null,
        updatedAt: new Date()
      })
      .where(eq(questions.id, parseInt(id)))
      .returning();
    
    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Update answer choices if provided
    let updatedAnswers = [];
    if (answers && answers.length > 0) {
      // Delete existing answers
      await db
        .delete(answerChoices)
        .where(eq(answerChoices.questionId, parseInt(id)));
      
      // Create new answers
      const answerValues = answers.map((answer, index) => ({
        questionId: parseInt(id),
        text: answer.text,
        value: answer.value,
        priceImpact: answer.priceImpact || 0,
        percentageImpact: answer.percentageImpact || 0,
        severity: answer.severity || 'none',
        iconColor: answer.iconColor || 'gray',
        sortOrder: answer.sortOrder !== undefined ? answer.sortOrder : index,
        active: answer.active !== undefined ? answer.active : true,
        deviceSpecific: answer.deviceSpecific || false
      }));
      
      updatedAnswers = await db
        .insert(answerChoices)
        .values(answerValues)
        .returning();
    }
    
    const result = {
      ...updatedQuestion,
      answers: updatedAnswers
    };
    
    console.log('Question updated:', result);
    res.json(result);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
}

/**
 * Delete a question and its answer choices
 */
export async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    console.log(`Deleting question with ID: ${id}`);
    
    // Delete answer choices first
    await db
      .delete(answerChoices)
      .where(eq(answerChoices.questionId, parseInt(id)));
    
    // Delete the question
    const [deletedQuestion] = await db
      .delete(questions)
      .where(eq(questions.id, parseInt(id)))
      .returning();
    
    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    console.log('Question deleted:', deletedQuestion);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
}

/**
 * Get questions for specific device models
 */
export async function getQuestionsForDeviceModels(req, res) {
  try {
    const { modelIds } = req.query; // Comma-separated model IDs
    console.log(`Fetching questions for device models: ${modelIds}`);
    
    if (!modelIds) {
      return res.status(400).json({ error: 'Model IDs are required' });
    }
    
    const modelIdArray = modelIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (modelIdArray.length === 0) {
      return res.status(400).json({ error: 'Valid model IDs are required' });
    }
    
    // Get questions that either:
    // 1. Have no device model restrictions (deviceModelIds is null)
    // 2. Include any of the specified model IDs
    const allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.active, true))
      .orderBy(asc(questions.sortOrder));
    
    // Filter questions based on device model targeting
    const filteredQuestions = allQuestions.filter(question => {
      if (!question.deviceModelIds || question.deviceModelIds.length === 0) {
        return true; // No restrictions = applies to all models
      }
      
      // Check if any of the target model IDs are in the question's device model IDs
      return question.deviceModelIds.some(qModelId => 
        modelIdArray.includes(parseInt(qModelId))
      );
    });
    
    // Get answer choices for filtered questions
    const questionsWithAnswers = await Promise.all(
      filteredQuestions.map(async (question) => {
        const answers = await db
          .select()
          .from(answerChoices)
          .where(eq(answerChoices.questionId, question.id))
          .orderBy(asc(answerChoices.sortOrder));
        
        return {
          ...question,
          answers
        };
      })
    );
    
    console.log(`Found ${questionsWithAnswers.length} questions for models ${modelIds}`);
    res.json(questionsWithAnswers);
  } catch (error) {
    console.error('Error fetching questions for device models:', error);
    res.status(500).json({ error: 'Failed to fetch questions for device models' });
  }
}

/**
 * Get questions for specific brands
 */
export async function getQuestionsForBrands(req, res) {
  try {
    const { brandIds } = req.query; // Comma-separated brand IDs
    console.log(`Fetching questions for brands: ${brandIds}`);
    
    if (!brandIds) {
      return res.status(400).json({ error: 'Brand IDs are required' });
    }
    
    const brandIdArray = brandIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    // Get questions that either have no brand restrictions or include the specified brands
    const allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.active, true))
      .orderBy(asc(questions.sortOrder));
    
    const filteredQuestions = allQuestions.filter(question => {
      if (!question.brandIds || question.brandIds.length === 0) {
        return true; // No restrictions = applies to all brands
      }
      
      return question.brandIds.some(qBrandId => 
        brandIdArray.includes(parseInt(qBrandId))
      );
    });
    
    // Get answer choices for filtered questions
    const questionsWithAnswers = await Promise.all(
      filteredQuestions.map(async (question) => {
        const answers = await db
          .select()
          .from(answerChoices)
          .where(eq(answerChoices.questionId, question.id))
          .orderBy(asc(answerChoices.sortOrder));
        
        return {
          ...question,
          answers
        };
      })
    );
    
    console.log(`Found ${questionsWithAnswers.length} questions for brands ${brandIds}`);
    res.json(questionsWithAnswers);
  } catch (error) {
    console.error('Error fetching questions for brands:', error);
    res.status(500).json({ error: 'Failed to fetch questions for brands' });
  }
}