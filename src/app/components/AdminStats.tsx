import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { Bus, Ticket, Users, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function AdminStats() {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [busesData, bookingsData] = await Promise.all([
        apiCall('/buses'),
        apiCall('/admin/bookings'),
      ]);

      const buses = busesData.buses || [];
      const bookings = bookingsData.bookings || [];
      const activeBookings = bookings.filter((b: any) => b.status === 'booked');
      const revenue = bookings
        .filter((b: any) => b.status === 'booked')
        .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

      setStats({
        totalBuses: buses.length,
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
        revenue,
      });
    } catch (error) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Buses', value: stats.totalBuses, icon: Bus, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Active Bookings', value: stats.activeBookings, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Revenue', value: `₹${stats.revenue}`, icon: IndianRupee, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
