/**
 * Question Groups management API
 */

import { pool } from '../db.js';

// Get all question groups with their questions and model mappings
export async function getQuestionGroups(req, res) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          qg.*,
          COUNT(q.id) as question_count,
          COALESCE(
            json_agg(
              json_build_object(
                'id', qmm.id,
                'modelId', qmm.model_id,
                'modelName', dm.name,
                'autoDeductionRate', qmm.auto_deduction_rate
              )
            ) FILTER (WHERE qmm.id IS NOT NULL), 
            '[]'
          ) as model_mappings
        FROM question_groups qg
        LEFT JOIN questions q ON qg.id = q.group_id
        LEFT JOIN question_model_mappings qmm ON qg.id = qmm.question_group_id AND qmm.is_active = true
        LEFT JOIN device_models dm ON qmm.model_id = dm.id
        GROUP BY qg.id
        ORDER BY qg.sort_order, qg.name
      `);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ error: 'Failed to fetch question groups' });
  }
}

// Get specific question group
export async function getQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          qg.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', q.id,
                'text', q.text,
                'type', q.type,
                'isRequired', q.is_required,
                'sortOrder', q.sort_order
              )
            ) FILTER (WHERE q.id IS NOT NULL), 
            '[]'
          ) as questions
        FROM question_groups qg
        LEFT JOIN questions q ON qg.id = q.group_id
        WHERE qg.id = $1
        GROUP BY qg.id
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question group not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching question group:', error);
    res.status(500).json({ error: 'Failed to fetch question group' });
  }
}

// Create new question group
export async function createQuestionGroup(req, res) {
  try {
    const { name, description, groupType, deductionRate, sortOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const client = await pool.connect();
    try {
      // Get next sort order if not provided
      let finalSortOrder = sortOrder;
      if (!finalSortOrder) {
        const maxOrderResult = await client.query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM question_groups');
        finalSortOrder = maxOrderResult.rows[0].next_order;
      }
      
      const result = await client.query(`
        INSERT INTO question_groups (name, description, group_type, deduction_rate, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, description, groupType || 'assessment', deductionRate || 0, finalSortOrder]);
      
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating question group:', error);
    res.status(500).json({ error: 'Failed to create question group' });
  }
}

// Update question group
export async function updateQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['name', 'description', 'group_type', 'deduction_rate', 'sort_order', 'is_active'];
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE question_groups 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question group not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating question group:', error);
    res.status(500).json({ error: 'Failed to update question group' });
  }
}

// Delete question group
export async function deleteQuestionGroup(req, res) {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      // Check if group has questions
      const questionsResult = await client.query('SELECT COUNT(*) as count FROM questions WHERE group_id = $1', [id]);
      const questionCount = parseInt(questionsResult.rows[0].count);
      
      if (questionCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete group with ${questionCount} questions. Please delete questions first.` 
        });
      }
      
      const result = await client.query('DELETE FROM question_groups WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question group not found' });
      }
      
      res.json({ message: 'Question group deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting question group:', error);
    res.status(500).json({ error: 'Failed to delete question group' });
  }
}

// Map question group to model
export async function mapGroupToModel(req, res) {
  try {
    const { questionGroupId, modelId, autoDeductionRate } = req.body;
    
    if (!questionGroupId || !modelId) {
      return res.status(400).json({ error: 'Question group ID and model ID are required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO question_model_mappings (question_group_id, model_id, auto_deduction_rate)
        VALUES ($1, $2, $3)
        ON CONFLICT (question_group_id, model_id) 
        DO UPDATE SET 
          auto_deduction_rate = EXCLUDED.auto_deduction_rate,
          is_active = true,
          created_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [questionGroupId, modelId, autoDeductionRate || 0]);
      
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error mapping group to model:', error);
    res.status(500).json({ error: 'Failed to map group to model' });
  }
}

// Remove group-model mapping
export async function removeGroupModelMapping(req, res) {
  try {
    const { mappingId } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE question_model_mappings 
        SET is_active = false 
        WHERE id = $1 
        RETURNING *
      `, [mappingId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mapping not found' });
      }
      
      res.json({ message: 'Mapping removed successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error removing group-model mapping:', error);
    res.status(500).json({ error: 'Failed to remove mapping' });
  }
}

// Reorder question groups
export async function reorderQuestionGroups(req, res) {
  try {
    const { groupOrders } = req.body; // Array of { id, sortOrder }
    
    if (!Array.isArray(groupOrders)) {
      return res.status(400).json({ error: 'Group orders array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { id, sortOrder } of groupOrders) {
        await client.query(
          'UPDATE question_groups SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [sortOrder, id]
        );
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Question groups reordered successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error reordering question groups:', error);
    res.status(500).json({ error: 'Failed to reorder question groups' });
  }
}

// Get groups by device type
export async function getQuestionGroupsByDeviceType(req, res) {
  try {
    const { deviceTypeId } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT DISTINCT qg.*
        FROM question_groups qg
        JOIN question_model_mappings qmm ON qg.id = qmm.question_group_id
        JOIN device_models dm ON qmm.model_id = dm.id
        WHERE dm.device_type_id = $1 AND qg.is_active = true AND qmm.is_active = true
        ORDER BY qg.sort_order, qg.name
      `, [deviceTypeId]);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching groups by device type:', error);
    res.status(500).json({ error: 'Failed to fetch groups by device type' });
  }
}