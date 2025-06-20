/**
 * Working Hours and Time Slots Management API
 */

import { pool } from '../db.js';

// Get all working hours
export async function getWorkingHours(req, res) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          id,
          day_of_week,
          start_time,
          end_time,
          break_start_time,
          break_end_time,
          max_appointments_per_hour,
          is_active,
          CASE day_of_week
            WHEN 0 THEN 'Sunday'
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
          END as day_name
        FROM working_hours 
        ORDER BY day_of_week
      `);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).json({ error: 'Failed to fetch working hours' });
  }
}

// Update working hours
export async function updateWorkingHours(req, res) {
  try {
    const { id } = req.params;
    const { startTime, endTime, breakStartTime, breakEndTime, maxAppointmentsPerHour, isActive } = req.body;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE working_hours 
        SET 
          start_time = $1,
          end_time = $2,
          break_start_time = $3,
          break_end_time = $4,
          max_appointments_per_hour = $5,
          is_active = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [startTime, endTime, breakStartTime, breakEndTime, maxAppointmentsPerHour, isActive, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Working hours not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(500).json({ error: 'Failed to update working hours' });
  }
}

// Get available time slots for a specific date
export async function getAvailableTimeSlots(req, res) {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    const client = await pool.connect();
    try {
      // Get working hours for the day
      const workingHoursResult = await client.query(`
        SELECT * FROM working_hours 
        WHERE day_of_week = $1 AND is_active = true
      `, [dayOfWeek]);
      
      if (workingHoursResult.rows.length === 0) {
        return res.json({ availableSlots: [], message: 'No working hours set for this day' });
      }
      
      const workingHours = workingHoursResult.rows[0];
      const slots = generateTimeSlots(workingHours, date);
      
      // Get existing bookings for the date
      const bookingsResult = await client.query(`
        SELECT time_slot, current_bookings, max_bookings
        FROM time_slots 
        WHERE date = $1
      `, [date]);
      
      const bookings = bookingsResult.rows.reduce((acc, booking) => {
        acc[booking.time_slot] = {
          current: booking.current_bookings,
          max: booking.max_bookings
        };
        return acc;
      }, {});
      
      // Mark slots as available or full
      const availableSlots = slots.map(slot => ({
        ...slot,
        currentBookings: bookings[slot.time] ? bookings[slot.time].current : 0,
        maxBookings: workingHours.max_appointments_per_hour,
        isAvailable: !bookings[slot.time] || bookings[slot.time].current < workingHours.max_appointments_per_hour
      }));
      
      res.json({ availableSlots, workingHours });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ error: 'Failed to fetch available time slots' });
  }
}

// Book a time slot
export async function bookTimeSlot(req, res) {
  try {
    const { date, timeSlot } = req.body;
    
    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'Date and time slot are required' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check if slot exists and is available
      const slotResult = await client.query(`
        SELECT * FROM time_slots 
        WHERE date = $1 AND time_slot = $2
      `, [date, timeSlot]);
      
      if (slotResult.rows.length === 0) {
        // Create new slot
        await client.query(`
          INSERT INTO time_slots (date, time_slot, current_bookings, max_bookings)
          VALUES ($1, $2, 1, 4)
        `, [date, timeSlot]);
      } else {
        const slot = slotResult.rows[0];
        if (slot.current_bookings >= slot.max_bookings) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: 'Time slot is fully booked' });
        }
        
        // Increment bookings
        await client.query(`
          UPDATE time_slots 
          SET current_bookings = current_bookings + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE date = $1 AND time_slot = $2
        `, [date, timeSlot]);
      }
      
      await client.query('COMMIT');
      res.json({ success: true, message: 'Time slot booked successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error booking time slot:', error);
    res.status(500).json({ error: 'Failed to book time slot' });
  }
}

// Generate time slots based on working hours
function generateTimeSlots(workingHours, date) {
  const slots = [];
  const startTime = parseTime(workingHours.start_time);
  const endTime = parseTime(workingHours.end_time);
  const breakStart = workingHours.break_start_time ? parseTime(workingHours.break_start_time) : null;
  const breakEnd = workingHours.break_end_time ? parseTime(workingHours.break_end_time) : null;
  
  let currentTime = startTime;
  
  while (currentTime < endTime) {
    const timeString = formatTime(currentTime);
    const nextTime = currentTime + 60; // 1 hour slots
    
    // Skip break time
    if (breakStart && breakEnd && currentTime >= breakStart && currentTime < breakEnd) {
      currentTime = nextTime;
      continue;
    }
    
    // Don't include slots that would extend past end time
    if (nextTime <= endTime) {
      slots.push({
        time: timeString,
        display: formatDisplayTime(currentTime),
        isPastTime: isPastTime(date, currentTime)
      });
    }
    
    currentTime = nextTime;
  }
  
  return slots.filter(slot => !slot.isPastTime);
}

// Helper functions
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes; // Convert to minutes
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}

function formatDisplayTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function isPastTime(date, timeInMinutes) {
  const now = new Date();
  const slotDate = new Date(date);
  const slotTime = new Date(slotDate);
  
  slotTime.setHours(Math.floor(timeInMinutes / 60), timeInMinutes % 60, 0, 0);
  
  return slotTime <= now;
}

// Get booking statistics
export async function getBookingStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          date,
          time_slot,
          current_bookings,
          max_bookings,
          (current_bookings::float / max_bookings::float * 100) as utilization_rate
        FROM time_slots 
        WHERE date >= CURRENT_DATE
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ` AND date BETWEEN $1 AND $2`;
        params.push(startDate, endDate);
      }
      
      query += ` ORDER BY date, time_slot`;
      
      const result = await client.query(query, params);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ error: 'Failed to fetch booking statistics' });
  }
}