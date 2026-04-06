"use client";

import { useState, useEffect, useCallback } from 'react';
import { anton } from '@/lib/fonts';
import { MapIcon, TrashIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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

  // --- 2. Tambah Data ---
  const addCity = async () => {
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
        toast.success("Kota berhasil ditambahkan", { id: loadToast });
        setNewCityName("");
        fetchCities(); 
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Hapus Data ---
  const deleteCity = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-zinc-900">Hapus kota ini dari daftar operasional?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const delToast = toast.loading("Menghapus...");
              try {
                const { error } = await (api.api.cities as any)[Number(id)].delete();
                if (error) throw new Error();
                
                toast.success("Kota berhasil dihapus", { id: delToast });
                fetchCities();
              } catch {
                toast.error("Gagal menghapus kota", { id: delToast });
              }
            }}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            Ya, Hapus
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold">
            Batal
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-3xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className={`${anton.className} text-4xl text-white tracking-tight`}>
          Operational <span className="text-[#cc111f]">Cities</span>
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          Kelola daftar kota operasional untuk layanan RPlay Cinema.
        </p>
      </div>

      {/* Input Form Section */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <MapIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
            <input 
              type="text" 
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="Masukkan nama kota baru..." 
              className="admin-input-v3 !pl-12 !py-3 text-sm font-medium"
              disabled={loading}
            />
          </div>
          <button 
            onClick={addCity} 
            disabled={loading}
            className="bg-white hover:bg-[#cc111f] hover:text-white flex items-center justify-center gap-2 px-8 h-[46px] rounded-xl transition-all active:scale-95 text-black font-bold text-xs shadow-lg shadow-black/20"
          >
            {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : (
              <>
                <PlusIcon className="w-4 h-4 stroke-[3px]" />
                Add City
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {initialLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CitySkeleton key={i} />)
        ) : cities.length === 0 ? (
          <div className="col-span-full py-20 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-600">
              <MapIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada data kota operasional.</p>
          </div>
        ) : (
          cities.map((city) => (
            <div 
              key={city.cityId} 
              className="group bg-zinc-900/20 border border-zinc-800/50 p-4 rounded-2xl flex justify-between items-center hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-[#cc111f]/30 transition-all">
                  <MapIcon className="w-5 h-5 text-[#cc111f]" />
                </div>
                <span className="text-zinc-200 font-bold text-sm tracking-tight">{city.cityName}</span>
              </div>
              
              <button 
                onClick={() => deleteCity(city.cityId)}
                className="p-2 bg-zinc-800/50 hover:bg-red-950 hover:text-red-500 text-zinc-500 rounded-lg transition-all"
              >
                <TrashIcon className="w-4 h-4 stroke-[2px]" />
              </button>
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        .admin-input-v3 {
          width: 100%;
          background: #09090b;
          border: 1px solid #1f1f23;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-v3:focus {
          border-color: #cc111f;
        }
      `}</style>
    </div>
  );
}