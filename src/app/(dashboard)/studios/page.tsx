"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { anton } from "@/lib/fonts";
import {
  PlusIcon,
  TrashIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { studioService } from "@/services/studioService";
import { cinemaService } from "@/services/cinemaService";
import { Studio, Cinema } from "@/types";
import toast, { Toaster } from "react-hot-toast";

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [formData, setFormData] = useState({
    nama: "Studio 1",
    type: "Reguler",
  });

  const fetchData = useCallback(async () => {
    try {
      const [resStudios, resCinemas] = await Promise.all([
        studioService.getAll(),
        cinemaService.getAll(),
      ]);
      setStudios(resStudios);
      setCinemas(resCinemas as unknown as Cinema[]);
    } catch (err) {
      toast.error("Gagal memuat data dari server");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search Logic untuk Dropdown Bioskop
  const searchedCinemas = useMemo(() => {
    return cinemas.filter((c) =>
      c.namaBioskop.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [cinemas, searchQuery]);

  // Filter List Studio berdasarkan Cinema yang dipilih
  const filteredStudios = useMemo(() => {
    return selectedCinemaId === "all"
      ? studios
      : studios.filter((s) => s.cinemaId === Number(selectedCinemaId));
  }, [studios, selectedCinemaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCinemaId === "all" && !editingStudio) {
      return toast.error("Silahkan pilih bioskop terlebih dahulu!");
    }

    const t = toast.loading(
      editingStudio ? "Memperbarui studio..." : "Mendaftarkan studio...",
    );

    try {
      if (editingStudio) {
        await studioService.update(editingStudio.studioId, {
          nama_studio: formData.nama,
          type: formData.type,
          cinema_id: editingStudio.cinemaId,
        });
        toast.success("Studio berhasil diperbarui!", { id: t });
      } else {
        await studioService.create({
          nama_studio: formData.nama,
          type: formData.type,
          cinema_id: Number(selectedCinemaId),
        });
        toast.success("Studio berhasil didaftarkan!", { id: t });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Gagal menyimpan data studio", { id: t });
    }
  };

  const confirmDelete = (id: number) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">
            Hapus studio ini? Data layout kursi juga akan ikut terhapus secara permanen.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loading = toast.loading("Menghapus...");
                try {
                  await studioService.delete(id);
                  toast.success("Studio berhasil dihapus", { id: loading });
                  fetchData();
                } catch {
                  toast.error("Gagal menghapus studio", { id: loading });
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Ya, Hapus
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-xs font-bold hover:text-white"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        style: {
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "1.5rem",
          padding: "1rem",
        },
      },
    );
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 min-h-screen text-zinc-300">
      <Toaster position="top-center" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className={`${anton.className} text-4xl text-white tracking-tight uppercase`}>
            Theater <span className="text-[#cc111f]">Studios</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Konfigurasi dan manajemen kapasitas studio bioskop.
          </p>
        </div>
        <button
          onClick={() => {
            if (selectedCinemaId === "all")
              return toast.error("Pilih bioskop pada filter terlebih dahulu untuk menambahkan studio");
            setEditingStudio(null);
            setFormData({ nama: "Studio 1", type: "Reguler" });
            setIsModalOpen(true);
          }}
          className="bg-[#cc111f] hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-900/20 active:scale-95"
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5]" /> Tambah Studio
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-zinc-800/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama bioskop..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#cc111f] outline-none transition-all placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-[1.5]">
            <select
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[#cc111f] outline-none cursor-pointer appearance-none"
              value={selectedCinemaId}
              onChange={(e) => setSelectedCinemaId(e.target.value)}
            >
              <option value="all">
                Tampilkan Semua Bioskop ({searchedCinemas.length})
              </option>
              {searchedCinemas.map((c) => (
                <option key={c.cinemaId} value={c.cinemaId}>
                  {c.namaBioskop}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Studio Grid/List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredStudios.length > 0 ? (
          filteredStudios.map((studio: any) => (
            <div
              key={studio.studioId}
              className="group bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-5 flex items-center justify-between hover:bg-zinc-900/60 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 text-[#cc111f] group-hover:scale-110 transition-transform">
                  <BuildingOfficeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {studio.cinema?.namaBioskop || "Bioskop Tidak Diketahui"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-zinc-400 uppercase tracking-tighter">
                      {studio.namaStudio}
                    </p>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black bg-zinc-800 text-zinc-500 border border-zinc-700 uppercase">
                      {studio.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingStudio(studio);
                    setFormData({ nama: studio.namaStudio, type: studio.type });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-zinc-600 hover:text-white transition-colors"
                  title="Edit Studio"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => confirmDelete(studio.studioId)}
                  className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                  title="Hapus Studio"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>

                <Link
                  href={`/studios/${studio.studioId}/seats`}
                  className="ml-4 bg-[#1c1c1e] text-zinc-300 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border border-zinc-800 hover:bg-white hover:text-black transition-all active:scale-95"
                >
                  Configure Layout
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
             <p className="text-zinc-600 font-medium">Tidak ada studio ditemukan untuk kriteria ini.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c0c0e] w-full max-w-md rounded-[2.5rem] border border-zinc-800 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingStudio ? "Update Studio" : "Studio Baru"}
                </h2>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
                  ID Bioskop: {editingStudio ? editingStudio.cinemaId : selectedCinemaId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">
                  Nama Studio
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Studio 1 atau IMAX 1"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#cc111f] outline-none mt-1 transition-all"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">
                  Tipe Fasilitas
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["Reguler", "IMAX", "Premiere"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        formData.type === t 
                        ? "bg-white text-black border-white shadow-lg" 
                        : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#cc111f] text-white rounded-2xl font-bold hover:brightness-125 transition-all shadow-lg shadow-red-900/20 uppercase text-xs tracking-widest active:scale-[0.98]"
            >
              {editingStudio ? "Simpan Perubahan" : "Konfirmasi & Buat Studio"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}