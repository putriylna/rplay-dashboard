"use client";

import { useState, useEffect, useCallback } from 'react';
import { anton } from '@/lib/fonts';
import { MapIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// --- SKELETON COMPONENT ---
const CitySkeleton = () => (
  <div className="bg-[#0f0f0f] border border-zinc-900 p-5 rounded-2xl flex justify-between items-center animate-pulse">
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
  const [newCityName, setNewCityName] = useState("");
  const [loading, setLoading] = useState(true); // Default true untuk initial load

  // --- 1. Ambil Data ---
  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await api.api.cities.get();
      if (error) {
        console.error("Gagal mengambil data kota:", error);
        return;
      }
      if (data) setCities(data as City[]);
    } finally {
      // Delay sedikit agar skeleton terasa smooth
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // --- 2. Tambah Data ---
  const addCity = async () => {
    if (!newCityName.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await api.api.cities.post({
        city_name: newCityName
      });

      if (error) {
        alert(error.value?.error || "Gagal menambah kota");
        setLoading(false);
        return;
      }

      if (data) {
        setNewCityName("");
        fetchCities(); 
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
      setLoading(false);
    }
  };

  // --- 3. Hapus Data ---
  const deleteCity = async (id: number) => {
    if (!confirm("Hapus kota ini?")) return;
    
    // Optimistic Update
    setCities(cities.filter(c => c.cityId !== id));
    // Logika API delete bisa ditambahkan di sini
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-3xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`${anton.className} text-5xl text-white italic tracking-tight`}>
          Operational Cities
        </h1>
        <p className="text-zinc-500 text-sm font-medium italic">
          Kelola daftar kota operasional untuk layanan RPlay Cinema
        </p>
      </div>

      {/* Input Form Section */}
      <div className="bg-[#0a0a0a] border border-zinc-900 p-6 rounded-[1.5rem] shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input 
              type="text" 
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="Masukkan nama kota baru..." 
              className="admin-input-modern !pl-12 !py-3.5 text-sm font-medium"
              disabled={loading}
            />
          </div>
          <Button 
            onClick={addCity} 
            disabled={loading}
            className="bg-white hover:bg-[#cc111f] hover:text-white flex items-center justify-center gap-2 px-6 h-[48px] rounded-xl transition-all shadow-xl active:scale-95 !text-black font-bold text-xs"
          >
            {loading ? "Processing..." : (
              <>
                <PlusIcon className="w-4 h-4 stroke-[3px] " />
                Add City
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          // Render 4 skeleton items saat loading
          Array.from({ length: 4 }).map((_, i) => <CitySkeleton key={i} />)
        ) : cities.length === 0 ? (
          <div className="col-span-full py-12 border-2 border-dashed border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
              <MapIcon className="w-10 h-10 mb-2 text-zinc-500" />
              <p className="text-xs font-bold italic uppercase tracking-widest">No Cities Data</p>
          </div>
        ) : (
          cities.map((city) => (
            <div 
              key={city.cityId} 
              className="bg-[#0f0f0f] border border-zinc-900 p-5 rounded-2xl flex justify-between items-center group hover:border-[#cc111f]/30 hover:bg-[#121212] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-[#cc111f]/10 group-hover:border-[#cc111f]/20 transition-all">
                  <MapIcon className="w-5 h-5 text-zinc-500 group-hover:text-[#cc111f]" />
                </div>
                <span className="text-zinc-200 font-bold text-sm tracking-wide">{city.cityName}</span>
              </div>
              
              <button 
                onClick={() => deleteCity(city.cityId)}
                className="text-zinc-700 hover:text-red-500 hover:bg-red-500/10 p-2.5 rounded-lg transition-all"
              >
                <TrashIcon className="w-4 h-4 stroke-[2px]" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Reusable Styles */}
      <style jsx global>{`
        .admin-input-modern {
          width: 100%;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 0.75rem;
          padding: 0.6rem 1rem;
          color: white;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #111;
          box-shadow: 0 0 0 2px rgba(204, 17, 31, 0.1);
        }
      `}</style>
    </div>
  );
}