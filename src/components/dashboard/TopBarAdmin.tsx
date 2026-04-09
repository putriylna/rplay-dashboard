"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, FilmIcon, CalendarIcon, TicketIcon, 
  UserGroupIcon, ComputerDesktopIcon, ArrowLeftOnRectangleIcon, 
  MapIcon, BuildingOfficeIcon, UserCircleIcon, BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { anton } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  { name: 'Cities', icon: MapIcon, href: '/cities' },
  { name: 'Cinemas', icon: BuildingOfficeIcon, href: '/cinemas' },
  { name: 'Studios', icon: ComputerDesktopIcon, href: '/studios' },
  { name: 'Movies', icon: FilmIcon, href: '/movies' },
  { name: 'Actors', icon: UserCircleIcon, href: '/actors' },
  { name: 'Showtimes', icon: CalendarIcon, href: '/schedules' },
  { name: 'Bookings', icon: TicketIcon, href: '/bookings', hasNotification: true },
  { name: 'Users', icon: UserGroupIcon, href: '/users' },
];

export const TopBar = () => {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'profile' | 'notif' | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const savedData = localStorage.getItem('admin_data');
    if (savedData) setAdmin(JSON.parse(savedData));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-24 flex items-center justify-between px-10 z-[70] pointer-events-none">
      
      {/* 1. BRANDING (Kiri) - Tetap nempel ke background utama atau transparan */}
      <div className="flex items-center min-w-[150px] pointer-events-auto">
        <Link href="/dashboard" className="flex items-center gap-1.5 group">
          <span className={`${anton.className} text-2xl text-white tracking-tighter transition-all group-hover:text-[#cc111f]`}>.Movie</span>
          <div className="w-1.5 h-1.5 bg-[#cc111f] rounded-full mt-2 animate-pulse" />
        </Link>
      </div>

      {/* 2. CENTRAL NAVIGATION (MENU SENDIRI DENGAN BG) */}
      <div className="pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#121212]/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.name} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center relative",
                    isActive 
                      ? "text-[#cc111f] bg-[#cc111f]/10 shadow-[inset_0_0_10px_rgba(204,17,31,0.2)] scale-105" 
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                  {item.hasNotification && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#cc111f] rounded-full border-2 border-[#121212] animate-pulse" />
                  )}
                </Link>

                {/* Tooltip */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 z-[80] origin-top">
                  <div className="bg-zinc-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 shadow-2xl whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ADMIN & NOTIF (PULAU SENDIRI DI KANAN) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Notif Box */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'notif' ? null : 'notif')}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#121212]/80 backdrop-blur-md border border-white/5 text-zinc-500 hover:text-[#cc111f] transition-all shadow-lg"
          >
            <BellIcon className="w-5 h-5 stroke-[1.5]" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-[#cc111f] rounded-full" />
          </button>
          
          {/* Notif Dropdown */}
          {openDropdown === 'notif' && (
            <div className="absolute right-0 mt-4 w-64 bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
               <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-black text-white uppercase tracking-widest">Notifications</div>
               <div className="p-4 text-[10px] text-zinc-500 text-center italic">No new messages</div>
            </div>
          )}
        </div>

        {/* Profile Box */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-[#121212]/80 backdrop-blur-md border border-white/5 shadow-lg hover:border-[#cc111f]/30 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#cc111f] to-red-900 flex items-center justify-center overflow-hidden">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[10px] font-bold text-white leading-none truncate max-w-[80px]">
                {admin?.name?.split(' ')[0] || 'Admin'}
              </p>
              <p className="text-[8px] text-[#cc111f] font-black mt-1 uppercase tracking-tighter">Super</p>
            </div>
            <ChevronDownIcon className={cn("w-3 h-3 text-zinc-500 transition-transform", openDropdown === 'profile' && "rotate-180")} />
          </button>

          {/* Profile Dropdown */}
          {openDropdown === 'profile' && (
            <div className="absolute right-0 mt-4 w-48 bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-[11px] font-bold uppercase tracking-widest"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
};