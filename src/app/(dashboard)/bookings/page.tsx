"use client";

import { useState } from 'react';
import { anton } from '@/lib/fonts';
import { 
  TicketIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Booking {
  booking_id: string;
  user_name: string;
  movie_title: string;
  total_price: number;
  status: 'Success' | 'Pending' | 'Cancelled';
  payment_method: string;
  created_at: string;
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [bookings] = useState<Booking[]>([
    { 
      booking_id: "BK-8821", 
      user_name: "Alex Johnson", 
      movie_title: "Avenger: Secret Wars", 
      total_price: 150000, 
      status: 'Success', 
      payment_method: 'Midtrans (GoPay)',
      created_at: "2026-03-13 10:30" 
    },
    { 
      booking_id: "BK-8822", 
      user_name: "Sarah Miller", 
      movie_title: "The Conjuring 4", 
      total_price: 50000, 
      status: 'Pending', 
      payment_method: 'Midtrans (VA)',
      created_at: "2026-03-13 11:15" 
    },
    { 
      booking_id: "BK-8823", 
      user_name: "Budi Santoso", 
      movie_title: "Avenger: Secret Wars", 
      total_price: 100000, 
      status: 'Cancelled', 
      payment_method: 'Transfer Bank',
      created_at: "2026-03-12 21:00" 
    },
  ]);

  const filteredBookings = bookings.filter(b => 
    b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-montserrat">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>Bookings</h1>
          <p className="text-zinc-500 text-sm">Monitor seluruh transaksi dan tiket masuk.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search ID or Name..." 
            className="admin-input pl-10 py-2 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                <th className="p-5">ID & Date</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Movie</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Payment Status</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredBookings.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="text-white font-bold text-xs">{booking.booking_id}</div>
                    <div className="text-[10px] text-zinc-600 mt-1 font-bold uppercase">{booking.created_at}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-zinc-300 text-sm font-medium">{booking.user_name}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-zinc-400 text-xs">{booking.movie_title}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-zinc-600 text-[10px] font-bold">Rp</span>
                      <span className="text-white font-bold text-sm">{booking.total_price.toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    {booking.status === 'Success' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase">
                        <CheckCircleIcon className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {booking.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase">
                        <ClockIcon className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {booking.status === 'Cancelled' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-bold uppercase">
                        <XCircleIcon className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      <button className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:text-[#cc111f] transition-all">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <TicketIcon className="w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-600 italic text-sm">No transaction records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}