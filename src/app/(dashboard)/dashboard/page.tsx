"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  TicketIcon, 
  FilmIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  ArrowUpRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { anton } from '@/lib/fonts';
import { api } from '@/lib/api';
import Link from 'next/link';

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

  // --- CLIENT-SIDE LOGIC UNTUK STATS ---
  const statsData = useMemo(() => {
    const totalRevenue = bookings
      .filter(b => b.status === 'SUCCESS')
      .reduce((acc, curr) => acc + curr.total_price, 0);

    const uniqueMovies = new Set(bookings.map(b => b.movie_title)).size;
    const totalTickets = bookings.filter(b => b.status === 'SUCCESS').length;
    // Mock user count karena all-bookings hanya mengembalikan user yang sudah transaksi
    const activeUsers = new Set(bookings.map(b => b.user_name)).size;

    return [
      { name: 'Total Revenue', value: formatIDR(totalRevenue), icon: BanknotesIcon, color: 'text-green-500' },
      { name: 'Movies in Orders', value: uniqueMovies.toString(), icon: FilmIcon, color: 'text-blue-500' },
      { name: 'Active Customers', value: activeUsers.toString(), icon: UserGroupIcon, color: 'text-purple-500' },
      { name: 'Tickets Paid', value: totalTickets.toString(), icon: TicketIcon, color: 'text-[#cc111f]' },
    ];
  }, [bookings]);

  return (
    <div className="space-y-8 font-montserrat min-h-screen pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>
            Dashboard Overview
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Monitoring data RPlay Cinema secara real-time.</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={fetchData}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
            Last Update: {lastUpdate || 'Syncing...'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((item) => (
          <div 
            key={item.name} 
            className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 flex items-center gap-4 hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden"
          >
            <div className={`shrink-0 p-3 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-zinc-600 transition-all`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>

            <div className="flex flex-col min-w-0"> 
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-1 truncate">
                {item.name}
              </p>
              <span className="font-bold text-white tracking-tight leading-none text-xl md:text-2xl truncate">
                {loading ? '...' : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase`}>
              Recent Transactions
            </h2>
            <Link href="/bookings" className="text-[10px] text-[#cc111f] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All <ArrowUpRightIcon className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-zinc-500 font-bold border-b border-zinc-800/50">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {loading ? (
                   <tr>
                    <td colSpan={4} className="p-10 text-center text-zinc-600 text-xs">Loading data...</td>
                   </tr>
                ) : bookings.slice(0, 5).map((b) => (
                  <tr key={b.booking_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-zinc-300 text-xs font-semibold">{b.user_name}</td>
                    <td className="p-4 text-zinc-500 text-[11px] italic">{b.movie_title}</td>
                    <td className="p-4 text-white text-xs font-bold">{formatIDR(b.total_price)}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 
                        b.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#121212] rounded-2xl border border-zinc-800 p-6 self-start">
          <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase mb-6`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Manage Movies', href: '/movies' },
              { label: 'Schedule Showtime', href: '/schedules' },
              { label: 'Verifikasi & Scan Tiket', href: '/tickets' },
              { label: 'User Management', href: '/users' },
            ].map((action) => (
              <Link 
                key={action.label}
                href={action.href}
                className="w-full text-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-[#cc111f] hover:text-white hover:border-[#cc111f] transition-all"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}