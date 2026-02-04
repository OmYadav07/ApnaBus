import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Ticket, XCircle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiCall('/admin/bookings');
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Cancel this booking?')) return;

    try {
      await apiCall(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ticket className="w-5 h-5" />
            <span>All Bookings</span>
          </CardTitle>
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
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold">{booking.bus?.name}</h3>
                      <Badge variant={booking.status === 'booked' ? 'default' : 'destructive'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><span className="font-medium">User:</span> {booking.user?.name} ({booking.user?.email})</div>
                      <div><span className="font-medium">Route:</span> {booking.bus?.source} → {booking.bus?.destination}</div>
                      <div><span className="font-medium">Seats:</span> {booking.seats?.join(', ')}</div>
                      <div><span className="font-medium">Amount:</span> ₹{booking.totalAmount || booking.total_amount}</div>
                      <div><span className="font-medium">Date:</span> {booking.journeyDate || booking.journey_date ? new Date(booking.journeyDate || booking.journey_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                      className="flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Passenger Details</span>
                    </Button>
                    {booking.status === 'booked' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedBooking} onOpenChange={(val) => !val && setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Passenger Details - {selectedBooking?.bus?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-xs text-gray-500 uppercase">Booking ID</p>
                <p className="font-semibold text-purple-900">#{selectedBooking?.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Route</p>
                <p className="font-semibold text-purple-900">
                  {selectedBooking?.bus?.source} → {selectedBooking?.bus?.destination}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Array.isArray(selectedBooking?.passengerDetails) || Array.isArray(selectedBooking?.passenger_details) ? (
                (selectedBooking?.passengerDetails || selectedBooking?.passenger_details).map((p: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">{p.name || 'N/A'}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Age: {p.age || 'N/A'}</span>
                        <span>Gender: {p.gender || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Seat</p>
                      <p className="text-lg font-bold text-blue-600">
                        {p.seat_no || (selectedBooking?.seats && selectedBooking.seats[idx]) || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 italic">
                  No detailed passenger information available
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
