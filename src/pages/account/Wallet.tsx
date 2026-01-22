import React from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';

const Wallet = () => {
  const transactions = [
    { id: 1, title: "Ticket Booking - DEL to MUM", amount: -1250, date: "22 Jan 2024", type: "debit" },
    { id: 2, title: "Added Money to Wallet", amount: 2000, date: "20 Jan 2024", type: "credit" },
    { id: 3, title: "Ticket Cancellation Refund", amount: 850, date: "15 Jan 2024", type: "credit" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold">₹2,450.00</h2>
            </div>
            <WalletIcon className="w-12 h-12 text-blue-200 opacity-50" />
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add Money</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-500 bg-opacity-30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-40 transition-colors border border-white border-opacity-20">
              <CreditCard className="w-5 h-5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <button className="text-blue-600 font-medium text-sm hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tx.title}</p>
                  <p className="text-sm text-gray-500">{tx.date}</p>
                </div>
              </div>
              <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
