import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, Wallet, History, XCircle, RefreshCw, ChevronLeft } from 'lucide-react';

const AccountLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: "/account/profile", label: "Profile", icon: User },
    { to: "/account/wallet", label: "Wallet", icon: Wallet },
    { to: "/account/bookings", label: "Booking History", icon: History },
    { to: "/account/cancel", label: "Cancel Ticket", icon: XCircle },
    { to: "/account/reschedule", label: "Reschedule Ticket", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 px-4">My Account</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors ${
                  ({ isActive }: any) => isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 text-white">
            <p className="text-sm text-blue-100 mb-1">Support 24/7</p>
            <p className="font-bold">Need Help?</p>
            <button className="mt-3 w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
