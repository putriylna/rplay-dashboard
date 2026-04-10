"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { anton } from '@/lib/fonts';
import { 
  ChevronLeftIcon, 
  ArrowPathIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  TicketIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';

export default function SeatConfigPage() {
  const params = useParams();
  const id = params?.id;
  const studioId = id ? Number(id) : null;

  // Management State
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);
  const [disabledSeats, setDisabledSeats] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStudioType, setCurrentStudioType] = useState<string>("");

  const [allStudios, setAllStudios] = useState<any[]>([]);
  const [selectedStudioIds, setSelectedStudioIds] = useState<number[]>([]);

  const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);

  // KONFIGURASI BATAS KURSI
  const SEAT_LIMITS: Record<string, number> = {
    Reguler: 200,
    Premiere: 50,
    IMAX: 300,
  };

  const currentLimit = SEAT_LIMITS[currentStudioType] || 200;
  // Kursi aktif = Total kotak - jumlah yang di-disable (dihapus)
  const activeTotal = (rows * cols) - disabledSeats.size;
  const isOverLimit = activeTotal > currentLimit;

  useEffect(() => {
    const initData = async () => {
      if (!studioId) return;
      try {
        setIsLoading(true);
        const [{ data: seatData }, { data: studiosList }] = await Promise.all([
          api.api.studios[studioId].seats.get(),
          api.api.studios.get()
        ]);

        const currentStudio = studiosList?.find((s: any) => s.studioId === studioId);
        if (currentStudio) {
          setCurrentStudioType(currentStudio.type);
          const filteredStudios = studiosList.filter((s: any) => s.type === currentStudio.type);
          setAllStudios(filteredStudios);
        }

        if (seatData && seatData.length > 0) {
          const rowChars = seatData.map((s: any) => s.rowName);
          const colNums = seatData.map((s: any) => Number(s.seatNumber));
          const maxRowIndex = Math.max(...rowChars.map((char: string) => alphabet.indexOf(char)));
          const maxCol = Math.max(...colNums);

          setRows(maxRowIndex + 1);
          setCols(maxCol);
          
          // Sinkronisasi: Tandai kursi yang tidak ada di DB sebagai disabled di UI
          // (Karena DB hanya menyimpan kursi yang aktif)
          const dbSeatNames = new Set(seatData.map((s: any) => `${s.rowName}${s.seatNumber}`));
          const initialDisabled = new Set<string>();
          
          for (let r = 0; r <= maxRowIndex; r++) {
            for (let c = 1; c <= maxCol; c++) {
              const name = `${alphabet[r]}${c}`;
              if (!dbSeatNames.has(name)) initialDisabled.add(name);
            }
          }
          setDisabledSeats(initialDisabled);
        }
        setSelectedStudioIds([studioId]);
      } catch (err) {
        toast.error("Gagal sinkronisasi arsitektur");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [studioId, alphabet]);

  const handleSaveLayout = async () => {
    if (isOverLimit) return toast.error(`Kapasitas ${currentStudioType} maksimal ${currentLimit} kursi!`);
    if (selectedStudioIds.length === 0) return toast.error("Pilih minimal satu studio");
    
    setIsSaving(true);

    // Filter hanya kursi yang TIDAK di-disable
    const activeSeatsPayload = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const seatId = `${alphabet[r]}${c}`;
        if (!disabledSeats.has(seatId)) {
          activeSeatsPayload.push({
            rowName: alphabet[r],
            seatNumber: c.toString()
          });
        }
      }
    }

    const promises = selectedStudioIds.map(sid => 
      api.api.studios.seats.generate.post({
        studio_id: sid,
        seats: activeSeatsPayload // Mengirim array kursi aktif saja
      })
    );

    toast.promise(Promise.all(promises), {
      loading: `Menyinkronkan ${selectedStudioIds.length} Studio...`,
      success: () => {
        setIsSaving(false);
        return `Arsitektur ${currentStudioType} berhasil diterapkan dengan ${activeTotal} kursi!`;
      },
      error: () => {
        setIsSaving(false);
        return "Gagal memperbarui arsitektur.";
      }
    });
  };

  const toggleSeat = (id: string) => {
    setDisabledSeats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
      <ArrowPathIcon className="w-10 h-10 text-[#cc111f] animate-spin" />
      <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] animate-pulse">GENERATING BLUEPRINT...</p>
    </div>
  );

  return (
    <div className="min-h-screen font-montserrat pb-24 px-6 max-w-7xl mx-auto text-zinc-300">
      <Toaster position="top-center" richColors theme="dark" />
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 py-10 border-b border-zinc-800/40 mb-10">
        <div className="space-y-1">
          <Link href="/studios" className="text-zinc-500 text-[10px] font-bold flex items-center gap-1.5 mb-4 hover:text-[#cc111f] transition-all group uppercase tracking-widest">
            <ChevronLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
            Back to Studios
          </Link>
          <h1 className={`${anton.className} text-5xl tracking-tight italic text-white leading-none`}>
            Master <span className="text-[#cc111f]">Architecture</span>
          </h1>
          <div className="flex items-center gap-2 pt-2">
            <TicketIcon className="w-4 h-4 text-zinc-600" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Template: <span className="text-white">{currentStudioType}</span>
            </span>
          </div>
        </div>
        
        <div className={`flex items-center gap-4 bg-zinc-900/40 p-3 rounded-2xl border ${isOverLimit ? 'border-red-500/50' : 'border-zinc-700/30'} shadow-2xl backdrop-blur-xl transition-colors`}>
          <div className="flex items-center gap-6 px-4 border-r border-zinc-800/60">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold mb-1 uppercase text-center">Rows</span>
              <input type="number" min="1" max="26" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="bg-zinc-800/50 text-white font-black w-12 h-9 rounded-lg text-center outline-none border border-zinc-700/50 focus:border-[#cc111f] transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold mb-1 uppercase text-center">Cols</span>
              <input type="number" min="1" max="30" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="bg-zinc-800/50 text-white font-black w-12 h-9 rounded-lg text-center outline-none border border-zinc-700/50 focus:border-[#cc111f] transition-colors" />
            </div>
          </div>

          <Button 
            onClick={handleSaveLayout} 
            disabled={isSaving || isOverLimit} 
            className={`${isOverLimit ? 'bg-zinc-800 cursor-not-allowed opacity-50' : 'bg-[#cc111f] hover:bg-white hover:text-black'} text-white py-3 px-8 rounded-xl flex items-center gap-3 transition-all active:scale-95 shadow-lg`}
          >
            {isSaving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CloudArrowUpIcon className="w-5 h-5 stroke-[2.5]" />}
            <span className="font-bold text-sm uppercase tracking-widest">Deploy Architecture</span>
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR STATS */}
        <div className="lg:col-span-3 space-y-4">
          {isOverLimit && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-[10px] font-bold text-red-200 uppercase leading-relaxed">
                Kapasitas melebihi batas {currentStudioType} ({currentLimit} Kursi). Matikan beberapa kursi atau kurangi dimensi!
              </p>
            </div>
          )}

          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-6">
                <Squares2X2Icon className="w-4 h-4 text-[#cc111f]" />
                <h3 className="text-[10px] font-black text-white tracking-widest uppercase">Target Studios</h3>
             </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {allStudios.map((s) => (
                <div key={s.studioId} className="flex items-center justify-between p-4 rounded-2xl border bg-zinc-900/40 border-zinc-800/60 text-zinc-400">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase italic">{s.namaStudio}</span>
                    <span className="text-[8px] opacity-40 font-bold">{s.cinema?.namaBioskop}</span>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-[#cc111f]" />
                </div>
              ))}
            </div>
          </div>
          
          <div className={`bg-gradient-to-br ${isOverLimit ? 'from-red-900/40 to-black border-red-500' : 'from-zinc-900/80 to-black border-zinc-800'} border p-8 rounded-[2.5rem] shadow-2xl transition-colors`}>
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mb-2 uppercase italic">Active Capacity</p>
            <div className={`text-6xl font-black italic ${isOverLimit ? 'text-red-500' : 'text-white'}`}>
              {activeTotal}
              <span className="text-lg text-[#cc111f] not-italic ml-2">/ {currentLimit}</span>
            </div>
          </div>
        </div>

        {/* BLUEPRINT CANVAS */}
        <div className="lg:col-span-9 bg-zinc-950 rounded-[4rem] p-16 border border-zinc-800/40 relative overflow-hidden">
          {/* SCREEN VISUAL */}
          <div className="w-full max-w-2xl mx-auto mb-20 text-center relative">
            <div className="w-full h-[6px] bg-zinc-900 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#cc111f] to-transparent animate-pulse shadow-[0_0_20px_rgba(204,17,31,0.5)]"></div>
            </div>
            <p className="text-[9px] text-zinc-700 font-black tracking-[0.4em] mt-4 uppercase">Cinema Screen</p>
          </div>

          {/* GRID ENGINE */}
          <div className="w-full overflow-x-auto pb-10 custom-scrollbar flex justify-center">
            <div 
              className="grid gap-3 p-4" 
              style={{ 
                gridTemplateColumns: `40px repeat(${cols}, 40px)`,
                width: 'fit-content' 
              }}
            >
              {Array.from({ length: rows }).map((_, r) => (
                <React.Fragment key={`row-${r}`}>
                  <div className="flex items-center justify-center font-black text-zinc-800 text-sm italic pr-2">{alphabet[r]}</div>
                  {Array.from({ length: cols }).map((_, c) => {
                    const seatId = `${alphabet[r]}${c + 1}`;
                    const isDisabled = disabledSeats.has(seatId);
                    return (
                      <button 
                        key={seatId} 
                        onClick={() => toggleSeat(seatId)}
                        title={seatId}
                        className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                          isDisabled 
                          ? 'bg-transparent border-dashed border-zinc-900 opacity-20 hover:opacity-100 hover:border-zinc-700' 
                          : 'bg-zinc-900 border-zinc-800 hover:border-[#cc111f] shadow-lg shadow-black/50'
                        }`}
                      >
                        {!isDisabled && (
                          <span className="text-[10px] font-black text-zinc-600 group-hover:text-white transition-colors">
                            {c + 1}
                          </span>
                        )}
                        {isDisabled && <div className="w-1 h-1 bg-zinc-800 rounded-full" />}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}