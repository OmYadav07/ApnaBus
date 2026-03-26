import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Bus, Eye, CalendarDays, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { SeatSelection } from './SeatSelection';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

export function BusManagement() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewBusSeats, setViewBusSeats] = useState<any>(null);
  const [editingBus, setEditingBus] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<'everyday' | 'custom'>('everyday');
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    destination: '',
    price: '',
    total_seats: '40',
    departure_time: '',
    arrival_time: '',
    senior_citizen_seats: '',
    female_seats: '',
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    if (editingBus) {
      setFormData({
        name: editingBus.name || '',
        source: editingBus.source || '',
        destination: editingBus.destination || '',
        price: editingBus.price?.toString() || '',
        total_seats: (editingBus.totalSeats || editingBus.total_seats || 40).toString(),
        departure_time: editingBus.departureTime || editingBus.departure_time || '',
        arrival_time: editingBus.arrivalTime || editingBus.arrival_time || '',
        senior_citizen_seats: editingBus.amenities?.senior_citizen_seats?.join(', ') || '',
        female_seats: editingBus.amenities?.female_seats?.join(', ') || '',
      });
      const sched = editingBus.schedule;
      setScheduleType(sched?.type === 'custom' ? 'custom' : 'everyday');
      setScheduleDays(sched?.days || []);
    } else {
      setFormData({
        name: '',
        source: '',
        destination: '',
        price: '',
        total_seats: '40',
        departure_time: '',
        arrival_time: '',
        senior_citizen_seats: '',
        female_seats: '',
      });
      setScheduleType('everyday');
      setScheduleDays([]);
    }
  }, [editingBus]);

  const fetchBuses = async () => {
    try {
      const data = await apiCall('/buses');
      setBuses(data.buses || []);
    } catch (error) {
      toast.error('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (scheduleType === 'custom' && scheduleDays.length === 0) {
      toast.error('Please select at least one day for the custom schedule');
      return;
    }

    try {
      const seniorSeats = formData.senior_citizen_seats.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));
      const femaleSeats = formData.female_seats.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        total_seats: parseInt(formData.total_seats),
        amenities: {
          senior_citizen_seats: seniorSeats,
          female_seats: femaleSeats,
        },
        schedule: {
          type: scheduleType,
          days: scheduleType === 'everyday' ? [] : scheduleDays,
        },
      };

      if (editingBus) {
        await apiCall(`/buses/${editingBus.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Bus updated successfully');
      } else {
        await apiCall('/buses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Bus added successfully');
      }

      setOpen(false);
      setEditingBus(null);
      fetchBuses();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingBus ? 'update' : 'add'} bus`);
    }
  };

  const handleDelete = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;

    try {
      await apiCall(`/buses/${busId}`, { method: 'DELETE' });
      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bus');
    }
  };

  const renderScheduleBadge = (bus: any) => {
    const sched = bus.schedule;
    if (!sched || sched.type === 'everyday') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
          <CalendarDays className="w-3 h-3" />
          Everyday
        </span>
      );
    }
    const days: string[] = sched.days || [];
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {DAYS.map((d) => (
          <span
            key={d}
            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              days.includes(d)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {DAY_SHORT[d]}
          </span>
        ))}
      </div>
    );
  };

  if (viewBusSeats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => setViewBusSeats(null)}
          >
            Back to Management
          </Button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-purple-900">{viewBusSeats.name}</h2>
            <p className="text-sm text-gray-500">{viewBusSeats.source} → {viewBusSeats.destination}</p>
          </div>
        </div>
        <SeatSelection 
          bus={viewBusSeats} 
          profile={{ role: 'admin' }} 
          onBack={() => setViewBusSeats(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bus className="w-5 h-5" />
              <span>Bus Management</span>
            </CardTitle>
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (!val) setEditingBus(null);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingBus(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bus
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Bus Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Volvo Sleeper"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Source</Label>
                      <Input
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        placeholder="Delhi"
                        required
                      />
                    </div>
                    <div>
                      <Label>Destination</Label>
                      <Input
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="1200"
                        required
                      />
                    </div>
                    <div>
                      <Label>Total Seats</Label>
                      <Input
                        type="number"
                        value={formData.total_seats}
                        onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Departure Time</Label>
                      <Input
                        type="time"
                        value={formData.departure_time}
                        onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Arrival Time</Label>
                      <Input
                        type="time"
                        value={formData.arrival_time}
                        onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Senior Citizen Seats (comma separated)</Label>
                      <Input
                        value={formData.senior_citizen_seats}
                        onChange={(e) => setFormData({ ...formData, senior_citizen_seats: e.target.value })}
                        placeholder="1, 2, 3"
                      />
                    </div>
                    <div>
                      <Label>Female Seats (comma separated)</Label>
                      <Input
                        value={formData.female_seats}
                        onChange={(e) => setFormData({ ...formData, female_seats: e.target.value })}
                        placeholder="4, 5, 6"
                      />
                    </div>
                  </div>

                  {/* Travel Schedule */}
                  <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <Label className="text-sm font-semibold text-gray-800 mb-0">Travel Schedule</Label>
                    </div>
                    <div className="flex gap-3">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        scheduleType === 'everyday'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="scheduleType"
                          value="everyday"
                          checked={scheduleType === 'everyday'}
                          onChange={() => { setScheduleType('everyday'); setScheduleDays([]); }}
                          className="sr-only"
                        />
                        <CalendarDays className="w-4 h-4" />
                        <span className="font-semibold text-sm">Everyday</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        scheduleType === 'custom'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="scheduleType"
                          value="custom"
                          checked={scheduleType === 'custom'}
                          onChange={() => setScheduleType('custom')}
                          className="sr-only"
                        />
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold text-sm">Custom Days</span>
                      </label>
                    </div>

                    {scheduleType === 'custom' && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Select the days this bus operates:</p>
                        <div className="grid grid-cols-7 gap-1">
                          {DAYS.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                scheduleDays.includes(day)
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                              }`}
                            >
                              {DAY_SHORT[day]}
                            </button>
                          ))}
                        </div>
                        {scheduleDays.length > 0 && (
                          <p className="text-xs text-blue-600 font-medium">
                            Selected: {scheduleDays.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    {editingBus ? 'Update Bus' : 'Add Bus'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {buses.map((bus) => (
            <Card key={bus.id}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-xl font-bold text-purple-900">{bus.name}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewBusSeats(bus)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Seats</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingBus(bus);
                          setOpen(true);
                        }}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(bus.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Route</p>
                      <p className="text-base font-semibold text-gray-900">{bus.source} → {bus.destination}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price</p>
                      <p className="text-base font-semibold text-gray-900">₹{bus.price}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</p>
                      <p className="text-base font-semibold text-gray-900">{bus.totalSeats || bus.total_seats}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Available Seat</p>
                      <p className="text-base font-semibold text-green-600">
                        {bus.availableSeats ?? (bus.totalSeats || bus.total_seats)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Booked Seats</p>
                      <p className="text-base font-semibold text-red-600">
                        {bus.bookedSeatsCount ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</p>
                      <p className="text-base font-semibold text-indigo-600">{bus.arrivalTime || bus.arrival_time || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</p>
                      <p className="text-base font-semibold text-blue-600">{bus.departureTime || bus.departure_time || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</p>
                      {renderScheduleBadge(bus)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
