import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Ticket, Calendar, MapPin, IndianRupee, XCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface BookingHistoryProps {
  profile: any;
}

export function BookingHistory({ profile }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiCall('/bookings');
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await apiCall(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ticket className="w-5 h-5" />
            <span>My Bookings</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold">{booking.bus?.name}</h3>
                      <Badge 
                        variant={booking.status === 'booked' ? 'default' : 'destructive'}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.bus?.source} → {booking.bus?.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.journey_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Ticket className="w-4 h-4" />
                        <span>Seats: {booking.seats?.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <IndianRupee className="w-4 h-4" />
                        <span className="font-semibold">₹{booking.total_amount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {booking.status === 'booked' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {booking.passenger_details && (
                  <div className="text-sm text-gray-600 pt-3 border-t">
                    <span className="font-medium">Passenger:</span> {booking.passenger_details.name} | {booking.passenger_details.phone}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
