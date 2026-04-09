"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  TicketIcon, 
  FilmIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  ArrowUpRightIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { anton } from '@/lib/fonts';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// Helper format Rupiah
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface Booking {
  booking_id: string;
  user_name: string;
  movie_title: string;
  total_price: number;
  status: 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'EXPIRED'; 
  payment_method: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.api.order["all-bookings"].get();
      if (data) {
        setBookings(data as Booking[]);
        setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC: CHART DATA (7 Hari Terakhir) ---
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTotal = bookings
        .filter(b => b.status === 'SUCCESS' && b.created_at.startsWith(date))
        .reduce((acc, curr) => acc + curr.total_price, 0);
      
      return {
        name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
        revenue: dayTotal
      };
    });
  }, [bookings]);

  // --- LOGIC: STATS ---
  const statsData = useMemo(() => {
    const totalRevenue = bookings
      .filter(b => b.status === 'SUCCESS')
      .reduce((acc, curr) => acc + curr.total_price, 0);

    return [
      { name: 'Total Revenue', value: formatIDR(totalRevenue), icon: BanknotesIcon, color: 'text-green-500', trend: '+12.5%' },
      { name: 'Movies active', value: new Set(bookings.map(b => b.movie_title)).size.toString(), icon: FilmIcon, color: 'text-blue-500', trend: 'Stable' },
      { name: 'Active Customers', value: new Set(bookings.map(b => b.user_name)).size.toString(), icon: UserGroupIcon, color: 'text-purple-500', trend: '+5' },
      { name: 'Tickets Paid', value: bookings.filter(b => b.status === 'SUCCESS').length.toString(), icon: TicketIcon, color: 'text-[#cc111f]', trend: '+18%' },
    ];
  }, [bookings]);

  // --- LOGIC: SEARCH FILTER ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.movie_title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [bookings, searchQuery]);

  return (
    <div className="space-y-8 font-montserrat min-h-screen pb-12 animate-in fade-in duration-500">
      
      {/* 1. Header & Global Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>
            Dashboard Overview
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-zinc-500 text-sm">System Live Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#cc111f] transition-colors" />
            <input 
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#cc111f] focus:ring-1 focus:ring-[#cc111f]/50 transition-all w-full lg:w-64"
            />
          </div>
          <button onClick={fetchData} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Stats Grid with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((item) => (
          <div key={item.name} className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 flex flex-col gap-4 hover:border-zinc-700 transition-all group relative">
            <div className="flex justify-between items-start">
              <div className="shrink-0 p-3 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-zinc-600 transition-all">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                <ArrowUpIcon className="w-2 h-2" /> {item.trend}
              </span>
            </div>
            <div> 
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">{item.name}</p>
              <span className="font-bold text-white text-2xl truncate block">
                {loading ? '...' : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content: Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121212] rounded-2xl border border-zinc-800 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase`}>Revenue Analysis</h2>
              <select className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] px-3 py-1.5 rounded-lg outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cc111f" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#cc111f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                  <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070707', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#cc111f', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#cc111f" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
              <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase`}>Recent Transactions</h2>
              <Link href="/bookings" className="text-[10px] text-[#cc111f] font-bold uppercase tracking-widest flex items-center gap-1 hover:brightness-125">
                View All <ArrowUpRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-zinc-400 font-black border-b border-zinc-800/50 bg-zinc-900/20">
                    <th className="p-5">Customer</th>
                    <th className="p-5">Movie</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-zinc-600 text-xs italic">Syncing with server...</td></tr>
                  ) : filteredBookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 text-zinc-200 text-xs font-bold">{b.user_name}</td>
                      <td className="p-5 text-zinc-500 text-[11px] font-medium">{b.movie_title}</td>
                      <td className="p-5 text-white text-xs font-black">{formatIDR(b.total_price)}</td>
                      <td className="p-5">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${
                          b.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                          b.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Right Sidebar: Quick Actions & System Info */}
        <div className="space-y-6">
          <div className="bg-[#121212] rounded-2xl border border-zinc-800 p-6 shadow-2xl">
            <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase mb-6`}>Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Manage Movies', href: '/movies' },
                { label: 'Schedule Showtime', href: '/schedules' },
                { label: 'Verify Ticket', href: '/tickets' },
                { label: 'User Database', href: '/users' },
              ].map((action) => (
                <Link 
                  key={action.label}
                  href={action.href}
                  className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#cc111f] hover:text-white hover:border-[#cc111f] transition-all text-center"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Last Update & System Health */}
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 border-dashed">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Server Metadata</p>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-600">Last Sync</span>
                <span className="text-zinc-400 font-mono">{lastUpdate || '--:--'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-600">Location</span>
                <span className="text-zinc-400">Main API Gateway</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-600">Status</span>
                <span className="text-green-500 font-bold">Healthy</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}