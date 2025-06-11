import express from 'express';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Create user feedback table if it doesn't exist
const createUserFeedbackTable = async () => {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK (type IN ('positive', 'negative', 'suggestion', 'bug')),
        message TEXT,
        context JSONB,
        user_id VARCHAR(100),
        url TEXT,
        user_agent TEXT,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        category VARCHAR(100),
        resolved BOOLEAN DEFAULT FALSE,
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_feedback_resolved ON user_feedback(resolved);
    `);
    
    console.log('User feedback table initialized');
  } catch (error) {
    console.error('Error creating user_feedback table:', error);
  }
};

// Initialize table on startup
createUserFeedbackTable();

// Submit user feedback
router.post('/', async (req, res) => {
  try {
    const {
      type,
      message,
      context = {},
      userId,
      rating,
      category
    } = req.body;

    if (!type) {
      return res.status(400).json({
        error: 'Feedback type is required'
      });
    }

    const feedbackData = {
      type,
      message: message || null,
      context: JSON.stringify(context),
      user_id: userId || null,
      url: context.url || null,
      user_agent: context.userAgent || null,
      rating: rating || null,
      category: category || null
    };

    const result = await db.execute(sql`
      INSERT INTO user_feedback (
        type, message, context, user_id, url, user_agent, rating, category
      ) VALUES (
        ${feedbackData.type}, ${feedbackData.message}, ${feedbackData.context},
        ${feedbackData.user_id}, ${feedbackData.url}, ${feedbackData.user_agent},
        ${feedbackData.rating}, ${feedbackData.category}
      ) RETURNING id
    `);

    // Log feedback for monitoring
    console.log('User Feedback Submitted:', {
      id: result[0]?.id,
      type,
      url: context.url,
      timestamp: new Date().toISOString()
    });

    // Alert for negative feedback
    if (type === 'negative' || (rating && rating <= 2)) {
      console.warn('NEGATIVE FEEDBACK RECEIVED:', {
        id: result[0]?.id,
        message: message?.substring(0, 100),
        url: context.url
      });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      id: result[0]?.id
    });

  } catch (error) {
    console.error('Error submitting user feedback:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
});

// Get user feedback (admin only)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      resolved,
      search,
      startDate,
      endDate,
      category
    } = req.query;

    let query = sql`SELECT * FROM user_feedback WHERE 1=1`;
    const conditions = [];

    if (type) {
      conditions.push(sql`type = ${type}`);
    }

    if (category) {
      conditions.push(sql`category = ${category}`);
    }

    if (resolved !== undefined) {
      conditions.push(sql`resolved = ${resolved === 'true'}`);
    }

    if (search) {
      conditions.push(sql`message ILIKE ${`%${search}%`}`);
    }

    if (startDate) {
      conditions.push(sql`created_at >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`created_at <= ${endDate}`);
    }

    // Add conditions to query
    if (conditions.length > 0) {
      query = sql`${query} AND ${sql.join(conditions, sql` AND `)}`;
    }

    // Add ordering and pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = sql`${query} ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const feedback = await db.execute(query);

    // Get total count
    let countQuery = sql`SELECT COUNT(*) FROM user_feedback WHERE 1=1`;
    if (conditions.length > 0) {
      countQuery = sql`${countQuery} AND ${sql.join(conditions, sql` AND `)}`;
    }
    const totalResult = await db.execute(countQuery);
    const total = parseInt(totalResult[0].count);

    res.json({
      feedback: feedback.map(item => ({
        ...item,
        context: typeof item.context === 'string' ? JSON.parse(item.context) : item.context
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback',
      message: error.message
    });
  }
});

// Get feedback statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let timeCondition;
    switch (period) {
      case '24h':
        timeCondition = sql`created_at >= NOW() - INTERVAL '24 hours'`;
        break;
      case '7d':
        timeCondition = sql`created_at >= NOW() - INTERVAL '7 days'`;
        break;
      case '30d':
        timeCondition = sql`created_at >= NOW() - INTERVAL '30 days'`;
        break;
      default:
        timeCondition = sql`created_at >= NOW() - INTERVAL '7 days'`;
    }

    // Overall stats
    const overallResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'positive') as positive,
        COUNT(*) FILTER (WHERE type = 'negative') as negative,
        COUNT(*) FILTER (WHERE resolved = true) as resolved,
        AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_rating
      FROM user_feedback 
      WHERE ${timeCondition}
    `);

    // Feedback by day
    const byDayResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'positive') as positive,
        COUNT(*) FILTER (WHERE type = 'negative') as negative
      FROM user_feedback 
      WHERE ${timeCondition}
      GROUP BY date 
      ORDER BY date DESC
    `);

    // Top issues (negative feedback)
    const topIssuesResult = await db.execute(sql`
      SELECT 
        SUBSTRING(message FROM 1 FOR 100) as issue,
        COUNT(*) as count,
        url
      FROM user_feedback 
      WHERE ${timeCondition} AND type = 'negative' AND message IS NOT NULL
      GROUP BY SUBSTRING(message FROM 1 FOR 100), url
      ORDER BY count DESC 
      LIMIT 10
    `);

    const stats = {
      overview: {
        total: parseInt(overallResult[0].total),
        positive: parseInt(overallResult[0].positive),
        negative: parseInt(overallResult[0].negative),
        resolved: parseInt(overallResult[0].resolved),
        avgRating: parseFloat(overallResult[0].avg_rating) || 0,
        satisfactionRate: overallResult[0].total > 0 
          ? Math.round((overallResult[0].positive / overallResult[0].total) * 100)
          : 0
      },
      daily: byDayResult.map(row => ({
        date: row.date,
        total: parseInt(row.total),
        positive: parseInt(row.positive),
        negative: parseInt(row.negative)
      })),
      topIssues: topIssuesResult.map(row => ({
        issue: row.issue,
        count: parseInt(row.count),
        url: row.url
      }))
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback statistics',
      message: error.message
    });
  }
});

// Mark feedback as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    await db.execute(sql`
      UPDATE user_feedback 
      SET 
        resolved = true,
        admin_response = ${adminResponse || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
    `);

    res.json({
      success: true,
      message: 'Feedback marked as resolved'
    });

  } catch (error) {
    console.error('Error marking feedback as resolved:', error);
    res.status(500).json({
      error: 'Failed to mark feedback as resolved',
      message: error.message
    });
  }
});

export default router;