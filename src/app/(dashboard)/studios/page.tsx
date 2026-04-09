"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { anton } from "@/lib/fonts";
import {
  PlusIcon,
  TrashIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  PencilSquareIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Select from "react-select";
import { studioService } from "@/services/studioService";
import { cinemaService } from "@/services/cinemaService";
import { Studio, Cinema } from "@/types";
import toast, { Toaster } from "react-hot-toast";

// --- Skeleton Component ---
const StudioSkeleton = () => (
  <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-zinc-800 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
        <div className="h-5 bg-zinc-800 rounded w-3/4" />
      </div>
    </div>
    <div className="flex justify-between mt-6">
      <div className="h-6 bg-zinc-800 rounded-full w-16" />
      <div className="h-4 bg-zinc-800 rounded w-20" />
    </div>
  </div>
);

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Pagination States
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 Baris x 3 Kolom

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [formData, setFormData] = useState({ nama: "Studio 1", type: "Reguler" });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resStudios, resCinemas] = await Promise.all([
        studioService.getAll(),
        cinemaService.getAll(),
      ]);
      setStudios(resStudios);
      setCinemas(resCinemas as unknown as Cinema[]);
    } catch (err) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- React Select Options & Styling ---
  const cinemaOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua Bioskop", city: "Semua Lokasi" }];
    const formatted = cinemas.map((c) => ({
      value: String(c.cinemaId),
      label: c.namaBioskop,
      city: c.kota?.nama_kota || "Lokasi Tidak Diketahui",
    }));
    return [...base, ...formatted];
  }, [cinemas]);

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#09090b",
      borderColor: "#27272a",
      borderRadius: "1rem",
      padding: "4px",
      color: "white",
      boxShadow: "none",
      "&:hover": { borderColor: "#cc111f" },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#09090b",
      border: "1px solid #27272a",
      borderRadius: "1rem",
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#cc111f" : "transparent",
      color: "white",
      padding: "10px 15px",
      cursor: "pointer",
      "&:active": { backgroundColor: "#8b0000" },
    }),
    singleValue: (base: any) => ({ ...base, color: "white", fontWeight: "bold" }),
    input: (base: any) => ({ ...base, color: "white" }),
  };

  // --- Logic Filtering & Pagination ---
  const filteredStudios = useMemo(() => {
    return studios.filter((s) => {
      const matchesCinema = selectedCinemaId === "all" || s.cinemaId === Number(selectedCinemaId);
      const matchesType = filterType === "all" || s.type === filterType;
      const matchesSearch = 
        (s.cinema?.namaBioskop || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.namaStudio.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCinema && matchesType && matchesSearch;
    });
  }, [studios, selectedCinemaId, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredStudios.length / itemsPerPage);
  const currentData = filteredStudios.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCinemaId, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCinemaId === "all" && !editingStudio) return toast.error("Pilih bioskop terlebih dahulu!");

    const t = toast.loading(editingStudio ? "Memperbarui..." : "Menyimpan...");
    try {
      if (editingStudio) {
        await studioService.update(editingStudio.studioId, {
          nama_studio: formData.nama,
          type: formData.type,
          cinema_id: editingStudio.cinemaId,
        });
      } else {
        await studioService.create({
          nama_studio: formData.nama,
          type: formData.type,
          cinema_id: Number(selectedCinemaId),
        });
      }
      toast.success("Berhasil!", { id: t });
      setIsModalOpen(false);
      fetchData();
    } catch { toast.error("Gagal menyimpan", { id: t }); }
  };

  const confirmDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-sm text-white">Hapus studio ini secara permanen?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
              toast.dismiss(t.id);
              const loading = toast.loading("Menghapus...");
              try { await studioService.delete(id); toast.success("Terhapus", { id: loading }); fetchData(); }
              catch { toast.error("Gagal", { id: loading }); }
            }} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Ya</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-bold">Batal</button>
        </div>
      </div>
    ), { style: { background: "#0a0a0a", border: "1px solid #27272a" } });
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 min-h-screen text-zinc-300">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className={`${anton.className} text-5xl text-white tracking-tight leading-none uppercase`}>
            Theater <span className="text-[#cc111f]">Studios</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Manajemen operasional studio dan tipe fasilitas.</p>
        </div>
        <button
          onClick={() => {
            if (selectedCinemaId === "all") return toast.error("Pilih bioskop di filter terlebih dahulu");
            setEditingStudio(null);
            setFormData({ nama: `Studio ${studios.length + 1}`, type: "Reguler" });
            setIsModalOpen(true);
          }}
          className="bg-[#cc111f] hover:bg-white hover:text-black text-white px-6 py-4 rounded-2xl font-bold text-xs tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-red-900/20"
        >
          <PlusIcon className="w-5 h-5 stroke-[3]" /> Tambah Studio
        </button>
      </div>

      {/* Control Bar (Instant Search) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-zinc-900/30 p-4 rounded-[2.5rem] border border-zinc-800/50">
        {/* Instant Text Search */}
        <div className="lg:col-span-4 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama studio..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-[#cc111f] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* React Select with City Preview */}
        <div className="lg:col-span-5">
          <Select
            options={cinemaOptions}
            styles={selectStyles}
            placeholder="Cari bioskop atau kota..."
            onChange={(opt: any) => setSelectedCinemaId(opt.value)}
            defaultValue={cinemaOptions[0]}
            formatOptionLabel={(option: any) => (
              <div className="flex justify-between items-center">
                <span>{option.label}</span>
                <span className="text-[10px] opacity-50 bg-zinc-800 px-2 py-0.5 rounded uppercase font-bold">
                  {option.city}
                </span>
              </div>
            )}
          />
        </div>

        <div className="lg:col-span-3">
          <select
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-[#cc111f] outline-none appearance-none cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Semua Tipe</option>
            <option value="Reguler">Reguler</option>
            <option value="IMAX">IMAX</option>
            <option value="Premiere">Premiere</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StudioSkeleton key={i} />)
        ) : currentData.length > 0 ? (
          currentData.map((studio: any) => (
            <div key={studio.studioId} className="group bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-5 hover:bg-zinc-900/40 hover:border-[#cc111f]/30 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {
                        setEditingStudio(studio);
                        setFormData({ nama: studio.namaStudio, type: studio.type });
                        setIsModalOpen(true);
                    }} className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg"><PencilSquareIcon className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(studio.studioId)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-[#cc111f]/50">
                        <BuildingOfficeIcon className="w-6 h-6 text-[#cc111f]" />
                    </div>
                    <div className="flex-1 pr-12">
                        <p className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest">{studio.cinema?.namaBioskop}</p>
                        <h3 className="text-lg font-bold text-white tracking-tight">{studio.namaStudio}</h3>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        studio.type === 'IMAX' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' :
                        studio.type === 'Premiere' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    }`}>{studio.type}</span>
                    <Link href={`/studios/${studio.studioId}/seats`} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">
                        <RectangleGroupIcon className="w-4 h-4" /> Layout
                    </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Tidak ada data studio ditemukan</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-zinc-500">
            Halaman <span className="text-white">{currentPage}</span> dari {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-800 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-800 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter italic">
                {editingStudio ? "Edit" : "Tambah"} <span className="text-[#cc111f]">Studio</span>
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nama Studio</label>
                <input required autoFocus type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#cc111f] outline-none mt-2"
                  value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Tipe Fasilitas</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Reguler", "IMAX", "Premiere"].map((t) => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                        formData.type === t ? "bg-white text-black border-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-[#cc111f] text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:brightness-125 transition-all">
              Konfirmasi & Simpan
            </button>
          </form>
        </div>
      )}
    </div>
  );
}