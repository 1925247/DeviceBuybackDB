import { db } from '../db.js';
import { questionGroups, questions, answerChoices } from '../../shared/schema.js';
import { eq, desc, asc } from 'drizzle-orm';

/**
 * Get all question groups
 */
export async function getQuestionGroups(req, res) {
  try {
    console.log('Fetching all question groups...');
    
    const groups = await db
      .select()
      .from(questionGroups)
      .orderBy(asc(questionGroups.sortOrder), asc(questionGroups.name));
    
    console.log(`Found ${groups.length} question groups`);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ error: 'Failed to fetch question groups' });
  }
}

/**
 * Get a specific question group by ID
 */
export async function getQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    console.log(`Fetching question group with ID: ${id}`);
    
    const [group] = await db
      .select()
      .from(questionGroups)
      .where(eq(questionGroups.id, parseInt(id)));
    
    if (!group) {
      return res.status(404).json({ error: 'Question group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching question group:', error);
    res.status(500).json({ error: 'Failed to fetch question group' });
  }
}

/**
 * Create a new question group
 */
export async function createQuestionGroup(req, res) {
  try {
    console.log('Creating question group:', req.body);
    
    const { name, description, category, deviceTypes, sortOrder, active } = req.body;
    
    const [newGroup] = await db
      .insert(questionGroups)
      .values({
        name,
        description,
        category: category || 'general',
        deviceTypes: deviceTypes || null,
        sortOrder: sortOrder || 0,
        active: active !== undefined ? active : true
      })
      .returning();
    
    console.log('Question group created:', newGroup);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating question group:', error);
    res.status(500).json({ error: 'Failed to create question group' });
  }
}

/**
 * Update a question group
 */
export async function updateQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    console.log(`Updating question group ${id}:`, req.body);
    
    const { name, description, category, deviceTypes, sortOrder, active } = req.body;
    
    const [updatedGroup] = await db
      .update(questionGroups)
      .set({
        name,
        description,
        category,
        deviceTypes,
        sortOrder,
        active,
        updatedAt: new Date()
      })
      .where(eq(questionGroups.id, parseInt(id)))
      .returning();
    
    if (!updatedGroup) {
      return res.status(404).json({ error: 'Question group not found' });
    }
    
    console.log('Question group updated:', updatedGroup);
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating question group:', error);
    res.status(500).json({ error: 'Failed to update question group' });
  }
}

/**
 * Delete a question group
 */
export async function deleteQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    console.log(`Deleting question group with ID: ${id}`);
    
    // Check if group has questions
    const groupQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.questionGroupId, parseInt(id)));
    
    if (groupQuestions.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete question group with existing questions',
        questionCount: groupQuestions.length
      });
    }
    
    const [deletedGroup] = await db
      .delete(questionGroups)
      .where(eq(questionGroups.id, parseInt(id)))
      .returning();
    
    if (!deletedGroup) {
      return res.status(404).json({ error: 'Question group not found' });
    }
    
    console.log('Question group deleted:', deletedGroup);
    res.json({ message: 'Question group deleted successfully' });
  } catch (error) {
    console.error('Error deleting question group:', error);
    res.status(500).json({ error: 'Failed to delete question group' });
  }
}

/**
 * Get questions for a specific group
 */
export async function getGroupQuestions(req, res) {
  try {
    const { id } = req.params;
    console.log(`Fetching questions for group ID: ${id}`);
    
    const groupQuestions = await db
      .select({
        id: questions.id,
        text: questions.text,
        type: questions.type,
        required: questions.required,
        helpText: questions.helpText,
        sortOrder: questions.sortOrder,
        active: questions.active,
        deviceModelIds: questions.deviceModelIds,
        brandIds: questions.brandIds,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt
      })
      .from(questions)
      .where(eq(questions.questionGroupId, parseInt(id)))
      .orderBy(asc(questions.sortOrder), asc(questions.text));
    
    // Get answer choices for each question
    const questionsWithAnswers = await Promise.all(
      groupQuestions.map(async (question) => {
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
    
    console.log(`Found ${questionsWithAnswers.length} questions for group ${id}`);
    res.json(questionsWithAnswers);
  } catch (error) {
    console.error('Error fetching group questions:', error);
    res.status(500).json({ error: 'Failed to fetch group questions' });
  }
}

/**
 * Reorder question groups
 */
export async function reorderQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    const { direction } = req.body; // 'up' or 'down'
    
    console.log(`Reordering question group ${id} ${direction}`);
    
    const [currentGroup] = await db
      .select()
      .from(questionGroups)
      .where(eq(questionGroups.id, parseInt(id)));
    
    if (!currentGroup) {
      return res.status(404).json({ error: 'Question group not found' });
    }
    
    const newSortOrder = direction === 'up' 
      ? currentGroup.sortOrder - 1 
      : currentGroup.sortOrder + 1;
    
    // Find group to swap with
    const [swapGroup] = await db
      .select()
      .from(questionGroups)
      .where(eq(questionGroups.sortOrder, newSortOrder));
    
    if (swapGroup) {
      // Swap sort orders
      await db
        .update(questionGroups)
        .set({ sortOrder: currentGroup.sortOrder })
        .where(eq(questionGroups.id, swapGroup.id));
    }
    
    await db
      .update(questionGroups)
      .set({ sortOrder: newSortOrder })
      .where(eq(questionGroups.id, parseInt(id)));
    
    res.json({ message: 'Question group reordered successfully' });
  } catch (error) {
    console.error('Error reordering question group:', error);
    res.status(500).json({ error: 'Failed to reorder question group' });
  }
}

/**
 * Get question groups by device type
 */
export async function getQuestionGroupsByDeviceType(req, res) {
  try {
    const { deviceType } = req.params;
    console.log(`Fetching question groups for device type: ${deviceType}`);
    
    const groups = await db
      .select()
      .from(questionGroups)
      .where(
        // Groups with no device type restriction OR groups that include this device type
        // Note: This is a simplified version - you might need a more complex query for array operations
      )
      .orderBy(asc(questionGroups.sortOrder));
    
    // Filter in JavaScript since SQL array operations can be complex
    const filteredGroups = groups.filter(group => 
      !group.deviceTypes || 
      group.deviceTypes.length === 0 || 
      group.deviceTypes.includes(deviceType)
    );
    
    console.log(`Found ${filteredGroups.length} groups for device type ${deviceType}`);
    res.json(filteredGroups);
  } catch (error) {
    console.error('Error fetching question groups by device type:', error);
    res.status(500).json({ error: 'Failed to fetch question groups by device type' });
  }
}