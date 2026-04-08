"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { movieService } from "@/services/movieService";
import { CastModalProps, Cast } from "@/types";
import { toast } from "react-hot-toast"; // Import toast

export default function CastModal({ isOpen, onClose, movie, actors }: CastModalProps) {
  const [currentCasts, setCurrentCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [castForm, setCastForm] = useState({
    actor_id: 0,
    character_name: "",
    photo_url: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setCurrentCasts([]);
      setCastForm({ actor_id: 0, character_name: "", photo_url: "" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && movie) {
      loadCasts();
    }
  }, [isOpen, movie]);

  const loadCasts = async () => {
    const id = movie?.movieId || (movie as any)?.movie_id;
    if (!id) return;
    try {
      const data = await movieService.getMovieCasts(Number(id));
      setCurrentCasts(data);
    } catch (err) {
      console.error("Gagal load cast:", err);
      toast.error("Gagal memuat daftar pemeran");
    }
  };

  const handleAddCast = async () => {
    if (castForm.actor_id === 0 || !castForm.character_name.trim()) {
      return toast.error("Pilih aktor dan isi nama karakter!");
    }

    setLoading(true);
    const loadingToast = toast.loading("Menambahkan pemeran...");
    
    try {
      const targetMovieId = movie?.movieId || (movie as any).movie_id;
      await movieService.addCast(
        Number(targetMovieId),
        Number(castForm.actor_id),
        castForm.character_name,
        castForm.photo_url || ""
      );
      
      await loadCasts();
      setCastForm({ actor_id: 0, character_name: "", photo_url: "" });
      toast.success("Pemeran berhasil ditambahkan!", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || "Gagal: Aktor mungkin sudah ada.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCast = async (castId: number) => {
    // Custom konfirmasi menggunakan Toast (Optional) atau tetap Native Confirm
    if (confirm("Hapus pemeran ini?")) {
      const deleteToast = toast.loading("Menghapus...");
      try {
        await movieService.deleteCast(castId);
        await loadCasts();
        toast.success("Pemeran berhasil dihapus", { id: deleteToast });
      } catch (err) {
        toast.error("Gagal menghapus pemeran", { id: deleteToast });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] w-full max-w-xl rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Cast Management</h2>
            <p className="text-[10px] text-[#cc111f] font-black uppercase italic mt-1">{movie?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Form Tambah Cast */}
          <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-800/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase ml-1">Pilih Aktor</label>
                <select
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-3 text-[11px] text-white focus:border-[#cc111f] outline-none appearance-none"
                  value={castForm.actor_id}
                  onChange={(e) => setCastForm({ ...castForm, actor_id: Number(e.target.value) })}
                >
                  <option value="0">PILIH TALENT...</option>
                  {actors.map((a) => (
                    <option key={a.actorId} value={a.actorId}>{a.actorName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase ml-1">Nama Karakter</label>
                <input
                  type="text"
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-3 text-[11px] text-white focus:border-[#cc111f] outline-none"
                  placeholder="Contoh: Batman"
                  value={castForm.character_name}
                  onChange={(e) => setCastForm({ ...castForm, character_name: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase ml-1">Custom Character Photo URL (Opsional)</label>
                <input
                  type="text"
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-3 text-[11px] text-white focus:border-[#cc111f] outline-none"
                  placeholder="https://..."
                  value={castForm.photo_url}
                  onChange={(e) => setCastForm({ ...castForm, photo_url: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddCast}
                  disabled={loading}
                  className="h-[46px] px-6 bg-white hover:bg-[#cc111f] text-black hover:text-white rounded-xl transition-all font-black text-xs active:scale-95 disabled:opacity-30"
                >
                  <PlusIcon className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>
            </div>
          </div>

          {/* List Cast Terdaftar */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pemeran Saat Ini</h3>
            <div className="grid gap-3">
              {currentCasts.map((c) => {
                const finalPhoto = c.photoUrl || c.actor?.photoUrl || "";

                return (
                  <div 
                    key={`${c.castId}-${finalPhoto}`} 
                    className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900 group hover:border-zinc-700 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-zinc-800 flex-shrink-0 shadow-lg">
                        {finalPhoto ? (
                          <img 
                            src={finalPhoto} 
                            alt="cast" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            key={finalPhoto}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{c.actor?.actorName}</p>
                        <p className="text-[10px] text-[#cc111f] font-bold italic tracking-tighter uppercase opacity-80">
                          sebagai {c.characterName}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCast(c.castId)}
                      className="p-2.5 text-zinc-600 hover:text-white hover:bg-red-600 rounded-xl transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {currentCasts.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-zinc-900 rounded-[2rem]">
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Belum ada pemeran</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}