"use client";

import { useState, useEffect, useCallback } from 'react';
import { anton } from '@/lib/fonts';
import { 
  TicketIcon, CheckCircleIcon, ClockIcon, 
  XCircleIcon, MagnifyingGlassIcon, EyeIcon 
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api'; 

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

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Pemanggilan ini sekarang aman karena di Swagger sudah muncul
      const { data, error } = await api.api.order["all-bookings"].get();
      
      if (error) {
        // Menampilkan pesan error yang lebih spesifik jika ada
        const msg = error.value && typeof error.value === 'object' && 'error' in error.value 
          ? String(error.value.error) 
          : "Gagal mengambil data";
        setErrorMsg(`${msg} (Status: ${error.status})`);
        return;
      }

      if (data) {
        setBookings(data as Booking[]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setErrorMsg("Koneksi ke server terputus atau API tidak merespon.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(b => 
    b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.movie_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-montserrat min-h-screen pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>
            Bookings
          </h1>
          <p className="text-zinc-500 text-sm italic">Data transaksi tiket bioskop secara real-time.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchBookings}
            disabled={loading}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cari Customer, ID, atau Film..." 
              className="pl-10 pr-4 py-2.5 text-xs w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-zinc-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchBookings} className="px-3 py-1 bg-red-500/20 rounded-md hover:bg-red-500/30 transition-all font-bold">Retry</button>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                <th className="p-5">Booking Info</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Movie Title</th>
                <th className="p-5">Price Detail</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">Synchronizing...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="p-5">
                    <div className="text-white font-black text-xs tracking-tight">{booking.booking_id}</div>
                    <div className="text-[10px] text-zinc-500 mt-1 font-medium">
                      {new Date(booking.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })} • {new Date(booking.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-5 text-zinc-300 text-sm font-semibold">{booking.user_name}</td>
                  <td className="p-5 text-zinc-400 text-xs italic font-medium">{booking.movie_title}</td>
                  <td className="p-5">
                    <div className="text-white font-bold text-sm">{formatIDR(booking.total_price)}</div>
                    <div className="text-[9px] text-red-500/80 uppercase font-black mt-0.5 tracking-tighter">via {booking.payment_method}</div>
                  </td>
                  <td className="p-5">
                    {booking.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> PAID
                      </span>
                    ) : booking.status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest">
                        <ClockIcon className="w-3.5 h-3.5" /> UNPAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest">
                        <XCircleIcon className="w-3.5 h-3.5" /> VOIDED
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all shadow-lg group-hover:scale-110"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredBookings.length === 0 && (
          <div className="p-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800/50 shadow-inner">
              <TicketIcon className="w-10 h-10 text-zinc-800" />
            </div>
            <p className="text-zinc-400 font-bold text-base uppercase tracking-tighter">Zero Bookings Found</p>
            <p className="text-zinc-600 text-[10px] mt-2 max-w-[200px] leading-relaxed">Sistem tidak menemukan data yang sesuai.</p>
          </div>
        )}
      </div>
    </div>
  );
}