"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { anton } from "@/lib/fonts";
import {
  PlusIcon, CalendarIcon, XMarkIcon, MagnifyingGlassIcon,
  MapIcon, ClockIcon, ChevronDownIcon,
  TrashIcon, FilmIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { scheduleService } from "@/services/scheduleService";
import { movieService } from "@/services/movieService";
import { studioService } from "@/services/studioService";
import { Movie, Studio, Schedule } from "@/types";
import { toast } from "react-hot-toast";

// --- Types ---
interface ScheduleBatchItem {
  id: number;
  movie_id: string;
  movie_name: string;
  studio_id: string;
  studio_name: string;
  cinema_name: string;
  show_dates: string[];
  show_times: string[];
  price: string;
}

export default function SchedulesPage() {
  // Data States
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  
  // Form & Batch States
  const [movieSearch, setMovieSearch] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [scheduleBatch, setScheduleBatch] = useState<ScheduleBatchItem[]>([]);
  const [formData, setFormData] = useState({
    movie_id: "",
    studio_id: "",
    show_dates: [] as string[],
    show_times: [] as string[],
    price: ""
  });

  // --- Functions ---

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getAll();
      const rawData = Array.isArray(data) ? data : (data as any)?.data || [];
      // Filter jam dihapus agar data baru langsung tampil
      setSchedules(rawData);
    } catch (err) {
      toast.error("Gagal memuat jadwal");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    movieService.getAll().then(setMovies);
    studioService.getAll().then(setStudios);
    fetchSchedules();
  }, [fetchSchedules]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ movie_id: "", studio_id: "", show_dates: [], show_times: [], price: "" });
    setScheduleBatch([]);
    setTempTime("");
    setMovieSearch("");
  };

  // --- Logic Helpers ---

  const filteredMovies = useMemo(() => 
    movies.filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase())),
  [movies, movieSearch]);

  const groupedSchedules = useMemo(() => {
    const filtered = schedules.filter((s) => {
      const matchesSearch = s.movie?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = s.play_at?.date === activeDate;
      return matchesSearch && matchesDate;
    });

    const groups: Record<string, any> = {};
    filtered.forEach((s) => {
      const cinemaName = s.location?.cinema || "Unknown";
      if (!groups[cinemaName]) {
        groups[cinemaName] = { name: cinemaName, city: s.location?.city, schedules: [] };
      }
      groups[cinemaName].schedules.push(s);
    });
    return Object.values(groups);
  }, [schedules, searchQuery, activeDate]);

  // --- Handlers ---

  const addTime = () => {
    if (!tempTime) return;
    if (formData.show_times.includes(tempTime)) return toast.error("Jam sudah ada");
    setFormData(prev => ({ ...prev, show_times: [...prev.show_times, tempTime].sort() }));
    setTempTime("");
  };

  const addToBatch = () => {
    const { movie_id, studio_id, show_dates, show_times, price } = formData;
    if (!movie_id || !studio_id || show_dates.length === 0 || show_times.length === 0 || !price) {
      return toast.error("Lengkapi form sebelum menambah antrean");
    }

    const selectedMovie = movies.find(m => m.movieId.toString() === movie_id);
    const selectedStudio = studios.find(s => s.studioId.toString() === studio_id);

    const newItem: ScheduleBatchItem = {
      id: Date.now(),
      movie_id,
      movie_name: selectedMovie?.title || "",
      studio_id,
      studio_name: selectedStudio?.namaStudio || "",
      cinema_name: selectedStudio?.cinema?.namaBioskop || "",
      show_dates,
      show_times,
      price
    };

    setScheduleBatch(prev => [...prev, newItem]);
    // Reset form kecuali studio (biasanya input banyak film di studio yang sama)
    setFormData(prev => ({ ...prev, movie_id: "", show_dates: [], show_times: [], price: "" }));
    setMovieSearch("");
    toast.success("Ditambahkan ke antrean");
  };

  const handleSaveAll = async () => {
    if (scheduleBatch.length === 0 && !formData.movie_id) {
      return toast.error("Antrean kosong");
    }

    const loading = toast.loading("Menerbitkan semua jadwal...");
    try {
      // Gabungkan antrean dengan data yang sedang aktif di form jika ada
      const finalItems = [...scheduleBatch];
      if (formData.movie_id && formData.show_dates.length > 0) {
        finalItems.push({ id: 0, ...formData, movie_name: "", studio_name: "", cinema_name: "", cinema_id: "", movie_id: formData.movie_id, studio_id: formData.studio_id } as any);
      }

      await Promise.all(finalItems.map(item => 
        scheduleService.create({
          movie_id: Number(item.movie_id),
          studio_id: Number(item.studio_id),
          show_dates: item.show_dates,
          show_times: item.show_times,
          price: Number(item.price)
        })
      ));

      toast.success("Semua jadwal berhasil diterbitkan!", { id: loading });
      handleCloseModal();
      fetchSchedules();
    } catch (err) {
      toast.error("Gagal menyimpan jadwal", { id: loading });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto text-zinc-200 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className={`${anton.className} text-5xl uppercase italic leading-none`}>Schedules</h1>
          <p className="text-xs text-zinc-500 tracking-[0.3em] uppercase mt-2">Executive Management</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-2xl h-14 text-sm font-bold shadow-lg shadow-red-900/20 transition-all uppercase italic">
          <PlusIcon className="w-5 h-5 mr-2 stroke-[3]" /> Tambah Jadwal
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-zinc-500" />
          <input
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 h-14 text-sm focus:border-red-500 outline-none transition-all"
            placeholder="Cari film yang sudah tayang..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const d = new Date(); d.setDate(d.getDate() + i);
            const ds = d.toISOString().split("T")[0];
            const isActive = activeDate === ds;
            return (
              <button key={ds} onClick={() => setActiveDate(ds)} className={`flex flex-col items-center justify-center px-6 py-2 rounded-2xl border min-w-[100px] transition-all ${isActive ? "bg-red-600 border-red-600 shadow-lg shadow-red-900/30 scale-105" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
                <span className="text-[10px] font-black uppercase">{d.toLocaleDateString("id-ID", { weekday: "short" })}</span>
                <span className="text-xl font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST DATA */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-20 text-zinc-600 animate-pulse uppercase tracking-widest font-bold">Loading Schedules...</div>
        ) : groupedSchedules.map((group) => (
          <div key={group.name} className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden transition-all hover:bg-zinc-900/50">
            <div 
              onClick={() => setOpenGroups(p => p.includes(group.name) ? p.filter(n => n !== group.name) : [...p, group.name])}
              className="p-6 flex justify-between items-center cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/10 rounded-xl">
                  <MapIcon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <span className="font-black text-lg uppercase italic">{group.name}</span>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{group.city}</p>
                </div>
              </div>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-500 ${openGroups.includes(group.name) ? "rotate-180" : ""}`} />
            </div>

            {openGroups.includes(group.name) && (
              <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.schedules.map((s: any) => (
                  <div key={s.schedule_id} className="bg-black/50 p-5 rounded-[1.5rem] border border-zinc-800 group relative hover:border-red-600/50 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded font-bold text-zinc-400 uppercase tracking-tighter">{s.location.studio}</span>
                      <button 
                        onClick={() => scheduleService.delete(s.schedule_id).then(fetchSchedules)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold line-clamp-2 mb-4 italic uppercase leading-tight min-h-[2.5rem]">{s.movie?.title}</h4>
                    <div className="flex justify-between items-end border-t border-zinc-800 pt-3">
                      <span className={`${anton.className} text-3xl italic text-white`}>{s.play_at.time}</span>
                      <span className="text-[10px] text-red-500 font-black">Rp {s.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0a0a0a] w-full max-w-5xl rounded-[2.5rem] border border-zinc-800 shadow-2xl flex flex-col my-auto border-t-red-600/50 border-t-2">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className={`${anton.className} text-4xl italic uppercase tracking-tighter`}>Create Schedule Batch</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-zinc-900 rounded-full transition-all hover:rotate-90">
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT: SELECTION */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><FilmIcon className="w-4 h-4 text-red-500"/> Cari Film</label>
                  <input 
                    type="text" 
                    placeholder="Ketik judul film..." 
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:border-red-600 outline-none transition-all" 
                    value={movieSearch} 
                    onChange={(e) => setMovieSearch(e.target.value)} 
                  />
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredMovies.map(m => (
                      <button 
                        key={m.movieId} 
                        onClick={() => setFormData({...formData, movie_id: m.movieId.toString()})} 
                        className={`p-4 rounded-xl text-left border text-xs font-bold transition-all flex justify-between items-center ${formData.movie_id === m.movieId.toString() ? "bg-red-600 border-red-600 shadow-lg shadow-red-900/20" : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"}`}
                      >
                        {m.title}
                        {formData.movie_id === m.movieId.toString() && <PlusIcon className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><MapIcon className="w-4 h-4 text-red-500"/> Pilih Lokasi & Studio</label>
                  <select 
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:border-red-600 outline-none transition-all appearance-none" 
                    value={formData.studio_id} 
                    onChange={(e) => setFormData({...formData, studio_id: e.target.value})}
                  >
                    <option value="">Pilih Studio...</option>
                    {studios.map(st => (
                      <option key={st.studioId} value={st.studioId.toString()}>
                        {st.cinema?.namaBioskop} - {st.namaStudio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RIGHT: TIME & PRICE */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-red-500"/> Tanggal & Harga</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0,1,2,3,4,5,6,7].map(i => {
                      const d = new Date(); d.setDate(d.getDate() + i);
                      const ds = d.toISOString().split("T")[0];
                      const active = formData.show_dates.includes(ds);
                      return (
                        <button 
                          key={ds} 
                          onClick={() => setFormData(p => ({...p, show_dates: active ? p.show_dates.filter(x => x !== ds) : [...p.show_dates, ds]}))} 
                          className={`flex flex-col items-center py-3 rounded-xl border transition-all ${active ? "bg-white text-black font-bold scale-105" : "bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}
                        >
                          <span className="text-[8px] uppercase font-black">{d.toLocaleDateString("id-ID", {weekday: 'short'})}</span>
                          <span className="text-sm font-black">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                  <input 
                    type="number" 
                    placeholder="Harga Tiket (Rp)" 
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm mt-2 focus:border-red-600 outline-none transition-all" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><ClockIcon className="w-4 h-4 text-red-500"/> Jam Tayang</label>
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm [color-scheme:dark] outline-none focus:border-red-600 transition-all" 
                      value={tempTime} 
                      onChange={(e) => setTempTime(e.target.value)} 
                    />
                    <button onClick={addTime} className="bg-zinc-800 px-8 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-700 transition-all">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded-xl border border-zinc-900 min-h-[60px]">
                    {formData.show_times.length === 0 && <span className="text-zinc-700 text-[10px] uppercase font-bold italic py-2">Belum ada jam...</span>}
                    {formData.show_times.map(t => (
                      <span key={t} className="bg-red-600/10 text-red-500 px-3 py-2 rounded-lg text-[10px] font-black border border-red-600/20 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        {t} 
                        <button onClick={() => setFormData(p => ({...p, show_times: p.show_times.filter(x => x !== t)}))} className="hover:text-white">
                          <XMarkIcon className="w-3 h-3 stroke-[3]"/>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={addToBatch} 
                  className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:border-red-600/50 hover:text-red-500 hover:bg-red-600/5 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  + Tambahkan Ke Antrean Batch
                </button>
              </div>
            </div>

            {/* PREVIEW BATCH AREA */}
            {scheduleBatch.length > 0 && (
              <div className="px-8 pb-8">
                <div className="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-widest flex items-center gap-2">
                  <div className="h-[1px] flex-1 bg-zinc-900"></div>
                  Antrean Siap Terbit ({scheduleBatch.length})
                  <div className="h-[1px] flex-1 bg-zinc-900"></div>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                  {scheduleBatch.map(item => (
                    <div key={item.id} className="min-w-[240px] bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 relative group animate-in slide-in-from-right duration-500">
                      <button 
                        onClick={() => setScheduleBatch(p => p.filter(x => x.id !== item.id))} 
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                      >
                        <XMarkIcon className="w-4 h-4 stroke-[3]"/>
                      </button>
                      <p className="text-xs font-black truncate pr-4 italic uppercase text-white leading-none">{item.movie_name}</p>
                      <p className="text-[9px] text-zinc-500 mt-2 font-bold uppercase truncate">{item.cinema_name} - {item.studio_name}</p>
                      <div className="flex gap-2 mt-3">
                         <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{item.show_dates.length} Hari</span>
                         <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{item.show_times.length} Sesi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-8 border-t border-zinc-900 bg-black/40 flex justify-end items-center gap-6">
              <span className="text-zinc-600 text-[10px] font-bold uppercase italic tracking-tighter">Pastikan semua data benar sebelum publish</span>
              <Button 
                onClick={handleSaveAll} 
                className="min-w-[280px] h-16 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase tracking-widest italic text-lg shadow-2xl shadow-red-900/40 transition-all active:scale-95"
              >
                Publish All Schedules
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}