"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { anton } from '@/lib/fonts';
import { 
  MapIcon, TrashIcon, PlusIcon, ArrowPathIcon, 
  MagnifyingGlassIcon, InboxIcon 
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

// --- SKELETON COMPONENT ---
const CitySkeleton = () => (
  <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-2xl flex justify-between items-center animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-zinc-800" />
      <div className="h-4 w-32 bg-zinc-800 rounded" />
    </div>
    <div className="w-8 h-8 rounded-lg bg-zinc-800" />
  </div>
);

interface City {
  cityId: number;
  cityName: string;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- 1. Ambil Data ---
  const fetchCities = useCallback(async () => {
    try {
      const { data, error } = await api.api.cities.get();
      if (error) throw new Error();
      if (data) setCities(data as City[]);
    } catch (err) {
      toast.error("Gagal mengambil data kota");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // --- 2. Filtering Logic ---
  const filteredCities = useMemo(() => {
    return cities.filter(city => 
      city.cityName.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.cityName.localeCompare(b.cityName));
  }, [cities, searchQuery]);

  // --- 3. Tambah Data ---
  const addCity = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newCityName.trim()) return toast.error("Nama kota tidak boleh kosong");
    
    setLoading(true);
    const loadToast = toast.loading("Menambahkan kota...");
    
    try {
      const { data, error } = await api.api.cities.post({
        city_name: newCityName
      });

      if (error) {
        const errorMsg = (error.value as any)?.error || "Gagal menambah kota";
        toast.error(errorMsg, { id: loadToast });
        return;
      }

      if (data) {
        toast.success(`Kota ${newCityName} ditambahkan`, { id: loadToast });
        setNewCityName("");
        fetchCities(); 
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Hapus Data (PERBAIKAN LOGIC & UI KONFIRMASI) ---
  const deleteCity = (id: number, name: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-[#111111] border border-white/5 p-6 rounded-3xl shadow-2xl flex flex-col items-center min-w-[320px]`}>
        <p className="text-white text-sm font-bold mb-6 text-center leading-relaxed">
          Apakah kamu ingin menghapus kota <br/>
          <span className="text-red-600">"{name}"</span> secara permanen?
        </p>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const delToast = toast.loading("Menghapus...");
              try {
                // Eksekusi API Delete
                const { error } = await (api.api.cities as any)[Number(id)].delete();
                if (error) throw new Error();
                
                // CRITICAL: Update state lokal supaya langsung hilang tanpa refresh!
                setCities((prev) => prev.filter(city => city.cityId !== id));
                
                toast.success("Kota berhasil dihapus", { id: delToast });
              } catch (err) {
                toast.error("Gagal menghapus kota", { id: delToast });
              }
            }}
            className="bg-[#cc111f] text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Hapus
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-[#222222] text-zinc-400 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Batal
          </button>
        </div>
      </div>
    ), { position: 'top-center', duration: 4000 });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-20">
      <Toaster />
      
      {/* 1. HEADER & STATISTICS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-8">
        <div className="space-y-1">
          <h1 className={`${anton.className} text-5xl text-white tracking-tight`}>
            OPERATIONAL <span className="text-[#cc111f]">CITIES</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Kelola {cities.length} lokasi jangkauan layanan RPlay Cinema secara real-time.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-2xl">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Cities</p>
            <p className="text-2xl font-black text-white">{cities.length}</p>
          </div>
        </div>
      </div>

      {/* 2. ACTION BAR (INPUT & SEARCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <form onSubmit={addCity} className="lg:col-span-7 bg-[#121212] border border-zinc-800/50 p-2 rounded-[22px] flex flex-col sm:flex-row gap-2 shadow-2xl">
          <div className="relative flex-1 group">
            <MapIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
            <input 
              type="text" 
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="Tambahkan kota operasional baru..." 
              className="w-full bg-transparent border-none text-white pl-12 pr-4 py-3 text-sm focus:ring-0 placeholder:text-zinc-700 font-medium"
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !newCityName.trim()}
            className="bg-[#cc111f] hover:bg-[#a80e19] disabled:opacity-50 text-white flex items-center justify-center gap-2 px-8 py-3 sm:py-0 rounded-xl transition-all active:scale-95 font-bold text-xs shadow-lg shadow-red-900/20"
          >
            {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <><PlusIcon className="w-4 h-4 stroke-[3px]" /> Add Location</>}
          </button>
        </form>

        <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-800/50 p-2 rounded-[22px] flex items-center shadow-xl">
           <div className="relative w-full group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kota..." 
              className="w-full bg-transparent border-none text-white pl-12 pr-4 py-3 text-sm focus:ring-0 placeholder:text-zinc-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. CITIES DISPLAY SECTION */}
      <div className="relative min-h-[400px]">
        {initialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CitySkeleton key={i} />)}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-900 rounded-[40px] bg-zinc-900/5">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <InboxIcon className="w-10 h-10 text-zinc-700" />
              </div>
              <p className="text-zinc-400 font-bold text-lg">Kota Tidak Ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((city, index) => (
              <div 
                key={city.cityId} 
                style={{ animationDelay: `${index * 50}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-2 bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-zinc-800/50 p-5 rounded-2xl flex justify-between items-center hover:border-[#cc111f]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-[#cc111f]/10 group-hover:border-[#cc111f]/30 transition-all duration-500">
                    <MapIcon className="w-6 h-6 text-zinc-600 group-hover:text-[#cc111f] transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-bold text-base tracking-tight group-hover:text-white transition-colors">
                      {city.cityName}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                      Active Node
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteCity(city.cityId, city.cityName)}
                  className="opacity-0 group-hover:opacity-100 p-2.5 bg-zinc-900 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-xl border border-zinc-800 hover:border-red-500/50 transition-all duration-300"
                >
                  <TrashIcon className="w-4 h-4 stroke-[2px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes enter {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes leave {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-20px); opacity: 0; }
        }
        .animate-enter { animation: enter 0.3s ease-out; }
        .animate-leave { animation: leave 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
}