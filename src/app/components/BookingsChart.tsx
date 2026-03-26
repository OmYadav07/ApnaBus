import { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getISOWeek(d: Date) {
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const diff = startOfDay(d).getTime() - startOfWeek1.getTime();
  return Math.floor(diff / (7 * 86400000)) + 1;
}

function buildChartData(bookings: any[], period: Period) {
  const now = new Date();

  if (period === 'daily') {
    const days: { label: string; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        date: startOfDay(d),
      });
    }
    return days.map(({ label, date }) => {
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const matched = bookings.filter((b) => {
        const bd = new Date(b.bookingDate || b.booking_date);
        return bd >= date && bd < next;
      });
      return {
        label,
        bookings: matched.length,
        revenue: matched.reduce((s: number, b: any) => s + (b.totalAmount ?? b.total_amount ?? 0), 0),
      };
    });
  }

  if (period === 'weekly') {
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const dayOfWeek = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - dayOfWeek);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 7);
      weeks.push({
        label: `W${getISOWeek(monday)} (${monday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`,
        start: startOfDay(monday),
        end: startOfDay(sunday),
      });
    }
    return weeks.map(({ label, start, end }) => {
      const matched = bookings.filter((b) => {
        const bd = startOfDay(new Date(b.bookingDate || b.booking_date));
        return bd >= start && bd < end;
      });
      return {
        label,
        bookings: matched.length,
        revenue: matched.reduce((s: number, b: any) => s + (b.totalAmount ?? b.total_amount ?? 0), 0),
      };
    });
  }

  if (period === 'monthly') {
    const months: { label: string; year: number; month: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months.map(({ label, year, month }) => {
      const matched = bookings.filter((b) => {
        const bd = new Date(b.bookingDate || b.booking_date);
        return bd.getFullYear() === year && bd.getMonth() === month;
      });
      return {
        label,
        bookings: matched.length,
        revenue: matched.reduce((s: number, b: any) => s + (b.totalAmount ?? b.total_amount ?? 0), 0),
      };
    });
  }

  // yearly
  const thisYear = now.getFullYear();
  const years = [thisYear - 3, thisYear - 2, thisYear - 1, thisYear];
  return years.map((yr) => {
    const matched = bookings.filter((b) => {
      const bd = new Date(b.bookingDate || b.booking_date);
      return bd.getFullYear() === yr;
    });
    return {
      label: String(yr),
      bookings: matched.length,
      revenue: matched.reduce((s: number, b: any) => s + (b.totalAmount ?? b.total_amount ?? 0), 0),
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.dataKey === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function BookingsChart() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (allBookings.length >= 0) {
      setChartData(buildChartData(allBookings, period));
    }
  }, [period, allBookings]);

  const fetchBookings = async () => {
    try {
      const data = await apiCall('/admin/bookings');
      setAllBookings(data.bookings || []);
    } catch {
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const totalBookings = chartData.reduce((s, d) => s + d.bookings, 0);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Booking Analytics</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalBookings} bookings · ₹{totalRevenue.toLocaleString()} revenue
              </p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {periods.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === key
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bookings Area Chart */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 ml-1">Bookings</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="url(#bookingGrad)"
                    dot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Bar Chart */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 ml-1">Revenue (₹)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barSize={period === 'yearly' ? 48 : 24}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#fb923c" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
