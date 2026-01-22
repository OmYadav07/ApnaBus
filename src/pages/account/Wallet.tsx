import React, { useState } from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface WalletProps {
  profile?: any;
}

const Wallet = ({ profile }: WalletProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const transactions = profile?.transactions || [];
  const balance = profile?.wallet_balance || 0;
  const isWalletActive = profile?.is_wallet_active ?? false;

  const handleActivateWallet = async () => {
    setIsActivating(true);
    try {
      const response = await fetch(
        `https://zmgisuigirhxbygitpdy.supabase.co/functions/v1/make-server-f9d0e288/activate-wallet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          }
        }
      );
      if (!response.ok) throw new Error('Failed to activate wallet');
      toast.success('Wallet activated! ₹100 welcome bonus added.');
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to activate wallet');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold">₹{isWalletActive ? balance.toLocaleString('en-IN') : "100"}.00</h2>
            </div>
            <WalletIcon className="w-12 h-12 text-blue-200 opacity-50" />
          </div>
          <div className="flex space-x-4">
            {isWalletActive ? (
              <>
                <button className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Add Money</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-500 bg-opacity-30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-40 transition-colors border border-white border-opacity-20">
                  <CreditCard className="w-5 h-5" />
                  <span>Cards</span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleActivateWallet}
                disabled={isActivating}
                className="flex items-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {isActivating ? 'Activating...' : 'Activate Wallet & Claim ₹100'}
              </button>
            )}
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
          {transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tx.title}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount)}
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
