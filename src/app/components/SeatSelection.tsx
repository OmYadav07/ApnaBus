import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
      await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          bus_id: bus.id,
          seats: selectedSeats,
          journey_date: journeyDate,
          passenger_details: passengerDetails
        }),
      });

      toast.success('Booking successful!');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

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
              ${isBooked ? 'bg-red-700 text-white cursor-not-allowed shadow-inner' : ''}
              ${isSelected ? 'bg-green-500 text-white shadow-lg scale-105' : ''}
              ${!isBooked && !isSelected && isFemale ? 'bg-pink-400 text-white hover:bg-pink-500' : ''}
              ${!isBooked && !isSelected && isSenior ? 'bg-orange-400 text-white hover:bg-orange-500' : ''}
              ${!isBooked && !isSelected && !isFemale && !isSenior ? 'bg-gray-100 hover:bg-blue-100 text-gray-700' : ''}
            `}
          >
            {seatNumber}
          </button>
        );

        if (col === 1) {
          rowSeats.push(<div key={`gap-${row}`} className="w-8" />);
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

  const [booking, setBooking] = useState(false);
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().split('T')[0]);

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
      await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          bus_id: bus.id,
          seats: selectedSeats,
          journey_date: journeyDate,
          passenger_details: passengerDetails
        }),
      });

      toast.success('Booking successful!');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

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
                      <div className="w-8 h-8 bg-green-500 rounded"></div>
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
                              name={`gender-${passenger.seat_no}`}
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
                              name={`gender-${passenger.seat_no}`}
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
