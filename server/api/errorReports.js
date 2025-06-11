import express from 'express';
import { storage } from '../storage.js';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Create error reports table if it doesn't exist
const createErrorReportsTable = async () => {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS error_reports (
        id SERIAL PRIMARY KEY,
        error_id VARCHAR(255) UNIQUE NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) DEFAULT 'general',
        status_code INTEGER,
        stack TEXT,
        component_stack TEXT,
        user_agent TEXT,
        url TEXT,
        user_id VARCHAR(100),
        context JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT FALSE,
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_error_reports_timestamp ON error_reports(timestamp);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_error_reports_type ON error_reports(type);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_error_reports_resolved ON error_reports(resolved);
    `);
    
    console.log('Error reports table initialized');
  } catch (error) {
    console.error('Error creating error_reports table:', error);
  }
};

// Initialize table on startup
createErrorReportsTable();

// Submit error report
router.post('/', async (req, res) => {
  try {
    const {
      errorId,
      message,
      type = 'general',
      status,
      stack,
      componentStack,
      userAgent,
      url,
      userId,
      context = {},
      timestamp
    } = req.body;

    if (!errorId || !message) {
      return res.status(400).json({
        error: 'Missing required fields: errorId and message'
      });
    }

    // Check if error already exists
    const existingError = await db.execute(sql`
      SELECT id FROM error_reports WHERE error_id = ${errorId}
    `);

    if (existingError.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Error report already exists',
        id: existingError[0].id 
      });
    }

    // Insert new error report
    const result = await db.execute(sql`
      INSERT INTO error_reports (
        error_id, message, type, status_code, stack, component_stack,
        user_agent, url, user_id, context, timestamp
      ) VALUES (
        ${errorId}, ${message}, ${type}, ${status || null}, ${stack || null}, 
        ${componentStack || null}, ${userAgent || null}, ${url || null}, 
        ${userId || null}, ${JSON.stringify(context)}, ${timestamp || new Date().toISOString()}
      ) RETURNING id
    `);

    // Log error for monitoring
    console.error('Error Report Submitted:', {
      errorId,
      message,
      type,
      url,
      timestamp: timestamp || new Date().toISOString()
    });

    // Categorize and potentially alert for critical errors
    if (type === 'critical' || message.toLowerCase().includes('payment')) {
      // Send immediate alert to admin team
      console.error('CRITICAL ERROR REPORTED:', { errorId, message, url });
      // Here you could integrate with monitoring services like Sentry, DataDog, etc.
    }

    res.status(201).json({
      success: true,
      message: 'Error report submitted successfully',
      id: result[0]?.id,
      errorId
    });

  } catch (error) {
    console.error('Error submitting error report:', error);
    res.status(500).json({
      error: 'Failed to submit error report',
      message: error.message
    });
  }
});

// Get error reports (admin only)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      resolved,
      search,
      startDate,
      endDate
    } = req.query;

    let query = sql`SELECT * FROM error_reports WHERE 1=1`;
    const conditions = [];

    if (type) {
      conditions.push(sql`type = ${type}`);
    }

    if (resolved !== undefined) {
      conditions.push(sql`resolved = ${resolved === 'true'}`);
    }

    if (search) {
      conditions.push(sql`(message ILIKE ${`%${search}%`} OR error_id ILIKE ${`%${search}%`})`);
    }

    if (startDate) {
      conditions.push(sql`timestamp >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`timestamp <= ${endDate}`);
    }

    // Add conditions to query
    if (conditions.length > 0) {
      query = sql`${query} AND ${sql.join(conditions, sql` AND `)}`;
    }

    // Add ordering and pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = sql`${query} ORDER BY timestamp DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const errors = await db.execute(query);

    // Get total count for pagination
    let countQuery = sql`SELECT COUNT(*) FROM error_reports WHERE 1=1`;
    if (conditions.length > 0) {
      countQuery = sql`${countQuery} AND ${sql.join(conditions, sql` AND `)}`;
    }
    const totalResult = await db.execute(countQuery);
    const total = parseInt(totalResult[0].count);

    res.json({
      errors: errors.map(error => ({
        ...error,
        context: typeof error.context === 'string' ? JSON.parse(error.context) : error.context
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching error reports:', error);
    res.status(500).json({
      error: 'Failed to fetch error reports',
      message: error.message
    });
  }
});

// Get error statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    let timeCondition;
    switch (period) {
      case '1h':
        timeCondition = sql`timestamp >= NOW() - INTERVAL '1 hour'`;
        break;
      case '24h':
        timeCondition = sql`timestamp >= NOW() - INTERVAL '24 hours'`;
        break;
      case '7d':
        timeCondition = sql`timestamp >= NOW() - INTERVAL '7 days'`;
        break;
      case '30d':
        timeCondition = sql`timestamp >= NOW() - INTERVAL '30 days'`;
        break;
      default:
        timeCondition = sql`timestamp >= NOW() - INTERVAL '24 hours'`;
    }

    // Total errors
    const totalResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM error_reports WHERE ${timeCondition}
    `);

    // Errors by type
    const byTypeResult = await db.execute(sql`
      SELECT type, COUNT(*) as count 
      FROM error_reports 
      WHERE ${timeCondition}
      GROUP BY type 
      ORDER BY count DESC
    `);

    // Errors by hour (for trending)
    const byHourResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as count
      FROM error_reports 
      WHERE ${timeCondition}
      GROUP BY hour 
      ORDER BY hour DESC
    `);

    // Top error messages
    const topErrorsResult = await db.execute(sql`
      SELECT 
        message,
        COUNT(*) as count,
        type
      FROM error_reports 
      WHERE ${timeCondition}
      GROUP BY message, type 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // Resolution rate
    const resolutionResult = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE resolved = true) as resolved,
        COUNT(*) as total
      FROM error_reports 
      WHERE ${timeCondition}
    `);

    const stats = {
      total: parseInt(totalResult[0].total),
      byType: byTypeResult.map(row => ({
        type: row.type,
        count: parseInt(row.count)
      })),
      trending: byHourResult.map(row => ({
        hour: row.hour,
        count: parseInt(row.count)
      })),
      topErrors: topErrorsResult.map(row => ({
        message: row.message,
        count: parseInt(row.count),
        type: row.type
      })),
      resolutionRate: {
        resolved: parseInt(resolutionResult[0].resolved),
        total: parseInt(resolutionResult[0].total),
        percentage: resolutionResult[0].total > 0 
          ? Math.round((resolutionResult[0].resolved / resolutionResult[0].total) * 100)
          : 0
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching error statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch error statistics',
      message: error.message
    });
  }
});

// Mark error as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    await db.execute(sql`
      UPDATE error_reports 
      SET 
        resolved = true,
        resolution_notes = ${resolutionNotes || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
    `);

    res.json({
      success: true,
      message: 'Error marked as resolved'
    });

  } catch (error) {
    console.error('Error marking error as resolved:', error);
    res.status(500).json({
      error: 'Failed to mark error as resolved',
      message: error.message
    });
  }
});

// Get error report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute(sql`
      SELECT * FROM error_reports WHERE id = ${parseInt(id)}
    `);

    if (result.length === 0) {
      return res.status(404).json({
        error: 'Error report not found'
      });
    }

    const errorReport = result[0];
    errorReport.context = typeof errorReport.context === 'string' 
      ? JSON.parse(errorReport.context) 
      : errorReport.context;

    res.json(errorReport);

  } catch (error) {
    console.error('Error fetching error report:', error);
    res.status(500).json({
      error: 'Failed to fetch error report',
      message: error.message
    });
  }
});

export default router;