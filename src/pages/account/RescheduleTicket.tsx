import React, { useState } from 'react';
import { RefreshCw, Calendar, Search, MapPin, Ticket, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { formatBookingId } from '../../utils/bookingId';
import { toast } from 'sonner';

interface RescheduleTicketProps {
  profile?: any;
}

const parseNumericId = (formattedId: string): number | null => {
  const match = formattedId.trim().match(/^BUS\d{8}(\d+)$/i);
  if (!match) return null;
  return parseInt(match[1]);
};

const RescheduleTicket = ({ profile }: RescheduleTicketProps) => {
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [newDate, setNewDate] = useState('');
  const [foundBooking, setFoundBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleFind = async () => {
    const numericId = parseNumericId(bookingIdInput);
    if (!numericId) {
      toast.error('Invalid Booking ID format. Use e.g. BUS202626031');
      return;
    }
    setLoading(true);
    setNotFound(false);
    setFoundBooking(null);
    setRescheduled(false);
    try {
      const data = await apiCall('/bookings');
      const bookings: any[] = data.bookings || [];
      const match = bookings.find((b: any) => b.id === numericId);
      if (!match) {
        setNotFound(true);
      } else {
        setFoundBooking(match);
      }
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!foundBooking || !newDate) {
      toast.error('Please select a new travel date');
      return;
    }
    if (foundBooking.status !== 'booked') {
      toast.error('Only active bookings can be rescheduled');
      return;
    }
    setRescheduling(true);
    try {
      await apiCall(`/bookings/${foundBooking.id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          new_bus_id: foundBooking.busId || foundBooking.bus_id,
          new_seats: foundBooking.seats,
          new_journey_date: newDate,
        }),
      });
      setRescheduled(true);
      toast.success('Booking rescheduled successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  const journeyDate = foundBooking ? (foundBooking.journeyDate || foundBooking.journey_date) : null;
  const passengers = foundBooking ? (foundBooking.passengerDetails || foundBooking.passenger_details || []) : [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <RefreshCw className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Reschedule Ticket</h2>
        <p className="text-gray-500 mt-2">Change your travel date easily</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {/* Search row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={bookingIdInput}
              onChange={(e) => {
                setBookingIdInput(e.target.value.toUpperCase());
                setFoundBooking(null);
                setNotFound(false);
                setRescheduled(false);
              }}
              placeholder="Booking ID (e.g., BUS202626031)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={newDate}
              min={today}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={handleFind}
            disabled={loading || !bookingIdInput}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Find Booking
          </button>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">No booking found with this ID. Please check and try again.</p>
          </div>
        )}

        {/* Booking details */}
        {foundBooking && !rescheduled && (
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-gray-500">{formatBookingId(foundBooking.id, foundBooking.bookingDate || foundBooking.booking_date)}</p>
                <h3 className="text-lg font-bold text-gray-900">{foundBooking.bus?.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${foundBooking.status === 'booked' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {foundBooking.status}
              </span>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-b">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Route</p>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {foundBooking.bus?.source} → {foundBooking.bus?.destination}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Current Date</p>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {journeyDate ? new Date(journeyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Seats</p>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                  {(foundBooking.seats || []).join(', ')}
                </div>
              </div>
            </div>

            {Array.isArray(passengers) && passengers.length > 0 && (
              <div className="px-6 py-4 border-b">
                <p className="text-xs text-gray-400 uppercase font-bold mb-3">Passengers</p>
                <div className="grid gap-2">
                  {passengers.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 text-sm">
                      <span className="font-semibold text-gray-800">{p.name} <span className="text-gray-400 font-normal">({p.age}, {p.gender})</span></span>
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">Seat {p.seat_no}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6">
              {foundBooking.status !== 'booked' ? (
                <p className="text-center text-gray-500 font-medium">Only active bookings can be rescheduled.</p>
              ) : !newDate ? (
                <p className="text-center text-indigo-500 font-medium">Please select a new travel date above to continue.</p>
              ) : (
                <button
                  onClick={handleReschedule}
                  disabled={rescheduling}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {rescheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  Confirm Reschedule to {new Date(newDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {rescheduled && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Booking Rescheduled!</h3>
            <p className="text-gray-500 text-center">
              Your journey date has been updated to{' '}
              <span className="font-semibold text-gray-800">
                {newDate ? new Date(newDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
              </span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RescheduleTicket;
