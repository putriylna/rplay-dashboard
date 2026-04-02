"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { movieService } from "@/services/movieService";
import { CastModalProps, Cast } from "@/types";

export default function CastModal({
  isOpen,
  onClose,
  movie,
  actors,
}: CastModalProps) {
  const [currentCasts, setCurrentCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [castForm, setCastForm] = useState({
    actor_id: 0,
    character_name: "",
    photo_url: "",
  });

  // Load data setiap kali modal dibuka atau movie berubah
  useEffect(() => {
    if (isOpen && movie) {
      loadCasts();
    }
  }, [isOpen, movie]);

  const loadCasts = async () => {
    if (!movie) return;
    try {
      // Pastikan menggunakan ID yang benar dari objek movie
      // Jika di DB kolomnya movie_id, gunakan movie.movie_id
      const id = movie.movieId || (movie as any).movie_id;
      const data = await movieService.getMovieCasts(Number(id));
      setCurrentCasts(data);
    } catch (err) {
      console.error("Failed to load casts:", err);
    }
  };

  const handleAddCast = async () => {
    // 1. Validasi Input
    if (castForm.actor_id === 0 || !castForm.character_name.trim()) {
      return alert("Silakan pilih aktor dan isi nama karakter.");
    }

    setLoading(true);
    try {
      // 2. Ambil ID Movie (antisipasi perbedaan naming convention)
      const targetMovieId = movie?.movieId || (movie as any).movie_id;

      // 3. Kirim ke Service
      await movieService.addCast(
        Number(targetMovieId),
        Number(castForm.actor_id),
        castForm.character_name,
        castForm.photo_url || ""
      );

      // 4. Refresh & Reset
      await loadCasts();
      setCastForm({ actor_id: 0, character_name: "", photo_url: "" });
    } catch (err: any) {
      console.error("Gagal menambah cast:", err);
      // Tampilkan pesan error lebih detail jika ada
      alert(err.message || "Gagal menambah cast. Pastikan aktor belum terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCast = async (castId: number) => {
    if (confirm("Hapus pemeran ini?")) {
      try {
        await movieService.deleteCast(castId);
        await loadCasts();
      } catch (err) {
        console.error("Failed to delete cast:", err);
        alert("Gagal menghapus cast");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f0f0f] w-full max-w-xl rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Cast Management</h2>
            <p className="text-[10px] text-[#cc111f] font-bold italic">{movie?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Input Form */}
          <div className="space-y-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="text-[9px] font-bold text-zinc-600 ml-1 uppercase">Select Actor</label>
                <select
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#cc111f]"
                  value={castForm.actor_id}
                  onChange={(e) => setCastForm({ ...castForm, actor_id: Number(e.target.value) })}
                >
                  <option value="0">Choose talent...</option>
                  {actors.map((a) => (
                    <option key={a.actorId} value={a.actorId}>{a.actorName}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-5">
                <label className="text-[9px] font-bold text-zinc-600 ml-1 uppercase">Character Name</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#cc111f]"
                  placeholder="e.g. John Wick"
                  value={castForm.character_name}
                  onChange={(e) => setCastForm({ ...castForm, character_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={handleAddCast}
                  disabled={loading}
                  className="w-full h-[38px] bg-white hover:bg-[#cc111f] text-black hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <PlusIcon className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>
            </div>
            <input
              type="text"
              className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none"
              placeholder="Cast photo URL (optional)..."
              value={castForm.photo_url}
              onChange={(e) => setCastForm({ ...castForm, photo_url: e.target.value })}
            />
          </div>

          {/* List Section */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Current Cast Member</h3>
            {currentCasts.length > 0 ? (
              currentCasts.map((c) => (
                <div key={c.castId} className="flex justify-between items-center p-3 bg-zinc-900/20 rounded-xl border border-zinc-900 group hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      {(c.photoUrl || c.actor?.photoUrl) ? (
                        <img src={c.photoUrl || c.actor?.photoUrl} className="w-full h-full object-cover" alt="actor" />
                      ) : (
                        <span className="text-xs font-bold text-zinc-600">{c.actor?.actorName?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{c.actor?.actorName || 'Unknown Actor'}</p>
                      <p className="text-[10px] text-[#cc111f] font-medium">as {c.characterName}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCast(c.castId)} className="p-2 text-zinc-600 hover:text-red-500 transition-all">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-600 italic">No cast members added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}