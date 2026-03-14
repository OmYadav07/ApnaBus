import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { Ticket, Calendar, MapPin, IndianRupee, XCircle, User, Clock } from 'lucide-react';
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

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
            <Badge variant="secondary" className="ml-2">{bookings.length}</Badge>
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
          {bookings.map((booking) => {
            const journeyDate = booking.journeyDate || booking.journey_date;
            const totalAmount = booking.totalAmount ?? booking.total_amount;
            const passengers = booking.passengerDetails || booking.passenger_details || [];
            const seats = booking.seats || [];

            return (
              <Card key={booking.id} className="overflow-hidden">
                <div className={`h-1 ${booking.status === 'booked' ? 'bg-green-500' : booking.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <CardContent className="p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{booking.bus?.name || 'Bus'}</h3>
                        <Badge variant={booking.status === 'booked' ? 'default' : 'destructive'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">Booking ID: #{booking.id}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">
                        ₹{totalAmount != null ? Number(totalAmount).toFixed(2) : '—'}
                      </p>
                      <p className="text-xs text-gray-400">Total Paid</p>
                    </div>
                  </div>

                  {/* Journey details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Route</p>
                        <p className="font-medium">{booking.bus?.source} → {booking.bus?.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Journey Date</p>
                        <p className="font-medium">{formatDate(journeyDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Arrival</p>
                        <p className="font-medium">{booking.bus?.arrivalTime || booking.bus?.arrival_time || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Departure</p>
                        <p className="font-medium">{booking.bus?.departureTime || booking.bus?.departure_time || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Ticket className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Seats</p>
                        <p className="font-medium">{seats.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  {Array.isArray(passengers) && passengers.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Passengers</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {passengers.map((p: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-semibold text-gray-800">{p.name}</span>
                              <span className="text-gray-400 text-xs">({p.age}, {p.gender})</span>
                            </div>
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">
                              Seat {p.seat_no}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'booked' && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
