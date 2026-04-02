"use client";

import { 
  TicketIcon, 
  FilmIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  ArrowUpRightIcon 
} from '@heroicons/react/24/outline';
import { anton } from '@/lib/fonts';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Revenue', value: '45.200.000.000', isCurrency: true, icon: BanknotesIcon },
    { name: 'Active Movies', value: '12', isCurrency: false, icon: FilmIcon },
    { name: 'Total Users', value: '1.240', isCurrency: false, icon: UserGroupIcon },
    { name: 'Tickets Sold', value: '850', isCurrency: false, icon: TicketIcon },
  ];

  return (
    <div className="space-y-8 font-montserrat">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>
            Dashboard Overview
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Monitoring data RPlay Cinema secara real-time.</p>
        </div>
        <div className="hidden md:block">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
            Last Update: Just Now
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div 
            key={item.name} 
            className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 flex items-center gap-4 hover:border-[#cc111f]/50 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Dekorasi Background Hover */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#cc111f] opacity-0 group-hover:opacity-5 blur-2xl transition-opacity"></div>

            {/* Icon Box */}
            <div className="shrink-0 p-3 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:bg-[#cc111f]/10 group-hover:border-[#cc111f]/30 transition-all">
              <item.icon className="w-5 h-5 text-[#cc111f]" />
            </div>

            {/* Content Container */}
            <div className="flex flex-col min-w-0"> 
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-1 truncate">
                {item.name}
              </p>
              
              <div className="flex items-baseline whitespace-nowrap overflow-hidden">
                {item.isCurrency && (
                  <span className="text-zinc-500 text-xs font-medium mr-1 selection:bg-none">Rp</span>
                )}
                <span className={`font-bold text-white tracking-tight leading-none transition-all duration-300 group-hover:text-white
                  ${item.isCurrency ? 'text-xl md:text-2xl' : 'text-2xl'}`}>
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area (Table Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase`}>
              Recent Transactions
            </h2>
            <button className="text-[10px] text-[#cc111f] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All <ArrowUpRightIcon className="w-3 h-3" />
            </button>
          </div>
          
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-2 border-[#cc111f]/20 border-t-[#cc111f] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#cc111f] rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Synchronizing with database...</p>
            <p className="text-zinc-700 text-[10px] mt-1 uppercase tracking-tighter">Table: bookings & payments</p>
          </div>
        </div>

        {/* Quick Actions / Popular Movies Mini Section */}
        <div className="bg-[#121212] rounded-2xl border border-zinc-800 p-6">
          <h2 className={`${anton.className} text-xl text-white tracking-wide uppercase mb-6`}>
            Quick Actions
          </h2>
          <div className="space-y-3">
            {['Add New Movie', 'Schedule Showtime', 'Verify Ticket', 'Export Report'].map((action) => (
              <button 
                key={action}
                className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-[#cc111f] hover:text-white hover:border-[#cc111f] transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}