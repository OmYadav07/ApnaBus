import { useState } from 'react';
import { 
  Bus, 
  Ticket, 
  HelpCircle, 
  LogOut,
  LayoutDashboard,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BusManagement } from './BusManagement';
import { AdminBookings } from './AdminBookings';
import { AdminSupport } from './AdminSupport';
import { AdminStats } from './AdminStats';

interface AdminDashboardProps {
  profile: any;
  onLogout: () => void;
}

export function AdminDashboard({ profile, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ApnaBus Admin</h1>
                  <p className="text-xs text-gray-500">Management Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">{profile.name}</span>
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
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="buses" className="flex items-center space-x-2">
              <Bus className="w-4 h-4" />
              <span>Buses</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Ticket className="w-4 h-4" />
              <span>Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminStats />
          </TabsContent>

          <TabsContent value="buses">
            <BusManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <AdminBookings />
          </TabsContent>

          <TabsContent value="support">
            <AdminSupport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
