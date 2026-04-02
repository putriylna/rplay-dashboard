"use client";

import { useState, useEffect, useCallback } from 'react';
import { anton } from '@/lib/fonts';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PlusIcon, 
  XMarkIcon, 
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

// --- Types ---
interface City {
  cityId: number;
  cityName: string;
}

interface Cinema {
  cinemaId: number;
  namaBioskop: string; 
  alamat: string;
  mapUrl: string;      
  city?: City;
  cityId: number;      
}

export default function CinemasPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_bioskop: "",
    city_id: "",
    alamat: "",
    map_url: ""
  });

  const fetchData = useCallback(async () => {
    try {
      const { data: resCities } = await api.api.cities.get();
      const { data: resCinemas } = await api.api.cinemas.get();
      
      if (resCities) setCities(resCities as City[]);
      if (resCinemas) setCinemas(resCinemas as unknown as Cinema[]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      // Delay sedikit agar skeleton terasa smooth
      setTimeout(() => setInitialLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCinemas = cinemas.filter(c => 
    c.namaBioskop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.cityName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditOpen = (cinema: Cinema) => {
    setEditId(cinema.cinemaId);
    setFormData({
      nama_bioskop: cinema.namaBioskop || "",
      city_id: (cinema.cityId || cinema.city?.cityId || "").toString(),
      alamat: cinema.alamat || "",
      map_url: cinema.mapUrl || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const { nama_bioskop, city_id, alamat, map_url } = formData;
    if (!nama_bioskop || !city_id || !alamat) return alert("Mohon isi semua field wajib");

    setLoading(true);
    try {
      const payload = { nama_bioskop, city_id: Number(city_id), alamat, map_url: map_url || "" };
      let result;
      if (editId) result = await (api.api.cinemas as any)[Number(editId)].put(payload);
      else result = await api.api.cinemas.post(payload);

      if (result.error) throw new Error("Gagal menyimpan");
      
      handleCloseModal();
      await fetchData(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus bioskop ini secara permanen?")) return;
    try {
      const { error } = await (api.api.cinemas as any)[Number(id)].delete();
      if (error) throw new Error("Gagal menghapus");
      await fetchData(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama_bioskop: "", city_id: "", alamat: "", map_url: "" });
  };

  // --- Skeleton Component ---
  const SkeletonCard = () => (
    <div className="bg-[#0f0f0f] border border-zinc-900 rounded-[2rem] p-6 animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-zinc-800 rounded-2xl"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg"></div>
          <div className="w-8 h-8 bg-zinc-800 rounded-lg"></div>
        </div>
      </div>
      <div className="h-3 w-16 bg-zinc-800 rounded-full mb-3"></div>
      <div className="h-6 w-3/4 bg-zinc-800 rounded-lg mb-6"></div>
      <div className="h-16 w-full bg-zinc-800/50 rounded-2xl"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      {/* --- Header Section --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className={`${anton.className} text-5xl text-white italic tracking-tight`}>
            Theater Cinemas
          </h1>
          <p className="text-zinc-500 text-sm font-medium italic">
            Kelola lokasi dan alamat operasional bioskop RPlay Cinema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
            <input
              type="text"
              placeholder="Cari lokasi bioskop..."
              className="admin-input-modern !pl-12 h-[52px] w-full text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-[#cc111f] hover:text-white flex items-center justify-center gap-2 px-8 h-[52px] rounded-2xl transition-all shadow-xl active:scale-95 text-black font-bold text-xs"
          >
            <PlusIcon className="w-4 h-4 stroke-[3px]" />
            Add New Cinema
          </button>
        </div>
      </div>

      {/* --- Grid Content --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialLoading ? (
          Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredCinemas.length > 0 ? (
          filteredCinemas.map((c) => (
            <div key={c.cinemaId} className="group bg-[#0f0f0f] border border-zinc-900 rounded-[2rem] p-7 hover:border-[#cc111f]/30 hover:bg-[#121212] transition-all duration-300 flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-[#cc111f]/10 group-hover:border-[#cc111f]/20 transition-all">
                    <BuildingOfficeIcon className="w-6 h-6 text-[#cc111f]" />
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditOpen(c)} className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.cinemaId)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {c.city?.cityName || 'Unknown City'}
                  </span>
                  <h3 className="text-zinc-100 text-2xl font-bold italic tracking-tight leading-tight">
                    {c.namaBioskop}
                  </h3>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-900/50 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-4 h-4 text-zinc-700 mt-0.5" />
                  <p className="text-zinc-500 text-[12px] font-medium leading-relaxed italic">
                    {c.alamat}
                  </p>
                </div>
                
                {c.mapUrl && (
                  <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest group/link">
                    <LinkIcon className="w-3 h-3 group-hover:scale-110 transition-transform" /> View in Maps
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 border-2 border-dashed border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
              <BuildingOfficeIcon className="w-12 h-12 mb-4 text-zinc-500" />
              <p className="text-xs font-bold italic">No cinemas found in this location</p>
          </div>
        )}
      </div>

      {/* --- Modal Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2.5rem] border border-zinc-800 shadow-2xl relative modal-scale-animation flex flex-col">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className={`${anton.className} text-3xl text-white italic tracking-tight`}>
                {editId ? 'Update Cinema' : 'New Cinema'}
              </h2>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Cinema Name</label>
                <input 
                  required type="text" className="admin-input-modern" placeholder="e.g. RPlay Cinema XXI" 
                  value={formData.nama_bioskop}
                  onChange={(e) => setFormData({...formData, nama_bioskop: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Location City</label>
                <select 
                  required className="admin-input-modern cursor-pointer appearance-none"
                  value={formData.city_id}
                  onChange={(e) => setFormData({...formData, city_id: e.target.value})}
                >
                  <option value="" className="bg-zinc-900">Select City...</option>
                  {cities.map(city => <option key={city.cityId} value={city.cityId} className="bg-zinc-900">{city.cityName}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Full Address</label>
                <textarea 
                  required className="admin-input-modern h-28 resize-none py-3" placeholder="Jl. Raya Theater No. 1..." 
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1 text-zinc-600">Maps URL (Google Maps)</label>
                <input 
                  type="url" className="admin-input-modern" placeholder="https://maps.google.com/..." 
                  value={formData.map_url}
                  onChange={(e) => setFormData({...formData, map_url: e.target.value})}
                />
              </div>

              <button 
                disabled={loading} type="submit" 
                className="w-full bg-white text-black hover:bg-[#cc111f] hover:text-white h-[56px] rounded-2xl font-black text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                {loading ? "SAVING..." : (editId ? "CONFIRM UPDATE" : "CREATE CINEMA")}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-input-modern {
          width: 100%;
          background: #121212;
          border: 1px solid #1f1f23;
          border-radius: 1rem;
          padding: 0.9rem 1.25rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #000;
          box-shadow: 0 0 0 4px rgba(204, 17, 31, 0.1);
        }
        .modal-scale-animation {
          animation: modal-zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modal-zoom {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}