"use client";

import { TopBar } from "@/components/dashboard/TopBarAdmin";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Kita tidak lagi butuh state isCollapsed karena TopBar melintang penuh
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* 1. TOP BAR (FIXED) */}
      <TopBar />

      {/* 2. MAIN CONTENT AREA */}
      <main 
        className={cn(
          "flex-1 p-4 pt-24 h-screen flex flex-col" 
          // pt-24 adalah jarak agar konten tidak tertutup TopBar (h-20)
        )}
      >
        {/* Container Konten Melengkung (Stacked Look) */}
        <div className="flex-1 bg-[#121212] w-full rounded-[40px] border border-zinc-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
          
          {/* Area Scrollable untuk Page Content */}
          <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar">
            {/* Konten halaman (children) akan muncul di sini. 
               Margin bawah ditambahkan agar tidak mentok ke lengkungan bawah.
            */}
            <div className="pb-10">
              {children}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}