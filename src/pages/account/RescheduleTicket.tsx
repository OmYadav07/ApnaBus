import React from 'react';
import { RefreshCw, Calendar, Search, ArrowRight } from 'lucide-react';

interface RescheduleTicketProps {
  profile?: any;
}

const RescheduleTicket = ({ profile }: RescheduleTicketProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <RefreshCw className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Reschedule Ticket</h2>
        <p className="text-gray-500 mt-2">Change your travel date easily</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Booking ID</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="e.g., BUS123456" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">New Travel Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
          
          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2">
            <span>Check Availability</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleTicket;
