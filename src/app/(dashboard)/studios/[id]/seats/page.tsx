"use client";

import { useState, useEffect } from 'react';
import { anton } from '@/lib/fonts';
import { 
  ChevronLeftIcon, 
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Untuk ambil ID dari URL
import { api } from '@/lib/api';

interface Seat {
  seat_id: string;
  row_name: string;
  seat_number: string;
  pos_x: number;
  pos_y: number;
}

export default function SeatConfigPage() {
  const params = useParams();
  const studioId = Number(params.id); // Mengambil ID dari folder [id]

  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Generate Visual Grid (Hanya untuk preview di frontend)
  useEffect(() => {
    const newSeats: Seat[] = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    
    // Batasi baris maksimal 26 sesuai spek backend (A-Z)
    const safeRows = Math.min(rows, 26);
    
    for (let r = 0; r < safeRows; r++) {
      for (let c = 1; c <= cols; c++) {
        newSeats.push({
          seat_id: `${alphabet[r]}${c}`,
          row_name: alphabet[r],
          seat_number: c.toString(),
          pos_x: c,
          pos_y: r + 1
        });
      }
    }
    setSeats(newSeats);
    setIsSaved(false); 
  }, [rows, cols]);

  // --- FUNGSI SIMPAN KE BACKEND ---
  const handleSaveLayout = async () => {
    if (!studioId) return alert("Studio ID tidak ditemukan!");
    
    setIsSaving(true);
    try {
      // Memanggil endpoint backend: .post("/seats/generate", ...)
      const { data, error } = await api.api.studios.seats.generate.post({
        studio_id: studioId,
        row_count: rows,
        seats_per_row: cols
      });

      if (error) {
        // Tangani error jika input melampaui batas (min 1, max 26)
        throw new Error(error.value?.details || "Gagal menyimpan layout");
      }

      setIsSaved(true);
      alert(data?.message || "Layout kursi berhasil disimpan ke database!");

      // Reset status sukses setelah 3 detik
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-montserrat pb-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/studios" className="text-[#cc111f] text-[10px] font-bold flex items-center gap-1 mb-2 hover:tracking-widest transition-all">
            <ChevronLeftIcon className="w-3 h-3" /> BACK TO STUDIOS
          </Link>
          <h1 className={`${anton.className} text-4xl uppercase tracking-tighter italic text-white`}>
            Seat Designer
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
            Configure layout for Studio ID: <span className="text-white">#{studioId}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 backdrop-blur-md">
          <div className="px-3">
            <label className="block text-[8px] text-zinc-500 uppercase font-bold tracking-tighter">Rows (A-Z)</label>
            <input 
                type="number" 
                max="26" 
                min="1"
                value={rows} 
                onChange={(e) => setRows(Math.max(1, Number(e.target.value)))} 
                className="bg-transparent text-white font-black w-10 outline-none text-sm" 
            />
          </div>
          <div className="h-8 w-[1px] bg-zinc-800"></div>
          <div className="px-3">
            <label className="block text-[8px] text-zinc-500 uppercase font-bold tracking-tighter">Cols (1-20)</label>
            <input 
                type="number" 
                min="1"
                value={cols} 
                onChange={(e) => setCols(Math.max(1, Number(e.target.value)))} 
                className="bg-transparent text-white font-black w-10 outline-none text-sm" 
            />
          </div>

          <Button 
            onClick={handleSaveLayout}
            disabled={isSaving}
            className={`py-3 px-8 text-[10px] font-black tracking-widest flex items-center gap-2 transition-all rounded-xl ${isSaved ? 'bg-green-600 hover:bg-green-600' : 'bg-white text-black hover:bg-[#cc111f] hover:text-white'}`}
          >
            {isSaving ? (
              <> <ArrowPathIcon className="w-3 h-3 animate-spin" /> GENERATING... </>
            ) : isSaved ? (
              <> <CheckIcon className="w-3 h-3" /> SUCCESS! </>
            ) : (
              'GENERATE & SAVE'
            )}
          </Button>
        </div>
      </div>

      {/* Screen Area Preview */}
      <div className="relative pt-10 pb-10 max-w-4xl mx-auto">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#cc111f] to-transparent opacity-50 mb-2"></div>
        <div className="w-full h-12 bg-gradient-to-b from-[#cc111f]/20 to-transparent rounded-t-full blur-xl absolute top-6"></div>
        <p className="text-center text-zinc-600 text-[9px] uppercase tracking-[1em] font-bold">Cinema Screen</p>
      </div>

      {/* Tampilan Grid Kursi */}
      <div className="flex justify-center overflow-x-auto pb-12 custom-scrollbar">
        <div 
          className="grid gap-3 p-6 bg-zinc-950/30 rounded-[2rem] border border-zinc-900"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {seats.map((seat) => (
            <div 
              key={seat.seat_id}
              className="group relative w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center transition-all hover:border-[#cc111f] hover:bg-[#cc111f] shadow-lg hover:shadow-[#cc111f]/20"
            >
              <span className="text-[9px] font-black text-zinc-700 group-hover:text-white transition-colors">
                {seat.seat_id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Stats */}
      <div className="max-w-xs mx-auto bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 p-6 rounded-[2rem] text-center space-y-1">
        <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.2em]">Capacity Estimate</p>
        <p className="text-white text-4xl font-black italic">{seats.length}</p>
        <p className="text-zinc-600 text-[8px] uppercase tracking-widest">Seats will be saved to Studio #{studioId}</p>
      </div>
    </div>
  );
}