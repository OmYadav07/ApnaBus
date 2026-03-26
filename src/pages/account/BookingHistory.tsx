import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Calendar, Clock, ChevronRight, Ticket, IndianRupee, XCircle, User } from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { formatBookingId } from '../../utils/bookingId';
import { toast } from 'sonner';

interface BookingHistoryProps {
  profile?: any;
}

const BookingHistory = ({ profile }: BookingHistoryProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiCall('/bookings');
      setBookings(data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiCall(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      toast.success('Booking cancelled and refund initiated');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (val: any) => {
    if (!val) return 'N/A';
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'upcoming') return b.status === 'booked';
    if (filter === 'completed') return b.status === 'cancelled' || b.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
        <div className="flex space-x-2">
          {(['all', 'upcoming', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-100 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-100 text-center">
          <Bus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No bookings found</p>
          <p className="text-sm text-gray-400 mt-1">Your travel history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const journeyDate = booking.journeyDate || booking.journey_date;
            const totalAmount = booking.totalAmount ?? booking.total_amount;
            const passengers = booking.passengerDetails || booking.passenger_details || [];
            const seats = booking.seats || [];

            return (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Status bar */}
                <div className={`h-1 ${booking.status === 'booked' ? 'bg-green-500' : 'bg-red-400'}`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-mono">
                          {formatBookingId(booking.id, booking.bookingDate || booking.booking_date)}
                        </p>
                        <p className="font-bold text-gray-900 text-lg">{booking.bus?.name || 'Bus'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        booking.status === 'booked' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.status === 'booked' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Route + details */}
                  <div className="grid md:grid-cols-3 gap-6 items-center mb-5">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{booking.bus?.source}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">From</p>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-200 relative">
                        <ChevronRight className="w-5 h-5 text-blue-500 absolute -top-2.5 right-0 bg-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{booking.bus?.destination}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">To</p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 md:border-l md:border-gray-100 md:pl-6">
                      <div className="flex items-center space-x-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>{formatDate(journeyDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Arrival: {booking.bus?.arrivalTime || booking.bus?.arrival_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Departure: {booking.bus?.departureTime || booking.bus?.departure_time || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-sm text-gray-400 mb-1">Total Fare</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{totalAmount != null ? Number(totalAmount).toFixed(2) : '—'}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 md:justify-end mt-1">
                        <Ticket className="w-3.5 h-3.5" />
                        Seats: {seats.join(', ') || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  {Array.isArray(passengers) && passengers.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Passengers</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {passengers.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
