import React, { useState } from 'react';
import { XCircle, AlertCircle, Search, MapPin, Calendar, Ticket, IndianRupee, Loader2, CheckCircle } from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { formatBookingId } from '../../utils/bookingId';
import { toast } from 'sonner';

interface CancelTicketProps {
  profile?: any;
}

const parseNumericId = (formattedId: string): number | null => {
  const match = formattedId.trim().match(/^BUS\d{8}(\d+)$/i);
  if (!match) return null;
  return parseInt(match[1]);
};

const CancelTicket = ({ profile }: CancelTicketProps) => {
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [foundBooking, setFoundBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
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

  const handleCancel = async () => {
    if (!foundBooking) return;
    setCancelling(true);
    try {
      await apiCall(`/bookings/${foundBooking.id}/cancel`, { method: 'POST' });
      setCancelled(true);
      toast.success('Booking cancelled and refund initiated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const journeyDate = foundBooking ? (foundBooking.journeyDate || foundBooking.journey_date) : null;
  const totalAmount = foundBooking ? (foundBooking.totalAmount ?? foundBooking.total_amount) : null;
  const passengers = foundBooking ? (foundBooking.passengerDetails || foundBooking.passenger_details || []) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl mb-4">
          <XCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Cancel Your Ticket</h2>
        <p className="text-gray-500 mt-2">Find your booking to proceed with cancellation</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {/* Search */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={bookingIdInput}
              onChange={(e) => {
                setBookingIdInput(e.target.value.toUpperCase());
                setFoundBooking(null);
                setNotFound(false);
                setCancelled(false);
              }}
              placeholder="Enter Booking ID (e.g., BUS202626031)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
          </div>
          <button
            onClick={handleFind}
            disabled={loading || !bookingIdInput}
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Find Booking
          </button>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">No booking found with this ID. Please check and try again.</p>
          </div>
        )}

        {/* Booking details */}
        {foundBooking && !cancelled && (
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className={`px-6 py-4 flex items-center justify-between ${foundBooking.status === 'cancelled' ? 'bg-gray-100' : 'bg-red-50'}`}>
              <div>
                <p className="font-mono text-sm font-bold text-gray-600">{formatBookingId(foundBooking.id, foundBooking.bookingDate || foundBooking.booking_date)}</p>
                <h3 className="text-lg font-bold text-gray-900">{foundBooking.bus?.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${foundBooking.status === 'booked' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {foundBooking.status}
              </span>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Route</p>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {foundBooking.bus?.source} → {foundBooking.bus?.destination}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Journey Date</p>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-red-400" />
                  {journeyDate ? new Date(journeyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Seats</p>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <Ticket className="w-3.5 h-3.5 text-red-400" />
                  {(foundBooking.seats || []).join(', ')}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Amount Paid</p>
                <div className="flex items-center gap-1 text-gray-700 font-bold text-base">
                  <IndianRupee className="w-3.5 h-3.5 text-red-400" />
                  {totalAmount != null ? Number(totalAmount).toFixed(2) : '—'}
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
                      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">Seat {p.seat_no}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6">
              {foundBooking.status === 'cancelled' ? (
                <p className="text-center text-gray-500 font-medium">This booking is already cancelled.</p>
              ) : (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Confirm Cancellation & Refund ₹{totalAmount != null ? Number(totalAmount).toFixed(2) : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {cancelled && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Booking Cancelled</h3>
            <p className="text-gray-500 text-center">Your refund of ₹{totalAmount != null ? Number(totalAmount).toFixed(2) : ''} has been initiated to your wallet.</p>
          </div>
        )}

        {/* Policy */}
        <div className="flex items-start space-x-4 p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-1">Cancellation Policy</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800 opacity-90">
              <li>Full refund if cancelled 24 hours before departure</li>
              <li>50% refund if cancelled between 12–24 hours before departure</li>
              <li>No refund for cancellations within 12 hours of departure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelTicket;
