"use client";

import { useState } from 'react';
import { Sidebar } from "@/components/dashboard/SidebarAdmin";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar - Kita kirimkan state ke dalam Sidebar agar bisa toggle */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Wrapper */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out p-3 h-screen",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Konten Melengkung (Stacked Look) */}
        <div className="bg-[#121212] w-full h-full rounded-[40px] border border-zinc-800 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}