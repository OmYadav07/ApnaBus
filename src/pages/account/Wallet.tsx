import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '../../utils/supabase';

interface WalletProps {
  profile?: any;
  onWalletUpdate?: () => void;
}

const Wallet = ({ profile, onWalletUpdate }: WalletProps) => {
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [amount, setAmount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const balance = profile?.wallet_balance || 0;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await apiCall('/wallet/transactions');
      setTransactions(data.transactions || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleAddMoney = async () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsAddingMoney(true);
    try {
      await apiCall('/wallet/add', {
        method: 'POST',
        body: JSON.stringify({ amount: amountNum }),
      });

      toast.success(`Added ${amountNum} to wallet!`);
      setShowAddModal(false);
      setAmount('');
      fetchTransactions();
      if (onWalletUpdate) onWalletUpdate();
    } catch (error: any) {
      console.error('Add money error:', error);
      toast.error(error.message || 'Failed to add money');
    } finally {
      setIsAddingMoney(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold">{balance.toLocaleString('en-IN')}</h2>
            </div>
            <WalletIcon className="w-12 h-12 text-blue-200 opacity-50" />
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add Money to Wallet</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border rounded-xl mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                disabled={isAddingMoney}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {isAddingMoney ? 'Adding...' : 'Add Money'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <button className="text-blue-600 font-medium text-sm hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-50">
          {loadingTxns ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <WalletIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
