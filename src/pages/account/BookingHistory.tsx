import React from 'react';
import { Bus, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

interface BookingHistoryProps {
  profile?: any;
}

const BookingHistory = ({ profile }: BookingHistoryProps) => {
  const bookings = [
    {
      id: "BUS123456",
      from: "Delhi",
      to: "Jaipur",
      date: "25 Jan 2024",
      time: "10:30 PM",
      status: "Upcoming",
      amount: 850,
      busType: "AC Seater/Sleeper"
    },
    {
      id: "BUS987654",
      from: "Mumbai",
      to: "Pune",
      date: "20 Jan 2024",
      time: "08:00 AM",
      status: "Completed",
      amount: 450,
      busType: "Non-AC Seater"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">All</button>
          <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Upcoming</button>
          <button className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Completed</button>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                  <p className="font-semibold text-gray-900">{booking.busType}</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                booking.status === 'Upcoming' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{booking.from}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Source</p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-200 relative">
                  <ChevronRight className="w-5 h-5 text-blue-600 absolute -top-2.5 right-0 bg-white" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{booking.to}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Destination</p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 border-l border-gray-100 pl-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{booking.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{booking.time}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Total Fare</p>
                <p className="text-2xl font-bold text-gray-900">₹{booking.amount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingHistory;
