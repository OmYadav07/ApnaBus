import React from 'react';
import { XCircle, AlertCircle, Search } from 'lucide-react';

interface CancelTicketProps {
  profile?: any;
}

const CancelTicket = ({ profile }: CancelTicketProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl mb-4">
          <XCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Cancel Your Ticket</h2>
        <p className="text-gray-500 mt-2">Find your booking to proceed with cancellation</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Enter Booking ID (e.g., BUS123456)" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
          </div>
          <button className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100">
            Find Booking
          </button>
        </div>

        <div className="mt-8 flex items-start space-x-4 p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-1">Cancellation Policy</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800 opacity-90">
              <li>Full refund if cancelled 24 hours before departure</li>
              <li>50% refund if cancelled between 12-24 hours before departure</li>
              <li>No refund for cancellations within 12 hours of departure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelTicket;
