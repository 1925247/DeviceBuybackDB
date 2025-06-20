import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';

const TimeSlotSelector = ({ selectedDate, selectedTime, onTimeSelect, className = '' }) => {
  const [availableSlots, setAvailableSlots] = useState([]);

  // Fetch available time slots for the selected date
  const { data: slotsData, isLoading, error } = useQuery({
    queryKey: ['available-slots', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return { availableSlots: [] };
      
      const response = await fetch(`/api/available-time-slots?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch time slots');
      return response.json();
    },
    enabled: !!selectedDate
  });

  useEffect(() => {
    if (slotsData?.availableSlots) {
      setAvailableSlots(slotsData.availableSlots);
    }
  }, [slotsData]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSlotStatus = (slot) => {
    if (!slot.isAvailable) return 'full';
    if (slot.currentBookings >= slot.maxBookings * 0.8) return 'limited';
    return 'available';
  };

  const getSlotStatusColor = (status) => {
    switch (status) {
      case 'full':
        return 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSlotStatusIcon = (status) => {
    switch (status) {
      case 'full':
        return <AlertCircle className="h-4 w-4" />;
      case 'limited':
        return <Users className="h-4 w-4" />;
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!selectedDate) {
    return (
      <div className={`p-6 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <div className="text-center">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Please select a pickup date first</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-6 border border-gray-200 rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <div className="flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Unable to load time slots. Please try again.</span>
        </div>
      </div>
    );
  }

  if (!availableSlots.length) {
    return (
      <div className={`p-6 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <div className="text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Available Slots</h3>
          <p className="text-gray-600">
            {slotsData?.message || 'No pickup slots available for this date. Please select a different date.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 border border-gray-200 rounded-lg bg-white ${className}`}>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Select Pickup Time</h3>
        </div>
        <p className="text-sm text-gray-600">
          Available slots for {formatDate(selectedDate)}
        </p>
        {slotsData?.workingHours && (
          <p className="text-xs text-gray-500 mt-1">
            Working hours: {slotsData.workingHours.start_time} - {slotsData.workingHours.end_time}
            {slotsData.workingHours.break_start_time && (
              <span> (Lunch: {slotsData.workingHours.break_start_time} - {slotsData.workingHours.break_end_time})</span>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableSlots.map((slot) => {
          const status = getSlotStatus(slot);
          const isSelected = selectedTime === slot.time;
          const isDisabled = !slot.isAvailable;

          return (
            <button
              key={slot.time}
              onClick={() => !isDisabled && onTimeSelect(slot.time)}
              disabled={isDisabled}
              className={`
                relative p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-200' 
                  : getSlotStatusColor(status)
                }
                ${isDisabled ? 'opacity-50' : 'hover:scale-105'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{slot.display}</span>
                {getSlotStatusIcon(status)}
              </div>
              
              <div className="text-xs mt-1 opacity-75">
                {slot.currentBookings || 0}/{slot.maxBookings} booked
              </div>
              
              {status === 'limited' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
              )}
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div>
            <span className="text-gray-600">Limited slots</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
            <span className="text-gray-600">Fully booked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;