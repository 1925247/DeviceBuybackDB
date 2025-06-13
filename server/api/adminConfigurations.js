/**
 * Admin Configurations API for dynamic platform settings
 */

import { pool } from '../db.js';

// Get all configurations
export async function getAdminConfigurations(req, res) {
  try {
    const { configType } = req.query;
    
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM admin_configurations WHERE is_active = true';
      let params = [];
      
      if (configType) {
        query += ' AND config_type = $1';
        params.push(configType);
      }
      
      query += ' ORDER BY config_type, config_key';
      
      const result = await client.query(query, params);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching admin configurations:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
}

// Get specific configuration
export async function getAdminConfiguration(req, res) {
  try {
    const { key } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM admin_configurations WHERE config_key = $1 AND is_active = true',
        [key]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching admin configuration:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
}

// Create new configuration
export async function createAdminConfiguration(req, res) {
  try {
    const { configKey, configValue, configType, description } = req.body;
    
    if (!configKey || configValue === undefined) {
      return res.status(400).json({ error: 'Config key and value are required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO admin_configurations (config_key, config_value, config_type, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [configKey, JSON.stringify(configValue), configType || 'general', description]);
      
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating admin configuration:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Configuration with this key already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create configuration' });
    }
  }
}

// Update configuration
export async function updateAdminConfiguration(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['config_value', 'config_type', 'description', 'is_active'];
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'config_value') {
          updateFields.push(`${key} = $${valueIndex}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${valueIndex}`);
          values.push(value);
        }
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
        UPDATE admin_configurations 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating admin configuration:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
}

// Delete configuration
export async function deleteAdminConfiguration(req, res) {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE admin_configurations SET is_active = false WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      res.json({ message: 'Configuration deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting admin configuration:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
}

// Get configuration value by key (utility endpoint)
export async function getConfigValue(req, res) {
  try {
    const { key } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT config_value FROM admin_configurations WHERE config_key = $1 AND is_active = true',
        [key]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      res.json({ value: result.rows[0].config_value });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching config value:', error);
    res.status(500).json({ error: 'Failed to fetch config value' });
  }
}

// Bulk update configurations
export async function bulkUpdateConfigurations(req, res) {
  try {
    const { configurations } = req.body; // Array of { key, value }
    
    if (!Array.isArray(configurations)) {
      return res.status(400).json({ error: 'Configurations array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const config of configurations) {
        const { key, value } = config;
        
        const result = await client.query(`
          UPDATE admin_configurations 
          SET config_value = $1, updated_at = CURRENT_TIMESTAMP
          WHERE config_key = $2 AND is_active = true
          RETURNING *
        `, [JSON.stringify(value), key]);
        
        if (result.rows.length > 0) {
          results.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      res.json({ updated: results.length, results });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating configurations:', error);
    res.status(500).json({ error: 'Failed to bulk update configurations' });
  }
}

// Initialize default configurations
export async function initializeDefaultConfigurations(req, res) {
  try {
    const defaultConfigs = [
      {
        key: 'platform_name',
        value: 'Device Buyback Platform',
        type: 'general',
        description: 'Platform display name'
      },
      {
        key: 'max_upload_size',
        value: 5242880, // 5MB
        type: 'general',
        description: 'Maximum file upload size in bytes'
      },
      {
        key: 'currency_symbol',
        value: '₹',
        type: 'pricing',
        description: 'Default currency symbol'
      },
      {
        key: 'minimum_device_price',
        value: 500,
        type: 'pricing',
        description: 'Minimum buyback price for any device'
      },
      {
        key: 'default_deduction_rate',
        value: 10.0,
        type: 'pricing',
        description: 'Default deduction rate percentage'
      },
      {
        key: 'theme_primary_color',
        value: '#3B82F6',
        type: 'ui',
        description: 'Primary theme color'
      },
      {
        key: 'theme_secondary_color',
        value: '#1F2937',
        type: 'ui',
        description: 'Secondary theme color'
      },
      {
        key: 'supported_languages',
        value: ['en', 'hi'],
        type: 'localization',
        description: 'Supported platform languages'
      },
      {
        key: 'default_language',
        value: 'en',
        type: 'localization',
        description: 'Default platform language'
      },
      {
        key: 'api_rate_limit',
        value: 1000,
        type: 'api',
        description: 'API requests per hour limit'
      }
    ];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const created = [];
      for (const config of defaultConfigs) {
        try {
          const result = await client.query(`
            INSERT INTO admin_configurations (config_key, config_value, config_type, description)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (config_key) DO NOTHING
            RETURNING *
          `, [config.key, JSON.stringify(config.value), config.type, config.description]);
          
          if (result.rows.length > 0) {
            created.push(result.rows[0]);
          }
        } catch (error) {
          // Continue with other configs if one fails
          console.warn(`Failed to create config ${config.key}:`, error.message);
        }
      }
      
      await client.query('COMMIT');
      res.json({ 
        message: 'Default configurations initialized',
        created: created.length,
        configurations: created
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing default configurations:', error);
    res.status(500).json({ error: 'Failed to initialize default configurations' });
  }
}