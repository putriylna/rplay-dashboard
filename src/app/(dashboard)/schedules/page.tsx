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
  CurrencyDollarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { scheduleService } from "@/services/scheduleService";
import { movieService } from "@/services/movieService";
import { studioService } from "@/services/studioService";
import { Movie, Studio, Schedule } from "@/types";
import { toast } from "react-hot-toast";

// --- Types & Interfaces ---
interface ScheduleFormData {
  movie_id: string;
  studio_id: string;
  show_dates: string[];
  show_times: string[];
  price: string;
}

export default function SchedulesPage() {
  // --- States ---
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDate, setActiveDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Form States
  const [formData, setFormData] = useState<ScheduleFormData>({
    movie_id: "",
    studio_id: "",
    show_dates: [],
    show_times: [],
    price: "",
  });
  const [movieSearch, setMovieSearch] = useState("");
  const [studioSearch, setStudioSearch] = useState(""); // State pencarian cinema di modal
  const [tempTime, setTempTime] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // --- Logic: Auto Cleanup (Otomatis hapus yang sudah lewat jamnya) ---
  const autoCleanupSchedules = useCallback((data: Schedule[]) => {
    const now = new Date();
    return data.filter((s) => {
      const scheduleDateTime = new Date(`${s.play_at.date}T${s.play_at.time}`);
      return scheduleDateTime > now;
    });
  }, []);

  // --- Memos ---
  const filteredMovies = useMemo(() => {
    return movies.filter((m) =>
      m.title.toLowerCase().includes(movieSearch.toLowerCase()),
    );
  }, [movies, movieSearch]);

  // Memo untuk pencarian studio di dalam modal
  const filteredStudios = useMemo(() => {
    return studios.filter((st) =>
      `${st.cinema?.namaBioskop} ${st.namaStudio}`
        .toLowerCase()
        .includes(studioSearch.toLowerCase()),
    );
  }, [studios, studioSearch]);

  const groupedSchedules = useMemo(() => {
    const filtered = schedules.filter((s) => {
      const matchesSearch = s.movie?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDate = s.play_at?.date === activeDate;
      return matchesSearch && matchesDate;
    });

    const groups: Record<string, any> = {};
    filtered.forEach((s) => {
      const cinemaName = s.location?.cinema || "Unknown Cinema";
      if (!groups[cinemaName]) {
        groups[cinemaName] = {
          name: cinemaName,
          city: s.location?.city,
          schedules: [],
        };
      }
      groups[cinemaName].schedules.push(s);
    });
    return Object.values(groups);
  }, [schedules, searchQuery, activeDate]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((name) => name !== groupName)
        : [...prev, groupName],
    );
  };

  // --- Data Fetching ---
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getAll();
      const rawData = Array.isArray(data) ? data : data?.data || [];
      // Terapkan auto-cleanup saat fetch data
      setSchedules(autoCleanupSchedules(rawData));
    } catch (err) {
      toast.error("Gagal memuat jadwal tayang");
    } finally {
      setIsLoading(false);
    }
  }, [autoCleanupSchedules]);

  const loadInitialData = useCallback(async () => {
    try {
      const [movieData, studioData] = await Promise.all([
        movieService.getAll(),
        studioService.getAll(),
      ]);
      setMovies(movieData || []);
      setStudios(studioData || []);
      await fetchSchedules();
    } catch (err) {
      toast.error("Gagal memuat data master");
    }
  }, [fetchSchedules]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Interval untuk auto-cleanup setiap 1 menit (tanpa refresh API)
  useEffect(() => {
    const interval = setInterval(() => {
      setSchedules((prev) => autoCleanupSchedules(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, [autoCleanupSchedules]);

  // --- Event Handlers ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      movie_id: "",
      studio_id: "",
      show_dates: [],
      show_times: [],
      price: "",
    });
    setMovieSearch("");
    setStudioSearch("");
    setTempTime("");
  };

  const toggleDate = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      show_dates: prev.show_dates.includes(date)
        ? prev.show_dates.filter((d) => d !== date)
        : [...prev.show_dates, date],
    }));
  };

  const addTime = () => {
    if (!tempTime) return;
    if (formData.show_times.includes(tempTime)) {
      return toast.error("Jam tayang sudah ada dalam daftar");
    }
    setFormData((prev) => ({
      ...prev,
      show_times: [...prev.show_times, tempTime].sort(),
    }));
    setTempTime("");
  };

  const removeTime = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      show_times: prev.show_times.filter((t) => t !== time),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.movie_id) return toast.error("Silakan pilih film");
    if (!formData.studio_id) return toast.error("Silakan pilih studio");
    if (formData.show_dates.length === 0)
      return toast.error("Pilih minimal satu tanggal");
    if (formData.show_times.length === 0)
      return toast.error("Pilih minimal satu jam tayang");

    const loadingToast = toast.loading("Sedang menerbitkan jadwal...");
    try {
      await scheduleService.create({
        movie_id: Number(formData.movie_id),
        studio_id: Number(formData.studio_id),
        show_dates: formData.show_dates,
        show_times: formData.show_times,
        price: Number(formData.price),
      });
      toast.success("Jadwal berhasil diterbitkan", { id: loadingToast });
      handleCloseModal();
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan jadwal", {
        id: loadingToast,
      });
    }
  };

  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">Hapus jadwal ini?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingDelete = toast.loading("Menghapus...");
                try {
                  await scheduleService.delete(id);
                  toast.success("Terhapus", { id: loadingDelete });
                  fetchSchedules();
                } catch {
                  toast.error("Gagal hapus", { id: loadingDelete });
                }
              }}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Ya, Hapus
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-900"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { duration: 5000 },
    );
  };

  // Fungsi Hapus Semua Jadwal dalam Satu Bioskop (Grup)
  const handleDeleteCinemaGroup = (cinemaName: string, scheduleIds: number[]) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">
            Hapus semua jadwal di <b>{cinemaName}</b>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loading = toast.loading("Menghapus semua...");
                try {
                  await Promise.all(scheduleIds.map((id) => scheduleService.delete(id)));
                  toast.success("Bioskop dibersihkan", { id: loading });
                  fetchSchedules();
                } catch {
                  toast.error("Gagal menghapus beberapa jadwal", { id: loading });
                }
              }}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Ya, Hapus Semua
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen text-white pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1
            className={`${anton.className} text-5xl uppercase italic tracking-tighter`}
          >
            Schedules
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            Kelola jadwal tayang bioskop dan harga tiket.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-bold transition-all rounded-xl shadow-lg px-8 h-12 text-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Tambah Jadwal
        </Button>
      </div>

      {/* HORIZONTAL DATE PICKER */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const d = new Date();
          d.setDate(d.getDate() + offset);
          const dateStr = d.toISOString().split("T")[0];
          const isSelected = activeDate === dateStr;
          return (
            <button
              key={dateStr}
              onClick={() => setActiveDate(dateStr)}
              className={`flex flex-col items-center min-w-[90px] p-4 rounded-2xl transition-all border ${
                isSelected
                  ? "bg-[#cc111f] border-[#cc111f] shadow-lg scale-105"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <span
                className={`text-[10px] font-bold tracking-widest mb-1 ${isSelected ? "text-white" : "text-zinc-500"}`}
              >
                {offset === 0
                  ? "Hari Ini"
                  : d.toLocaleDateString("id-ID", { weekday: "short" })}
              </span>
              <span className="text-2xl font-black">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[#cc111f] transition-colors" />
        <input
          type="text"
          placeholder="Cari berdasarkan judul film..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#cc111f] outline-none transition-all placeholder:text-zinc-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LIST SECTION */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        ) : groupedSchedules.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-zinc-800">
            <CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold text-xs">
              Tidak ada jadwal ditemukan
            </p>
          </div>
        ) : (
          groupedSchedules.map((group: any) => {
            const isOpen = openGroups.includes(group.name);

            return (
              <div
                key={group.name}
                className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden transition-all duration-300"
              >
                {/* HEADER BIOSKOP */}
                <div
                  onClick={() => toggleGroup(group.name)}
                  className="p-6 flex justify-between items-center bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#cc111f]/10 rounded-2xl flex items-center justify-center text-[#cc111f] border border-[#cc111f]/20 shadow-inner">
                      <MapIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl uppercase tracking-tighter leading-none">
                        {group.name}
                      </h3>
                      <p className="text-sm text-zinc-500 font-bold mt-1">
                        {group.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* TOMBOL HAPUS SEMUA DI BIOSKOP INI */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const ids = group.schedules.map((s: any) => s.schedule_id);
                        handleDeleteCinemaGroup(group.name, ids);
                      }}
                      className="p-2.5 bg-zinc-800/50 hover:bg-red-600/20 text-zinc-500 hover:text-red-500 rounded-xl transition-all border border-zinc-700/50 group/trash"
                      title="Hapus Semua Jadwal Bioskop Ini"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>

                    <div className="w-[1px] h-8 bg-zinc-800 mx-1" />

                    {isOpen ? (
                      <ChevronUpIcon className="w-6 h-6 text-zinc-500" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* BODY JAM TAYANG */}
                {isOpen && (
                  <div className="p-8 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {group.schedules
                        .sort((a: any, b: any) =>
                          a.play_at.time.localeCompare(b.play_at.time),
                        )
                        .map((s: any) => (
                          <div key={s.schedule_id} className="group relative">
                            <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl text-center group-hover:border-[#cc111f] transition-all group-hover:shadow-lg group-hover:shadow-[#cc111f]/10">
                              <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1 tracking-wider">
                                {s.location.studio}
                              </p>
                              <p className="text-xl font-black italic">
                                {s.play_at.time}
                              </p>
                              <p className="text-[10px] text-[#cc111f] font-bold mt-2 bg-[#cc111f]/10 py-1 rounded-md">
                                Rp {s.price.toLocaleString()}
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(s.schedule_id);
                              }}
                              className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-zinc-700 z-10"
                              title="Hapus Jadwal"
                            >
                              <XMarkIcon className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0a0a] w-full max-w-4xl rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#cc111f] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#cc111f]/30 border border-white/10">
                  <PlusIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2
                    className={`${anton.className} text-3xl text-white italic uppercase tracking-tight`}
                  >
                    Buat Jadwal Baru
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    Menerbitkan jadwal dalam sistem
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="overflow-y-auto p-8 md:p-10 no-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Kolom Kiri */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="label-style">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#cc111f]" />{" "}
                        Cari Film
                      </label>
                      <input
                        type="text"
                        placeholder="Ketik judul film..."
                        className="admin-input-modern"
                        value={movieSearch}
                        onChange={(e) => setMovieSearch(e.target.value)}
                      />
                      <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto no-scrollbar pr-2 mt-2">
                        {filteredMovies.map((m) => (
                          <button
                            key={m.movieId}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                movie_id: m.movieId.toString(),
                              })
                            }
                            className={`flex items-center justify-between p-4 rounded-2xl text-left transition-all border ${
                              formData.movie_id === m.movieId.toString()
                                ? "bg-[#cc111f] border-[#cc111f] text-white shadow-lg"
                                : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            <span className="text-sm font-bold truncate pr-4">
                              {m.title}
                            </span>
                            {formData.movie_id === m.movieId.toString() && (
                              <CheckIcon className="w-5 h-5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="label-style">
                          <MapIcon className="w-3.5 h-3.5 text-[#cc111f]" />{" "}
                          Cari & Pilih Lokasi Studio
                        </label>
                        {/* Input Pencarian Cinema/Studio */}
                        <div className="relative group/search">
                          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/search:text-[#cc111f]" />
                          <input
                            type="text"
                            placeholder="Cari bioskop atau studio..."
                            className="admin-input-modern pl-11 !py-3 !text-sm border-dashed"
                            value={studioSearch}
                            onChange={(e) => setStudioSearch(e.target.value)}
                          />
                        </div>
                        <select
                          className="admin-input-modern"
                          value={formData.studio_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              studio_id: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Pilih hasil pencarian...</option>
                          {filteredStudios.map((st) => (
                            <option
                              key={st.studioId}
                              value={st.studioId.toString()}
                            >
                              {st.cinema?.namaBioskop} - {st.namaStudio}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="label-style">
                          <CurrencyDollarIcon className="w-3.5 h-3.5 text-[#cc111f]" />{" "}
                          Harga Tiket
                        </label>
                        <input
                          type="number"
                          placeholder="50000"
                          className="admin-input-modern font-mono"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="label-style">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#cc111f]" />{" "}
                        Pilih Tanggal (Batch)
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                          const d = new Date();
                          d.setDate(d.getDate() + offset);
                          const ds = d.toISOString().split("T")[0];
                          const active = formData.show_dates.includes(ds);
                          return (
                            <button
                              key={ds}
                              type="button"
                              onClick={() => toggleDate(ds)}
                              className={`flex flex-col items-center py-4 rounded-2xl border transition-all ${
                                active
                                  ? "bg-white text-black border-white shadow-xl"
                                  : "bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                              }`}
                            >
                              <span className="text-[9px] font-bold uppercase mb-1">
                                {d.toLocaleDateString("id-ID", {
                                  weekday: "short",
                                })}
                              </span>
                              <span className="text-base font-black">
                                {d.getDate()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="label-style">
                        <ClockIcon className="w-3.5 h-3.5 text-[#cc111f]" /> Jam
                        Tayang
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="time"
                          className="admin-input-modern flex-1"
                          value={tempTime}
                          onChange={(e) => setTempTime(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={addTime}
                          className="bg-white text-black px-6 rounded-2xl hover:bg-[#cc111f] hover:text-white transition-all font-black uppercase text-xs"
                        >
                          Tambah
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 p-6 bg-zinc-950/50 rounded-3xl border border-zinc-900 min-h-[140px] content-start">
                        {formData.show_times.length === 0 ? (
                          <span className="m-auto text-[10px] text-zinc-700 font-bold uppercase italic">
                            Belum ada jam
                          </span>
                        ) : (
                          formData.show_times.map((time) => (
                            <div
                              key={time}
                              className="flex items-center gap-2 bg-zinc-900 pl-4 pr-2 py-2 rounded-xl text-sm font-black italic border border-zinc-800"
                            >
                              {time}
                              <button
                                type="button"
                                onClick={() => removeTime(time)}
                                className="p-1 hover:bg-red-600 rounded-md"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex justify-end">
                  <Button
                    type="submit"
                    className="w-full md:w-auto min-w-[280px] h-14 bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-bold rounded-xl shadow-lg text-lg group px-8 transition-all"
                  >
                    Terbitkan{" "}
                    {formData.show_dates.length * formData.show_times.length}{" "}
                    Jadwal
                    <PlusIcon className="w-5 h-5 ml-3 transition-transform group-hover:rotate-90" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .label-style {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          color: #71717a;
          letter-spacing: 0.1em;
          padding-left: 0.25rem;
        }
        .admin-input-modern {
          width: 100%;
          background: rgba(18, 18, 18, 0.6);
          border: 1px solid #1f1f23;
          border-radius: 1.25rem;
          padding: 1rem 1.5rem;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          transition: all 0.3s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #121212;
          box-shadow: 0 0 0 4px rgba(204, 17, 31, 0.1);
        }
        select.admin-input-modern {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23555' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.5rem center;
          background-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}