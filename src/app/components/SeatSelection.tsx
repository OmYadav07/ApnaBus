import { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Check, Ticket, Download, Calendar, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SeatSelectionProps {
  bus: any;
  profile: any;
  onBack: () => void;
}

export function SeatSelection({ bus, profile, onBack }: SeatSelectionProps) {
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [showTicket, setShowTicket] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    // Sync passenger details with selected seats
    setPassengerDetails(prev => {
      const newDetails = selectedSeats.map(seatId => {
        const existing = prev.find(p => p.seat_no === seatId);
        return existing || { seat_no: seatId, name: '', age: '', gender: 'Male' };
      });
      return newDetails;
    });
  }, [selectedSeats]);

  const fetchSeats = async () => {
    try {
      const data = await apiCall(`/buses/${bus.id}/seats`);
      setBookedSeats(data.booked_seats || []);
    } catch (error) {
      toast.error('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber: number) => {
    if (bookedSeats.includes(seatNumber)) return;
    
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    setPassengerDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    const invalidPassenger = passengerDetails.find(p => !p.name || !p.age || !p.gender);
    if (invalidPassenger) {
      toast.error('Please fill all passenger details');
      return;
    }

    const totalAmount = bus.price * selectedSeats.length;
    if (profile.role !== 'admin' && profile.wallet_balance < totalAmount) {
      toast.error('Insufficient wallet balance. Please add money to your wallet.');
      return;
    }

    setBooking(true);
    try {
      const result = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          bus_id: bus.id,
          seats: selectedSeats,
          journey_date: journeyDate,
          passenger_details: passengerDetails
        }),
      });

      setLastBooking({ ...result.booking, bus });
      toast.success('Booking successful!');
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const downloadTicketPDF = async () => {
    if (!ticketRef.current) return;
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ApnaBus-Ticket-${lastBooking.id}.pdf`);
      toast.success('Ticket downloaded as PDF!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const TicketCard = ({ booking }: { booking: any }) => (
    <div ref={ticketRef} className="bg-white p-6 rounded-xl border-2 border-dashed border-blue-200 shadow-sm max-w-md mx-auto overflow-hidden text-left">
      <div className="flex justify-between items-start border-b-2 border-blue-50 pb-4 mb-4">
        <div>
          <h3 className="text-xl font-black text-blue-900 tracking-tight">ApnaBus</h3>
          <p className="text-[10px] text-blue-500 uppercase font-bold">Official E-Ticket</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">Booking ID</p>
          <p className="font-mono text-sm font-bold text-gray-900">#{booking.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">From</p>
            <p className="text-sm font-bold text-gray-900">{booking.bus.source}</p>
          </div>
          <div className="flex flex-col items-center px-4">
            <div className="w-16 h-[2px] bg-blue-200 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">To</p>
            <p className="text-sm font-bold text-gray-900">{booking.bus.destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-500 font-medium mb-1">JOURNEY DATE</p>
            <div className="flex items-center space-x-2 font-bold text-gray-900">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>{new Date(booking.journeyDate || booking.journey_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">BUS DETAILS</p>
            <p className="font-bold text-gray-900 uppercase truncate">{booking.bus.name}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Passenger Information</p>
          <div className="space-y-2">
            {(booking.passengerDetails || booking.passenger_details).map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                <div className="font-bold text-gray-800">
                  {p.name} <span className="text-gray-400 font-medium ml-1">({p.age}, {p.gender})</span>
                </div>
                <div className="bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                  {p.seat_no}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-blue-50 flex justify-between items-end">
          <div className="text-[10px] text-gray-400 font-medium max-w-[120px]">
            Please carry a valid photo ID during your journey.
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Paid Amount</p>
            <p className="text-lg font-black text-blue-600">₹{booking.totalAmount || booking.total_amount}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeats = () => {
    const totalSeatsCount = bus.totalSeats || bus.total_seats || 40;
    const rows = Math.ceil(totalSeatsCount / 4);
    const seats: JSX.Element[] = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats: JSX.Element[] = [];
      for (let col = 0; col < 4; col++) {
        const seatNumber = row * 4 + col + 1;
        if (seatNumber > totalSeatsCount) break;

        const isBooked = bookedSeats.includes(seatNumber);
        const isSelected = selectedSeats.includes(seatNumber);
        const isFemale = bus.amenities?.female_seats?.includes(seatNumber);
        const isSenior = bus.amenities?.senior_citizen_seats?.includes(seatNumber);

        rowSeats.push(
          <button
            key={seatNumber}
            type="button"
            onClick={() => toggleSeat(seatNumber)}
            disabled={isBooked}
            className={`
              w-12 h-12 rounded-lg font-semibold text-sm transition-all
              \${isBooked ? 'bg-red-700 text-white cursor-not-allowed shadow-inner' : ''}
              \${isSelected ? 'bg-green-500 text-white shadow-lg scale-105' : ''}
              \${!isBooked && !isSelected && isFemale ? 'bg-pink-400 text-white hover:bg-pink-500' : ''}
              \${!isBooked && !isSelected && isSenior ? 'bg-orange-400 text-white hover:bg-orange-500' : ''}
              \${!isBooked && !isSelected && !isFemale && !isSenior ? 'bg-gray-100 hover:bg-blue-100 text-gray-700' : ''}
            `}
          >
            {seatNumber}
          </button>
        );

        if (col === 1) {
          rowSeats.push(<div key={`gap-\${row}`} className="w-8" />);
        }
      }

      seats.push(
        <div key={row} className="flex items-center justify-center gap-3">
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  if (lastBooking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900">Booking Confirmed!</h2>
          <p className="text-gray-500">Your ticket has been generated and confirmed.</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Dialog open={showTicket} onOpenChange={setShowTicket}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center space-x-2">
                <Ticket className="w-5 h-5" />
                <span>View Ticket</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none">
              <div className="bg-white rounded-xl overflow-hidden">
                <DialogHeader className="p-4 bg-indigo-600 text-white text-left">
                  <DialogTitle className="flex items-center space-x-2">
                    <Ticket className="w-5 h-5" />
                    <span>Your E-Ticket</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 bg-gray-100">
                  <TicketCard booking={lastBooking} />
                </div>
                <div className="p-4 flex gap-3">
                  <Button onClick={downloadTicketPDF} className="flex-1 bg-blue-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={downloadTicketPDF}
            variant="outline"
            className="w-full h-12 border-2 border-blue-100 hover:bg-blue-50 text-blue-700 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Ticket</span>
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="secondary" 
              className="h-12 flex items-center justify-center space-x-2"
              onClick={() => toast.info('Reschedule feature coming soon!')}
            >
              <Calendar className="w-4 h-4" />
              <span>Reschedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex items-center justify-center space-x-2"
              onClick={onBack}
            >
              <Home className="w-4 h-4" />
              <span>Back To Home</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Layout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Seats</CardTitle>
              <p className="text-sm text-gray-600">{bus.name} - {bus.source} to {bus.destination}</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-6 pb-4 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 rounded"></div>
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-bottom"></div>
                      <span className="text-sm text-gray-600">Selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-red-700 rounded"></div>
                      <span className="text-sm text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-pink-400 rounded"></div>
                      <span className="text-sm text-gray-600">Female</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-400 rounded"></div>
                      <span className="text-sm text-gray-600">Senior</span>
                    </div>
                  </div>

                  {/* Seats Grid */}
                  <div className="space-y-3 bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg">
                    <div className="text-center mb-4 pb-2 border-b">
                      <span className="text-sm font-medium text-gray-500">Driver</span>
                    </div>
                    {renderSeats()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Journey Date</Label>
                <Input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-6 pt-4">
                {passengerDetails.map((passenger, index) => (
                  <div key={passenger.seat_no} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <p className="font-bold text-purple-900 border-b pb-2">
                      Passenger {index + 1} (Seat: {passenger.seat_no})
                    </p>
                    
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Age</Label>
                        <Input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <div className="flex items-center space-x-4 pt-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`gender-\${passenger.seat_no}`}
                              value="Male"
                              checked={passenger.gender === 'Male'}
                              onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">Male</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`gender-\${passenger.seat_no}`}
                              value="Female"
                              checked={passenger.gender === 'Female'}
                              onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">Female</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Selected Seats:</span>
                  <span className="font-medium">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per seat:</span>
                  <span className="font-medium">₹{bus.price}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">₹{bus.price * selectedSeats.length}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Wallet Balance: ₹{profile.wallet_balance?.toFixed(2)}
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={booking || selectedSeats.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
