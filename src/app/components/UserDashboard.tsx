import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { toast } from 'sonner';
import { 
  Bus, 
  Wallet, 
  Ticket, 
  HelpCircle, 
  LogOut, 
  Search,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BusSearch } from './BusSearch';
import { BookingHistory } from './BookingHistory';
import { WalletManagement } from './WalletManagement';
import { SupportCenter } from './SupportCenter';

interface UserDashboardProps {
  profile: any;
  onLogout: () => void;
}

export function UserDashboard({ profile, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">ApnaBus</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">
                  ₹{profile.wallet_balance?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{profile.name}</span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white shadow-sm">
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search Buses</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Ticket className="w-4 h-4" />
              <span>My Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <BusSearch profile={profile} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingHistory profile={profile} />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletManagement profile={profile} />
          </TabsContent>

          <TabsContent value="support">
            <SupportCenter profile={profile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
