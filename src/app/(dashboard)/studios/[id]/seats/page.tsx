"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { anton } from '@/lib/fonts';
import { 
  ChevronLeftIcon, 
  ArrowPathIcon,
  TrashIcon,
  SquaresPlusIcon,
  InformationCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';

export default function SeatConfigPage() {
  const params = useParams();
  const studioId = Number(params.id);

  // Management State
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);
  const [disabledSeats, setDisabledSeats] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);

  /**
   * 1. LOAD EXISTING DATA (Penting agar perubahan tidak hilang)
   */
  useEffect(() => {
    const fetchExistingSeats = async () => {
      if (!studioId) return;
      try {
        setIsLoading(true);
        // Sesuaikan endpoint ini dengan backend Anda (misal: get seats by studioId)
        const { data, error } = await api.api.studios[studioId].seats.get();
        
        if (data && data.length > 0) {
          // Logika sederhana untuk mendeteksi max rows & cols dari data yang ada
          const rowChars = data.map((s: any) => s.rowName);
          const colNums = data.map((s: any) => Number(s.seatNumber));
          
          const maxRowIndex = Math.max(...rowChars.map((char: string) => alphabet.indexOf(char)));
          const maxCol = Math.max(...colNums);

          setRows(maxRowIndex + 1);
          setCols(maxCol);
          
          // Jika ada status "INACTIVE" di DB, masukkan ke disabledSeats
          const inactive = new Set<string>(
            data.filter((s: any) => s.status === 'INACTIVE').map((s: any) => `${s.rowName}${s.seatNumber}`)
          );
          setDisabledSeats(inactive);
        }
      } catch (err) {
        console.error("Gagal mengambil data kursi:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingSeats();
  }, [studioId, alphabet]);

  const toggleSeat = (id: string) => {
    setDisabledSeats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReset = () => {
    if(confirm("Reset semua pengaturan baris dan kolom?")) {
      setDisabledSeats(new Set());
      toast.info("Layout direset ke tampilan standar");
    }
  };

  /**
   * 2. SAVE DATA (Admin Action)
   */
  const handleSaveLayout = async () => {
    if (!studioId) return toast.error("ID Studio tidak ditemukan");
    
    setIsSaving(true);
    
    // Pastikan backend Anda menerima data 'disabledSeats' 
    // agar admin bisa benar-benar mengatur lorong jalan
    const savePromise = api.api.studios.seats.generate.post({
      studio_id: studioId,
      row_count: rows,
      seats_per_row: cols,
      inactive_seats: Array.from(disabledSeats) // Kirim data lorong ke backend
    });

    toast.promise(savePromise, {
      loading: 'Menyimpan konfigurasi permanen...',
      success: () => {
        setIsSaving(false);
        return "Konfigurasi Studio berhasil diperbarui.";
      },
      error: (err: any) => {
        setIsSaving(false);
        return err.message || "Gagal memperbarui database.";
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <ArrowPathIcon className="w-8 h-8 text-[#cc111f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-montserrat pb-24 px-6 max-w-7xl mx-auto text-zinc-300">
      <Toaster position="top-center" richColors theme="dark" />
      
      {/* Admin Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 py-10 border-b border-zinc-800/40 mb-10">
        <div className="space-y-1">
          <Link href="/studios" className="text-zinc-500 text-[10px] font-bold flex items-center gap-1.5 mb-4 hover:text-[#cc111f] transition-all group uppercase tracking-widest">
            <ChevronLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
            Admin Management
          </Link>
          <h1 className={`${anton.className} text-4xl tracking-tight italic text-white leading-none`}>
            Studio <span className="text-[#cc111f]">Architecture</span>
          </h1>
          <p className="text-zinc-500 text-xs font-medium">
            Pengaturan Struktur Kursi & Lorong Studio <span className="text-zinc-100 px-2 py-0.5 bg-zinc-800 rounded ml-1">#{studioId}</span>
          </p>
        </div>
        
        {/* Editor Controls */}
        <div className="flex items-center gap-4 bg-zinc-900/80 p-3 rounded-2xl border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-6 px-4 border-r border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold tracking-wider mb-1">JUMLAH BARIS</span>
              <input 
                type="number" max="26" min="1"
                value={rows} 
                onChange={(e) => setRows(Math.min(26, Math.max(1, Number(e.target.value))))} 
                className="bg-zinc-800/50 text-white font-black w-12 h-8 rounded text-center outline-none focus:ring-1 focus:ring-[#cc111f] transition-all" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold tracking-wider mb-1">KURSI PER BARIS</span>
              <input 
                type="number" min="1" max="24"
                value={cols} 
                onChange={(e) => setCols(Math.min(24, Math.max(1, Number(e.target.value))))} 
                className="bg-zinc-800/50 text-white font-black w-12 h-8 rounded text-center outline-none focus:ring-1 focus:ring-[#cc111f] transition-all" 
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="p-3 rounded-xl bg-zinc-800 hover:bg-red-950/30 hover:border-red-900 transition-all text-zinc-400 hover:text-red-500 border border-zinc-700"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <Button 
              onClick={handleSaveLayout}
              disabled={isSaving}
              className="py-3 px-8 text-[11px] font-bold tracking-widest flex items-center gap-3 rounded-xl transition-all shadow-xl bg-[#cc111f] text-white hover:bg-red-700 border-none"
            >
              {isSaving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CloudArrowUpIcon className="w-5 h-5" />}
              Publish Layout
            </Button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Statistics & Legend */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-[2rem]">
            <h3 className="text-[10px] font-bold text-zinc-400 mb-6 flex items-center gap-2 tracking-[0.2em] uppercase">
              Legend Editor
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#cc111f] rounded-md shadow-[0_0_10px_rgba(204,17,31,0.3)]"></div>
                  <span className="text-[11px] font-bold">Kursi Aktif</span>
                </div>
                <span className="text-[10px] text-zinc-500">Dijual</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-zinc-950 border border-zinc-700 rounded-md"></div>
                  <span className="text-[11px] font-bold text-zinc-500">Area Kosong</span>
                </div>
                <span className="text-[10px] text-zinc-500">Lorong</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-[2rem] text-center shadow-inner border-dashed">
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest mb-2 uppercase">Kapasitas Produksi</p>
            <div className="text-6xl font-black italic text-white">
              { (rows * cols) - disabledSeats.size }
            </div>
            <p className="mt-2 text-zinc-600 text-[9px] font-bold">Total Physical Seats</p>
          </div>
        </div>

        {/* Blueprint Canvas */}
        <div className="lg:col-span-9 bg-zinc-950 rounded-[3.5rem] p-12 border border-zinc-800/50 shadow-2xl relative">
          
          {/* Visual Screen Reference */}
          <div className="w-full max-w-xl mx-auto mb-20 relative text-center">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#cc111f]/40 to-transparent"></div>
            <p className="text-zinc-700 text-[9px] font-black tracking-[1.5em] mt-4 uppercase">Front / Screen Side</p>
          </div>

          {/* Scrollable Blueprint */}
          <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
            <div 
              className="grid gap-2.5 mx-auto"
              style={{ 
                gridTemplateColumns: `40px repeat(${cols}, 36px)`,
                width: 'fit-content'
              }}
            >
              {Array.from({ length: rows }).map((_, r) => (
                <React.Fragment key={`row-${r}`}>
                  {/* Row Index */}
                  <div className="flex items-center justify-center font-black text-zinc-700 text-xs italic">
                    {alphabet[r]}
                  </div>
                  
                  {/* Seat Matrix */}
                  {Array.from({ length: cols }).map((_, c) => {
                    const seatId = `${alphabet[r]}${c + 1}`;
                    const isDisabled = disabledSeats.has(seatId);
                    return (
                      <button 
                        key={seatId}
                        onClick={() => toggleSeat(seatId)}
                        className={`
                          w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border
                          ${isDisabled 
                            ? 'bg-transparent border-zinc-800 hover:border-zinc-600' 
                            : 'bg-zinc-900 border-zinc-800 hover:border-[#cc111f] hover:z-10 shadow-lg'
                          }
                        `}
                      >
                        {!isDisabled && (
                          <span className="text-[9px] font-black text-zinc-500">
                            {c + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-800 font-bold text-[8px] tracking-[1em] uppercase">
             Studio Floor Blueprint
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cc111f; }
      `}</style>
    </div>
  );
}