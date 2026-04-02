"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { anton } from '@/lib/fonts';
import { 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrashIcon, 
  XMarkIcon,
  MapPinIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon, // Tambah icon search
  FunnelIcon           // Tambah icon filter
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { scheduleService } from '@/services/scheduleService';
import { movieService } from '@/services/movieService'; 
import { studioService } from '@/services/studioService'; 
import { Movie, Studio } from '@/types'; 
import { toast } from 'react-hot-toast';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]); 
  const [movies, setMovies] = useState<Movie[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // --- STATE BARU UNTUK FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [formData, setFormData] = useState({
    movie_id: '', 
    studio_id: '', 
    show_date: '', 
    show_time: '', 
    price: ''
  });

  // Ambil list kota unik dari data studio untuk dropdown filter
  const cities = useMemo(() => {
    const allCities = studios.map(st => st.cinema?.city?.cityName).filter(Boolean);
    return Array.from(new Set(allCities));
  }, [studios]);

  // --- LOGIKA FILTERING ---
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch = s.movie?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const matchesCity = selectedCity === "" || s.location?.city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [schedules, searchQuery, selectedCity]);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getAll(); 
      setSchedules(Array.isArray(data) ? data : data?.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil jadwal.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [movieData, studioData] = await Promise.all([
        movieService.getAll(),
        studioService.getAll()
      ]);
      setMovies(movieData || []);
      setStudios(studioData || []);
      fetchSchedules();
    } catch (err) {
      toast.error("Gagal memuat data pendukung");
    }
  }, [fetchSchedules]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ... (handleCloseModal, handleEditOpen, handleSubmit, handleDelete tetap sama)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({
      movie_id: '', studio_id: '', show_date: '', show_time: '', price: ''
    });
  };

  const handleEditOpen = (s: any) => {
    setEditId(s.schedule_id);
    setFormData({
      movie_id: s.movie?.id?.toString() || '', 
      studio_id: s.studio_id?.toString() || '', 
      show_date: s.play_at?.date || '',
      show_time: s.play_at?.time || '',
      price: s.price?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editId ? "Updating..." : "Publishing...");
    try {
      const payload = {
        movie_id: Number(formData.movie_id),
        studio_id: Number(formData.studio_id),
        show_date: formData.show_date,
        show_time: formData.show_time,
        price: Number(formData.price)
      };
      if (editId) {
        await scheduleService.update(editId, payload);
        toast.success("Berhasil diperbarui", { id: loadingToast });
      } else {
        await scheduleService.create(payload);
        toast.success("Berhasil dipublish!", { id: loadingToast });
      }
      handleCloseModal();
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await scheduleService.delete(id);
      toast.success("Jadwal dihapus");
      fetchSchedules();
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${anton.className} text-5xl uppercase italic tracking-tighter text-white`}>Schedules</h1>
          <p className="text-zinc-500 text-sm font-medium">Manajemen jam tayang secara real-time.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-bold transition-all rounded-xl shadow-lg uppercase tracking-widest px-8 h-12">
          <PlusIcon className="w-4 h-4 mr-2" /> Create Schedule
        </Button>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search movie title..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#cc111f] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#cc111f] outline-none appearance-none transition-all"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 rounded-3xl border border-dashed border-zinc-800">
              <p className="text-zinc-500 italic">No schedules found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((s) => {
                const sId = s.schedule_id;
                const mTitle = s.movie?.title || "Unknown Movie"; 
                const cinemaInfo = s.location?.cinema || "No Cinema";
                const studioInfo = s.location?.studio || "No Studio";
                const sDate = s.play_at?.date || "No Date";
                const sTime = s.play_at?.time || "No Time";
                const availSeats = s.available_seats || 0;

                return (
                  <div key={sId} className="bg-[#0f0f0f] border border-zinc-900 rounded-2xl overflow-hidden hover:border-[#cc111f]/30 transition-all flex flex-col">
                    <div className="p-6 border-b border-zinc-900 bg-zinc-900/20">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-bold text-xl italic truncate pr-4">{mTitle}</h3>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditOpen(s)} className="p-2 text-zinc-600 hover:text-white bg-zinc-800/50 rounded-lg transition-colors">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(sId)} className="p-2 text-zinc-600 hover:text-red-500 bg-red-500/5 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[#cc111f]">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-black tracking-widest">
                          {cinemaInfo} — {studioInfo} ({s.location?.city})
                        </span>
                      </div>
                    </div>
                    {/* ... (isi card tetap sama) */}
                    <div className="p-6 space-y-5 flex-1">
                      <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CalendarIcon className="w-4 h-4 text-[#cc111f]" />
                          <span className="text-xs font-bold">{sDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <ClockIcon className="w-4 h-4 text-[#cc111f]" />
                          <span className="text-xs font-bold">{sTime}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Price</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-zinc-400 text-[10px] font-bold">IDR</span>
                            <span className="text-white font-black text-2xl italic">
                              {s.price?.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${availSeats > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {availSeats} Seats Left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL & STYLE (tetap sama) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className={`${anton.className} text-3xl text-white italic uppercase`}>
                {editId ? 'Modify Schedule' : 'New Schedule'}
              </h2>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-500 mb-2 block">Movie</label>
                <select 
                  className="admin-input-modern" 
                  value={formData.movie_id}
                  onChange={e => setFormData({...formData, movie_id: e.target.value})}
                  required
                >
                  <option value="">Select a movie...</option>
                  {movies.map(m => (
                    <option key={m.movieId} value={m.movieId.toString()} className="bg-zinc-900">{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-zinc-500 mb-2 block">Studio</label>
                <select 
                  className="admin-input-modern"
                  value={formData.studio_id}
                  onChange={e => setFormData({...formData, studio_id: e.target.value})}
                  required
                >
                  <option value="">Select location...</option>
                  {studios.map(st => (
                    <option key={st.studioId} value={st.studioId.toString()} className="bg-zinc-900">
                      {st.cinema?.namaBioskop} - {st.namaStudio}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-bold">Date</label>
                  <input type="date" className="admin-input-modern" value={formData.show_date} onChange={e => setFormData({...formData, show_date: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-bold">Time</label>
                  <input type="time" className="admin-input-modern" value={formData.show_time} onChange={e => setFormData({...formData, show_time: e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-zinc-500 mb-2 block">Price (IDR)</label>
                <input type="number" placeholder="50000" className="admin-input-modern" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>

              <Button type="submit" className="w-full h-14 mt-4 bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-black uppercase rounded-2xl transition-all">
                {editId ? 'Update Schedule' : 'Publish Schedule'}
              </Button>
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
        }
        .admin-input-modern:focus { border-color: #cc111f; }
        select.admin-input-modern option { background: #0a0a0a; color: white; }
      `}</style>
    </div>
  );
}