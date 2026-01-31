import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Bus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function BusManagement() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
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

      await apiCall('/buses', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          total_seats: parseInt(formData.total_seats),
          amenities: {
            senior_citizen_seats: seniorSeats,
            female_seats: femaleSeats,
          }
        }),
      });

      toast.success('Bus added successfully');
      setOpen(false);
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
      fetchBuses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add bus');
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bus className="w-5 h-5" />
              <span>Bus Management</span>
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bus
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Bus</DialogTitle>
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
                  <Button type="submit" className="w-full">Add Bus</Button>
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{bus.name}</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                      <div><span className="font-medium">Route:</span> {bus.source} → {bus.destination}</div>
                      <div><span className="font-medium">Price:</span> ₹{bus.price}</div>
                      <div><span className="font-medium">Seats:</span> {bus.totalSeats || bus.total_seats}</div>
                      <div><span className="font-medium">Departure:</span> {bus.departureTime || bus.departure_time || 'N/A'}</div>
                      <div><span className="font-medium">Arrival:</span> {bus.arrivalTime || bus.arrival_time || 'N/A'}</div>
                      <div className="col-span-2"><span className="font-medium">Special Seats:</span> Senior: {(bus.amenities?.senior_citizen_seats || []).join(', ') || 'None'} | Female: {(bus.amenities?.female_seats || []).join(', ') || 'None'}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bus.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
