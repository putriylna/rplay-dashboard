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
import toast from "react-hot-toast";

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal (Gabungan untuk Add & Edit)
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
      toast.error("Gagal memuat data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // LOGIK PENCARIAN: Memfilter daftar bioskop di dalam select
  const searchedCinemas = useMemo(() => {
    return cinemas.filter((c) =>
      c.namaBioskop.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [cinemas, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCinemaId === "all" && !editingStudio) {
      return toast.error("Pilih bioskop terlebih dahulu!");
    }

    const t = toast.loading(
      editingStudio ? "Memperbarui studio..." : "Mendaftarkan studio...",
    );
    try {
      if (editingStudio) {
        // Logika Update
        await studioService.update(editingStudio.studioId, {
          nama_studio: formData.nama,
          type: formData.type,
          cinema_id: editingStudio.cinemaId,
        });
        toast.success("Studio berhasil diperbarui!", { id: t });
      } else {
        // Logika Create
        await studioService.create({
          nama_studio: formData.nama,
          type: formData.type,
          cinema_id: Number(selectedCinemaId),
        });
        toast.success("Studio berhasil dibuat!", { id: t });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Terjadi kesalahan sistem", { id: t });
    }
  };

  const confirmDelete = (id: number) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">
            Hapus studio ini? Data layout kursi juga akan hilang.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loading = toast.loading("Menghapus...");
                try {
                  await studioService.delete(id);
                  toast.success("Studio dihapus", { id: loading });
                  fetchData();
                } catch {
                  toast.error("Gagal menghapus", { id: loading });
                }
              }}
              className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-xs font-bold"
            >
              Oke
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-xs font-bold"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        style: {
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "1rem",
        },
      },
    );
  };

  const filteredStudios =
    selectedCinemaId === "all"
      ? studios
      : studios.filter((s) => s.cinemaId === Number(selectedCinemaId));

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 min-h-screen text-zinc-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1
            className={`${anton.className} text-4xl text-white tracking-tight uppercase`}
          >
            Theater <span className="text-[#cc111f]">Studios</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manajemen studio per unit bioskop.
          </p>
        </div>
        <button
          onClick={() => {
            if (selectedCinemaId === "all")
              return toast.error("Pilih bioskop di filter terlebih dahulu");
            setEditingStudio(null);
            setFormData({ nama: "Studio 1", type: "Reguler" });
            setIsModalOpen(true);
          }}
          className="bg-[#cc111f] hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5]" /> Tambah Studio
        </button>
      </div>

      {/* FILTER SEARCH & SELECT (Gabungan) */}
      <div className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-zinc-800/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Input Pencarian */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama bioskop..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#cc111f] outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Dropdown Bioskop (Terfilter otomatis) */}
          <div className="flex-[1.5]">
            <select
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[#cc111f] outline-none cursor-pointer"
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

      {/* List Studio (Card Layout) */}
      <div className="space-y-3">
        {filteredStudios.map((studio: any) => (
          <div
            key={studio.studioId}
            className="group bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-5 flex items-center justify-between hover:bg-zinc-900/60 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 text-[#cc111f]">
                <BuildingOfficeIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {studio.cinema?.namaBioskop}
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
              {/* Tombol Edit */}
              <button
                onClick={() => {
                  setEditingStudio(studio);
                  setFormData({ nama: studio.namaStudio, type: studio.type });
                  setIsModalOpen(true);
                }}
                className="p-2 text-zinc-600 hover:text-white transition-colors"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>

              {/* Tombol Delete */}
              <button
                onClick={() => confirmDelete(studio.studioId)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>

              <Link
                href={`/studios/${studio.studioId}/seats`}
                className="ml-4 bg-[#1c1c1e] text-zinc-300 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border border-zinc-800 hover:bg-white hover:text-black transition-all inline-block"
              >
                Configure Layout
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form (Add & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c0c0e] w-full max-w-md rounded-[2.5rem] border border-zinc-800 shadow-2xl p-8 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingStudio ? "Update Studio" : "Tambah Studio Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-[#cc111f] outline-none mt-1"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">
                  Tipe Studio
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["Reguler", "IMAX", "Premiere"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.type === t ? "bg-white text-black border-white" : "bg-transparent border-zinc-800 text-zinc-500"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#cc111f] text-white rounded-2xl font-bold hover:brightness-125 transition-all shadow-lg shadow-red-900/20 uppercase text-xs tracking-widest"
            >
              {editingStudio ? "Simpan Perubahan" : "Konfirmasi & Simpan"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
