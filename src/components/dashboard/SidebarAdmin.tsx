"use client";

import { useState, useEffect } from 'react';
import { 
  HomeIcon, FilmIcon, CalendarIcon, TicketIcon, 
  UserGroupIcon, ComputerDesktopIcon, ArrowLeftOnRectangleIcon, 
  MapIcon, BuildingOfficeIcon, ChevronLeftIcon, ChevronRightIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import { anton } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  { name: 'Cities', icon: MapIcon, href: '/cities' },
  { name: 'Cinemas', icon: BuildingOfficeIcon, href: '/cinemas' },
  { name: 'Studios', icon: ComputerDesktopIcon, href: '/studios' },
  { name: 'Movies', icon: FilmIcon, href: '/movies' },
  { name: 'Actors', icon: UserCircleIcon, href: '/actors' },
  { name: 'Showtimes', icon: CalendarIcon, href: '/schedules' },
  { name: 'Bookings', icon: TicketIcon, href: '/bookings' },
  { name: 'Users', icon: UserGroupIcon, href: '/users' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  // Ambil data admin dari localStorage saat halaman dimuat
  useEffect(() => {
    const savedData = localStorage.getItem('admin_data');
    if (savedData) {
      setAdmin(JSON.parse(savedData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Bersihkan semua session
    window.location.href = '/login';
  };

  return (
    <aside 
      className={cn(
        "bg-[#0a0a0a] border-r border-zinc-800 flex flex-col h-screen fixed transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <h2 className={`${anton.className} text-2xl text-[#cc111f] tracking-tighter`}>RPLAY</h2>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <a 
            key={item.name} 
            href={item.href} 
            className="flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-xl transition-all group"
          >
            <item.icon className="w-6 h-6 min-w-[24px] group-hover:text-[#cc111f] transition-colors" />
            {!isCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">
                {item.name}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* --- PROFILE SECTION --- */}
      <div className={cn(
        "px-4 py-4 border-t border-zinc-800/50 bg-zinc-900/20",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#cc111f]/10 border border-[#cc111f]/20 flex items-center justify-center flex-shrink-0 text-[#cc111f]">
            <UserCircleIcon className="w-6 h-6" />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white text-[11px] font-bold truncate tracking-tight uppercase">
                {admin?.name || 'Admin'}
              </span>
              <span className="text-zinc-500 text-[9px] truncate tracking-wide">
                {admin?.email || 'rplay@portal.com'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-3 p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all m-4 mt-2",
          isCollapsed ? "justify-center" : ""
        )}
      >
        <ArrowLeftOnRectangleIcon className="w-6 h-6 min-w-[24px]" />
        {!isCollapsed && <span className="font-bold uppercase text-[10px] tracking-widest">Logout</span>}
      </button>
    </aside>
  );
};