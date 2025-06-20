import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, Calendar, Settings, Save, BarChart3, Users, 
  TrendingUp, AlertCircle, CheckCircle 
} from 'lucide-react';

const AdminWorkingHours = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingHours, setEditingHours] = useState({});

  const queryClient = useQueryClient();

  // Fetch working hours
  const { data: workingHours = [], isLoading } = useQuery({
    queryKey: ['working-hours'],
    queryFn: async () => {
      const response = await fetch('/api/working-hours');
      if (!response.ok) throw new Error('Failed to fetch working hours');
      return response.json();
    }
  });

  // Fetch booking statistics
  const { data: bookingStats = [] } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const response = await fetch('/api/booking-stats');
      if (!response.ok) throw new Error('Failed to fetch booking stats');
      return response.json();
    }
  });

  // Update working hours mutation
  const updateHoursMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/working-hours/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update working hours');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['working-hours']);
      queryClient.invalidateQueries(['booking-stats']);
      setSelectedDay(null);
      setEditingHours({});
    }
  });

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM format
  };

  const formatDisplayTime = (timeString) => {
    if (!timeString) return 'Not set';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleEditDay = (day) => {
    setSelectedDay(day.id);
    setEditingHours({
      startTime: formatTime(day.start_time),
      endTime: formatTime(day.end_time),
      breakStartTime: day.break_start_time ? formatTime(day.break_start_time) : '',
      breakEndTime: day.break_end_time ? formatTime(day.break_end_time) : '',
      maxAppointmentsPerHour: day.max_appointments_per_hour,
      isActive: day.is_active
    });
  };

  const handleSaveHours = () => {
    if (!selectedDay) return;
    
    updateHoursMutation.mutate({
      id: selectedDay,
      data: {
        startTime: editingHours.startTime + ':00',
        endTime: editingHours.endTime + ':00',
        breakStartTime: editingHours.breakStartTime ? editingHours.breakStartTime + ':00' : null,
        breakEndTime: editingHours.breakEndTime ? editingHours.breakEndTime + ':00' : null,
        maxAppointmentsPerHour: parseInt(editingHours.maxAppointmentsPerHour),
        isActive: editingHours.isActive
      }
    });
  };

  const getDayStatus = (day) => {
    if (!day.is_active) return 'closed';
    const stats = bookingStats.filter(stat => 
      new Date(stat.date).getDay() === day.day_of_week
    );
    const avgUtilization = stats.length > 0 
      ? stats.reduce((sum, stat) => sum + parseFloat(stat.utilization_rate), 0) / stats.length 
      : 0;
    
    if (avgUtilization > 80) return 'busy';
    if (avgUtilization > 50) return 'moderate';
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Working Hours Management</h2>
        <p className="text-gray-600">Configure pickup schedules and manage time slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Working Hours Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {workingHours.map((day) => {
                const status = getDayStatus(day);
                
                return (
                  <div key={day.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900 mr-3">
                            {day.day_name}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        
                        {day.is_active ? (
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center mb-1">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>
                                {formatDisplayTime(day.start_time)} - {formatDisplayTime(day.end_time)}
                              </span>
                            </div>
                            
                            {day.break_start_time && (
                              <div className="flex items-center mb-1 ml-6">
                                <span className="text-orange-600">
                                  Break: {formatDisplayTime(day.break_start_time)} - {formatDisplayTime(day.break_end_time)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center ml-6">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Max {day.max_appointments_per_hour} appointments/hour</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Closed</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleEditDay(day)}
                        className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                      >
                        <Settings className="h-4 w-4 mr-1 inline" />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        <div className="space-y-6">
          {selectedDay ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit {workingHours.find(d => d.id === selectedDay)?.day_name}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingHours.isActive}
                    onChange={(e) => setEditingHours({
                      ...editingHours,
                      isActive: e.target.checked
                    })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active (Open for business)
                  </label>
                </div>

                {editingHours.isActive && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={editingHours.startTime}
                          onChange={(e) => setEditingHours({
                            ...editingHours,
                            startTime: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={editingHours.endTime}
                          onChange={(e) => setEditingHours({
                            ...editingHours,
                            endTime: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Break Start (Optional)
                        </label>
                        <input
                          type="time"
                          value={editingHours.breakStartTime}
                          onChange={(e) => setEditingHours({
                            ...editingHours,
                            breakStartTime: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Break End (Optional)
                        </label>
                        <input
                          type="time"
                          value={editingHours.breakEndTime}
                          onChange={(e) => setEditingHours({
                            ...editingHours,
                            breakEndTime: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Appointments per Hour
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editingHours.maxAppointmentsPerHour}
                        onChange={(e) => setEditingHours({
                          ...editingHours,
                          maxAppointmentsPerHour: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveHours}
                    disabled={updateHoursMutation.isPending}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateHoursMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Select a day to edit working hours</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Days</span>
                <span className="font-medium">
                  {workingHours.filter(d => d.is_active).length}/7
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Weekly Hours</span>
                <span className="font-medium">
                  {workingHours.reduce((total, day) => {
                    if (!day.is_active) return total;
                    const start = new Date(`1970-01-01T${day.start_time}`);
                    const end = new Date(`1970-01-01T${day.end_time}`);
                    const hours = (end - start) / (1000 * 60 * 60);
                    return total + hours;
                  }, 0)} hrs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Bookings/Day</span>
                <span className="font-medium">
                  {bookingStats.length > 0 
                    ? Math.round(bookingStats.reduce((sum, stat) => sum + stat.current_bookings, 0) / bookingStats.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkingHours;