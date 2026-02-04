import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Bus, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { SeatSelection } from './SeatSelection';

export function BusManagement() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewBusSeats, setViewBusSeats] = useState<any>(null);
  const [editingBus, setEditingBus] = useState<any>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }
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
              <DialogContent className="max-w-2xl">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</p>
                      <p className="text-base font-semibold text-indigo-600">{bus.arrivalTime || bus.arrival_time || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</p>
                      <p className="text-base font-semibold text-blue-600">{bus.departureTime || bus.departure_time || 'N/A'}</p>
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
