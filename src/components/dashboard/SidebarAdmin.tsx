"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, FilmIcon, CalendarIcon, TicketIcon, 
  UserGroupIcon, ComputerDesktopIcon, ArrowLeftOnRectangleIcon, 
  MapIcon, BuildingOfficeIcon, ChevronLeftIcon, ChevronRightIcon,
  UserCircleIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { anton } from '@/lib/fonts';
import { cn } from '@/lib/utils';

// Kelompokkan menu agar lebih rapi secara psikologis
const navigation = {
  main: [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  ],
  management: [
    { name: 'Cities', icon: MapIcon, href: '/cities' },
    { name: 'Cinemas', icon: BuildingOfficeIcon, href: '/cinemas' },
    { name: 'Studios', icon: ComputerDesktopIcon, href: '/studios' },
    { name: 'Movies', icon: FilmIcon, href: '/movies' },
    { name: 'Actors', icon: UserCircleIcon, href: '/actors' },
  ],
  operational: [
    { name: 'Showtimes', icon: CalendarIcon, href: '/schedules' },
    { name: 'Bookings', icon: TicketIcon, href: '/bookings' },
    { name: 'Users', icon: UserGroupIcon, href: '/users' },
  ]
};

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const pathname = usePathname(); // Untuk deteksi menu aktif

  useEffect(() => {
    const savedData = localStorage.getItem('admin_data');
    if (savedData) setAdmin(JSON.parse(savedData));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Helper untuk Render Link
  const NavLink = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
          isActive 
            ? "bg-[#cc111f]/10 text-white shadow-[inset_0_0_10px_rgba(204,17,31,0.1)]" 
            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
        )}
      >
        {/* Indikator Garis Aktif */}
        {isActive && (
          <div className="absolute left-0 w-1 h-6 bg-[#cc111f] rounded-r-full shadow-[0_0_10px_#cc111f]" />
        )}

        <item.icon className={cn(
          "w-6 h-6 min-w-[24px] transition-colors",
          isActive ? "text-[#cc111f]" : "group-hover:text-zinc-200"
        )} />
        
        {!isCollapsed && (
          <span className={cn(
            "font-semibold text-sm whitespace-nowrap tracking-tight",
            isActive ? "text-white" : ""
          )}>
            {item.name}
          </span>
        )}

        {/* Tooltip saat Collapsed */}
        {isCollapsed && (
          <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all z-[60] bg-zinc-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-md border border-zinc-700 pointer-events-none uppercase tracking-widest">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside 
      className={cn(
        "bg-[#070707] border-r border-zinc-800/50 flex flex-col h-screen fixed transition-all duration-500 ease-in-out z-50 shadow-2xl",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* 1. HEADER LOGO */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/30">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#cc111f] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(204,17,31,0.4)]">
              <span className={`${anton.className} text-xl text-white mt-1`}>R</span>
            </div>
            <h2 className={`${anton.className} text-2xl text-white tracking-tighter`}>PLAY</h2>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all active:scale-95"
        >
          {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. NAVIGATION AREA */}
      <div className="flex-1 px-3 py-4 space-y-8 overflow-y-auto custom-scrollbar">
        
        {/* Section: Main */}
        <div className="space-y-1">
          {navigation.main.map(item => <NavLink key={item.name} item={item} />)}
        </div>

        {/* Section: Management */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Management</p>
          )}
          {navigation.management.map(item => <NavLink key={item.name} item={item} />)}
        </div>

        {/* Section: Operational */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Transaction</p>
          )}
          {navigation.operational.map(item => <NavLink key={item.name} item={item} />)}
        </div>
      </div>

      {/* 3. FOOTER / USER PROFILE */}
      <div className="p-4 bg-[#0a0a0a] border-t border-zinc-800/50">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/30 border border-white/5",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="relative">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
               <UserCircleIcon className="w-7 h-7" />
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-zinc-200 text-xs font-bold truncate tracking-tight uppercase">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-zinc-500 text-[10px] truncate">
                Super Admin
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 p-3 mt-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6 min-w-[24px]" />
          {!isCollapsed && <span className="font-bold uppercase text-[11px] tracking-widest">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};