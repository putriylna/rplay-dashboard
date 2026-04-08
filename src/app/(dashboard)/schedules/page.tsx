"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { anton } from "@/lib/fonts";
import {
  PlusIcon,
  CalendarIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MapIcon,
  CheckIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  PencilSquareIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { scheduleService } from "@/services/scheduleService";
import { movieService } from "@/services/movieService";
import { studioService } from "@/services/studioService";
import { Movie, Studio, Schedule } from "@/types";
import { toast } from "react-hot-toast";

interface ScheduleFormData {
  movie_id: string;
  studio_id: string;
  show_dates: string[];
  show_times: string[];
  price: string;
}

interface ScheduleBatchItem extends ScheduleFormData {
  id: number;
  movie_name: string;
  studio_name: string;
  cinema_name: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [movieSearch, setMovieSearch] = useState("");
  const [studioSearch, setStudioSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    movie_id: "",
    studio_id: "",
    show_dates: [],
    show_times: [],
    price: "",
  });
  const [scheduleBatch, setScheduleBatch] = useState<ScheduleBatchItem[]>([]);
  const [tempTime, setTempTime] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getAll();
      const rawData = Array.isArray(data) ? data : (data as any)?.data || [];
      
      // Catatan: Pastikan filter waktu ini tidak menyembunyikan jadwal yang baru kamu buat 
      // (Jika jam tayang yang kamu buat sudah lewat dari jam sekarang, dia akan hilang dari list)
      const now = new Date();
      const activeData = rawData.filter((s: Schedule) => {
        const scheduleDateTime = new Date(`${s.play_at.date}T${s.play_at.time}`);
        return scheduleDateTime > now;
      });
      
      setSchedules(activeData);
    } catch (err) {
      toast.error("Gagal memuat jadwal");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, s] = await Promise.all([movieService.getAll(), studioService.getAll()]);
        setMovies(m || []);
        setStudios(s || []);
        fetchSchedules();
      } catch (error) {
        console.error("Error loading initial data", error);
      }
    };
    loadData();
  }, [fetchSchedules]);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => m.title.toLowerCase().includes(movieSearch.toLowerCase()));
  }, [movies, movieSearch]);

  const filteredStudios = useMemo(() => {
    return studios.filter((st) =>
      `${st.cinema?.namaBioskop} ${st.namaStudio}`.toLowerCase().includes(studioSearch.toLowerCase())
    );
  }, [studios, studioSearch]);

  const groupedSchedules = useMemo(() => {
    const filtered = schedules.filter((s) => {
      const matchesSearch = s.movie?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = s.play_at?.date === activeDate;
      return matchesSearch && matchesDate;
    });

    const groups: Record<string, any> = {};
    filtered.forEach((s) => {
      const cinemaName = s.location?.cinema || "Unknown Cinema";
      if (!groups[cinemaName]) {
        groups[cinemaName] = { name: cinemaName, city: s.location?.city, schedules: [] };
      }
      groups[cinemaName].schedules.push(s);
    });
    return Object.values(groups);
  }, [schedules, searchQuery, activeDate]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ movie_id: "", studio_id: "", show_dates: [], show_times: [], price: "" });
    setScheduleBatch([]);
    setMovieSearch("");
    setStudioSearch("");
    setTempTime("");
  };

  const toggleDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      show_dates: prev.show_dates.includes(date)
        ? prev.show_dates.filter(d => d !== date)
        : [...prev.show_dates, date]
    }));
  };

  const addTime = () => {
    if (!tempTime) return;
    if (formData.show_times.includes(tempTime)) return toast.error("Jam sudah ada");
    setFormData(prev => ({ ...prev, show_times: [...prev.show_times, tempTime].sort() }));
    setTempTime("");
  };

  const addToBatch = () => {
    if (!formData.movie_id || !formData.studio_id || formData.show_dates.length === 0 || formData.show_times.length === 0 || !formData.price) {
      return toast.error("Lengkapi data jadwal sebelum menambah antrean");
    }

    const selectedMovie = movies.find(m => m.movieId.toString() === formData.movie_id);
    const selectedStudio = studios.find(s => s.studioId.toString() === formData.studio_id);

    const newItem: ScheduleBatchItem = {
      id: Date.now(),
      movie_name: selectedMovie?.title || "",
      studio_name: selectedStudio?.namaStudio || "",
      cinema_name: selectedStudio?.cinema?.namaBioskop || "",
      ...formData
    };

    setScheduleBatch(prev => [...prev, newItem]);
    // Reset form kecuali film & studio jika ingin menambah jadwal di studio yang sama dengan cepat
    setFormData(prev => ({ ...prev, show_dates: [], show_times: [], price: "" }));
    toast.success("Ditambahkan ke antrean");
  };

  const handleSaveAll = async () => {
    const loadingToast = toast.loading(editingId ? "Memperbarui..." : "Menerbitkan jadwal...");
    
    try {
      if (editingId) {
        // --- LOGIKA EDIT ---
        await scheduleService.update(editingId, {
          movie_id: Number(formData.movie_id),
          studio_id: Number(formData.studio_id),
          show_date: formData.show_dates[0],
          show_time: formData.show_times[0],
          price: Number(formData.price),
        });
        toast.success("Jadwal diperbarui!", { id: loadingToast });
      } else {
        // --- LOGIKA CREATE BATCH ---
        let finalBatch = [...scheduleBatch];
        
        // Jika masih ada data di form yang belum di klik "Add to Batch", masukkan otomatis
        if (formData.movie_id && formData.show_dates.length > 0 && formData.show_times.length > 0) {
          finalBatch.push({ id: Date.now(), movie_name: "", studio_name: "", cinema_name: "", ...formData });
        }

        if (finalBatch.length === 0) {
          toast.dismiss(loadingToast);
          return toast.error("Tidak ada data untuk disimpan");
        }

        // Kirim semua item ke server
        await Promise.all(finalBatch.map(item =>
          scheduleService.create({
            movie_id: Number(item.movie_id),
            studio_id: Number(item.studio_id),
            show_dates: item.show_dates,
            show_times: item.show_times,
            price: Number(item.price),
          })
        ));
        toast.success(`Berhasil menerbitkan ${finalBatch.length} grup jadwal!`, { id: loadingToast });
      }
      
      handleCloseModal();
      fetchSchedules();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan jadwal", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jadwal ini secara permanen?")) return;
    const loading = toast.loading("Menghapus...");
    try {
      await scheduleService.delete(id);
      toast.success("Jadwal dihapus", { id: loading });
      fetchSchedules();
    } catch (err) {
      toast.error("Gagal menghapus", { id: loading });
    }
  };

  const handleEdit = (s: Schedule) => {
    setEditingId(Number(s.schedule_id));
    setFormData({
      movie_id: s.movie?.movieId.toString() || "",
      studio_id: s.studio?.studioId.toString() || "",
      show_dates: [s.play_at.date],
      show_times: [s.play_at.time],
      price: s.price.toString(),
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen text-white pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <h1 className={`${anton.className} text-5xl uppercase italic tracking-tighter`}>Schedules</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-bold rounded-xl px-8 h-12 transition-all">
          <PlusIcon className="w-4 h-4 mr-2" /> Tambah Jadwal
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[#cc111f] transition-colors" />
        <input 
          type="text" 
          placeholder="Cari film yang sedang tayang..." 
          className="admin-input-modern pl-12 h-14 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* DATE PICKER */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const d = new Date(); d.setDate(d.getDate() + offset);
          const ds = d.toISOString().split("T")[0];
          return (
            <button key={ds} onClick={() => setActiveDate(ds)} className={`flex flex-col items-center min-w-[90px] p-4 rounded-2xl border transition-all ${activeDate === ds ? "bg-[#cc111f] border-[#cc111f] scale-105 shadow-lg shadow-red-900/20" : "bg-zinc-900/50 border-zinc-800 text-zinc-400"}`}>
              <span className="text-[10px] font-bold uppercase mb-1">{offset === 0 ? "Hari Ini" : d.toLocaleDateString("id-ID", { weekday: "short" })}</span>
              <span className="text-2xl font-black">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0a0a0a] w-full max-w-5xl rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
              <h2 className={`${anton.className} text-3xl italic uppercase`}>
                {editingId ? "Edit Jadwal" : "Atur Jadwal Tayang"}
              </h2>
              <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 hover:text-red-500 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
            </div>

            <div className="overflow-y-auto p-8 no-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* FORM LEFT */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="label-style"><MagnifyingGlassIcon className="w-3.5 h-3.5" /> Pilih Film</label>
                    <input type="text" placeholder="Cari film..." className="admin-input-modern" value={movieSearch} onChange={(e) => setMovieSearch(e.target.value)} />
                    <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto no-scrollbar pr-2 mt-2">
                      {filteredMovies.map((m) => (
                        <button key={m.movieId} onClick={() => setFormData({ ...formData, movie_id: m.movieId.toString() })} className={`flex items-center justify-between p-4 rounded-2xl text-left border transition-all ${formData.movie_id === m.movieId.toString() ? "bg-[#cc111f] border-[#cc111f]" : "bg-zinc-900/30 border-zinc-800"}`}>
                          <span className="text-sm font-bold truncate">{m.title}</span>
                          {formData.movie_id === m.movieId.toString() && <CheckIcon className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="label-style"><MapIcon className="w-3.5 h-3.5" /> Lokasi Studio</label>
                    <input type="text" placeholder="Cari bioskop..." className="admin-input-modern !py-2 !text-sm border-dashed" value={studioSearch} onChange={(e) => setStudioSearch(e.target.value)} />
                    <select className="admin-input-modern" value={formData.studio_id} onChange={(e) => setFormData({ ...formData, studio_id: e.target.value })}>
                      <option value="">Pilih Studio...</option>
                      {filteredStudios.map((st) => (
                        <option key={st.studioId} value={st.studioId.toString()}>{st.cinema?.namaBioskop} - {st.namaStudio}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FORM RIGHT */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="label-style"><CalendarIcon className="w-3.5 h-3.5" /> Tanggal & Harga</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((offset) => {
                        const d = new Date(); d.setDate(d.getDate() + offset);
                        const ds = d.toISOString().split("T")[0];
                        const active = formData.show_dates.includes(ds);
                        return (
                          <button key={ds} type="button" onClick={() => toggleDate(ds)} className={`flex flex-col items-center py-3 rounded-xl border transition-all ${active ? "bg-white text-black border-white" : "bg-zinc-900/30 border-zinc-800 text-zinc-500"}`}>
                            <span className="text-[8px] font-bold uppercase">{d.toLocaleDateString("id-ID", { weekday: "short" })}</span>
                            <span className="text-sm font-black">{d.getDate()}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative mt-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">Rp</span>
                      <input type="number" placeholder="Harga Tiket" className="admin-input-modern pl-12" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="label-style"><ClockIcon className="w-3.5 h-3.5" /> Jam Tayang</label>
                    <div className="flex gap-2">
                      <input type="time" className="admin-input-modern [color-scheme:dark]" value={tempTime} onChange={(e) => setTempTime(e.target.value)} />
                      <button type="button" onClick={addTime} className="bg-zinc-800 px-4 rounded-xl font-bold text-xs uppercase hover:bg-zinc-700 transition-colors">Tambah</button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-900 min-h-[80px]">
                      {formData.show_times.map((t) => (
                        <div key={t} className="flex items-center gap-2 bg-[#cc111f]/10 text-[#cc111f] pl-3 pr-1 py-1.5 rounded-lg text-xs font-black border border-[#cc111f]/20">
                          {t} <button onClick={() => setFormData(prev => ({...prev, show_times: prev.show_times.filter(i => i !== t)}))}><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!editingId && (
                    <button type="button" onClick={addToBatch} className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:border-[#cc111f] hover:text-[#cc111f] font-bold transition-all text-sm">
                      + Simpan & Buat Jadwal Lain (Batch)
                    </button>
                  )}
                </div>
              </div>

              {/* BATCH LIST */}
              {!editingId && scheduleBatch.length > 0 && (
                <div className="mt-12 pt-8 border-t border-zinc-900 space-y-4">
                  <h3 className="label-style text-[#cc111f]">Antrean Terbit ({scheduleBatch.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduleBatch.map((item) => (
                      <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group">
                        <div>
                          <p className="text-xs font-bold text-white uppercase">{item.movie_name || "New Schedule"}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">{item.cinema_name} • {item.show_dates.length} Hari • <span className="text-[#cc111f]">Rp {Number(item.price).toLocaleString()}</span></p>
                        </div>
                        <button onClick={() => setScheduleBatch(prev => prev.filter(i => i.id !== item.id))} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-zinc-900 bg-zinc-950/50 flex justify-end gap-4">
              <Button onClick={handleSaveAll} className="min-w-[240px] h-14 bg-[#cc111f] hover:bg-red-700 !text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest italic">
                {editingId ? "Simpan Perubahan" : "Terbitkan Semua"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER JADWAL UTAMA */}
      <div className="space-y-6">
        {isLoading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cc111f]"></div>
            </div>
        ) : groupedSchedules.length > 0 ? (
          groupedSchedules.map(group => (
            <div key={group.name} className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden">
              <div onClick={() => setOpenGroups(prev => prev.includes(group.name) ? prev.filter(n => n !== group.name) : [...prev, group.name])} className="p-6 flex justify-between items-center cursor-pointer hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#cc111f]/10 rounded-xl flex items-center justify-center text-[#cc111f]"><MapIcon className="w-5 h-5" /></div>
                  <h3 className="font-black text-lg uppercase tracking-tight">{group.name} <span className="text-zinc-600 text-xs ml-2 font-medium">{group.city}</span></h3>
                </div>
                {openGroups.includes(group.name) ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </div>
              
              {openGroups.includes(group.name) && (
                <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {group.schedules.map((s: any) => (
                    <div key={s.schedule_id} className="bg-zinc-950 p-5 rounded-[1.5rem] border border-zinc-800 relative group overflow-hidden transition-all hover:border-[#cc111f]/50">
                      {/* ACTION OVERLAY */}
                      <div className="absolute inset-0 bg-[#cc111f]/95 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-4 z-20">
                         <button onClick={() => handleEdit(s)} className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white rounded-xl transition-colors group/btn">
                            <PencilSquareIcon className="w-6 h-6 text-white group-hover/btn:text-black" />
                         </button>
                         <button onClick={() => handleDelete(s.schedule_id)} className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white rounded-xl transition-colors group/btn">
                            <TrashIcon className="w-6 h-6 text-white group-hover/btn:text-black" />
                         </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                                <FilmIcon className="w-4 h-4 text-zinc-500" />
                            </div>
                            <span className="text-[10px] bg-[#cc111f]/10 text-[#cc111f] px-2 py-1 rounded-full font-bold uppercase tracking-wider">{s.location.studio}</span>
                        </div>
                        
                        <div>
                           <h4 className="font-black text-sm uppercase italic leading-tight line-clamp-2 min-h-[2.5rem] text-white/90">
                             {s.movie?.title || "No Title"}
                           </h4>
                           <div className="flex items-center gap-2 mt-2">
                              <span className={`${anton.className} text-3xl italic tracking-tighter text-white`}>
                                {s.play_at.time}
                              </span>
                           </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-900">
                           <p className="text-xs font-black text-[#cc111f]">Rp {s.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Tidak ada jadwal tayang untuk tanggal ini</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .label-style { display: flex; align-items: center; gap: 0.5rem; font-size: 10px; text-transform: uppercase; font-weight: 800; color: #52525b; letter-spacing: 0.15em; }
        .admin-input-modern { width: 100%; background: rgba(10, 10, 10, 0.8); border: 1px solid #18181b; border-radius: 1rem; padding: 0.85rem 1.25rem; color: white; font-weight: 600; outline: none; transition: all 0.2s; }
        .admin-input-modern:focus { border-color: #cc111f; box-shadow: 0 0 0 4px rgba(204, 17, 31, 0.1); }
      `}</style>
    </div>
  );
}