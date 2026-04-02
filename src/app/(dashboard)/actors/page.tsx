"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { anton } from "@/lib/fonts";
import {
  UserPlusIcon,
  TrashIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  LinkIcon,
  UserIcon,
  PhotoIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { actorService } from "@/services/actorService";

// --- SKELETON COMPONENT ---
const ActorSkeleton = () => (
  <div className="bg-[#0f0f0f] border border-zinc-900 rounded-[2rem] p-4 animate-pulse">
    <div className="aspect-[4/5] w-full bg-zinc-800 rounded-[1.5rem] mb-4" />
    <div className="h-4 w-3/4 bg-zinc-800 rounded mx-auto" />
  </div>
);

export default function ActorsPage() {
  const [actors, setActors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<any>(null);
  const [uploadTab, setUploadTab] = useState<"url" | "local">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [actorForm, setActorForm] = useState({
    actor_name: "",
    photo_url: "",
  });

  const loadActors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actorService.getAll();
      setActors(data);
    } catch (err) {
      console.error("Failed to load actors", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    loadActors();
  }, [loadActors]);

  const filteredActors = actors.filter((a) =>
    a.actorName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (actor?: any) => {
    if (actor) {
      setSelectedActor(actor);
      setActorForm({
        actor_name: actor.actorName,
        photo_url: actor.photoUrl || "",
      });
    } else {
      setSelectedActor(null);
      setActorForm({ actor_name: "", photo_url: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveActor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (selectedActor) {
        await actorService.update(
          selectedActor.actorId,
          actorForm.actor_name,
          actorForm.photo_url,
        );
      } else {
        await actorService.create(actorForm.actor_name, actorForm.photo_url);
      }
      setIsModalOpen(false);
      loadActors();
    } catch (err) {
      alert("Gagal menyimpan data aktor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteActor = async (id: number) => {
    if (confirm("Hapus data aktor ini permanen?")) {
      try {
        await actorService.delete(id);
        loadActors();
      } catch (err) {
        alert("Gagal menghapus aktor");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setActorForm({ ...actorForm, photo_url: localUrl });
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className={`${anton.className} text-5xl text-white italic tracking-tight`}>
            Talent Database
          </h1>
          <p className="text-zinc-500 text-sm font-medium italic">
            Kelola daftar aktor dan aktris dalam ekosistem produksi RPlay Cinema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
            <input
              type="text"
              placeholder="Cari nama talent..."
              className="admin-input-modern !pl-12 h-[52px] w-full text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-white hover:bg-[#cc111f] hover:text-white flex items-center justify-center gap-2 px-8 h-[52px] rounded-2xl transition-all shadow-xl active:scale-95 text-black font-bold text-xs"
          >
            <UserPlusIcon className="w-4 h-4 stroke-[3px]" />
            Add New Talent
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {loading ? (
          Array(12).fill(0).map((_, i) => <ActorSkeleton key={i} />)
        ) : filteredActors.length > 0 ? (
          filteredActors.map((actor) => (
            <div
              key={actor.actorId}
              className="group relative bg-[#0f0f0f] border border-zinc-900 rounded-[2rem] p-3 text-center hover:border-[#cc111f]/30 hover:bg-[#121212] transition-all duration-300"
            >
              <div className="aspect-[4/5] mb-4 relative overflow-hidden rounded-[1.5rem] bg-zinc-900 shadow-inner">
                {actor.photoUrl ? (
                  <img
                    src={actor.photoUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={actor.actorName}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-zinc-800" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleOpenModal(actor)}
                    className="p-2.5 bg-white text-black rounded-xl hover:bg-[#cc111f] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteActor(actor.actorId)}
                    className="p-2.5 bg-white text-black rounded-xl hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-zinc-200 text-xs font-bold truncate px-2 italic">
                {actor.actorName}
              </h3>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 border-2 border-dashed border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
            <UserIcon className="w-12 h-12 mb-4 text-zinc-500" />
            <p className="text-xs font-bold italic text-zinc-500">No talent found in database</p>
          </div>
        )}
      </div>

      {/* --- MODAL ADD/EDIT ACTOR (COMPACT VERSION) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] w-full max-w-sm rounded-[2rem] border border-zinc-800 shadow-2xl relative modal-scale-animation">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-900 flex justify-between items-center">
              <h2 className={`${anton.className} text-2xl text-white italic tracking-tight`}>
                {selectedActor ? 'Update Talent' : 'New Talent'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white transition-all"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActor} className="p-6 space-y-5">
              {/* Image Preview Area */}
              <div className="relative aspect-video w-full rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950">
                {actorForm.photo_url ? (
                  <img
                    src={actorForm.photo_url}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-800">
                    <PhotoIcon className="w-10 h-10 mb-1 opacity-20" />
                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Preview</span>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 ml-1 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    className="admin-input-compact"
                    placeholder="e.g. Keanu Reeves"
                    value={actorForm.actor_name}
                    onChange={(e) => setActorForm({ ...actorForm, actor_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setUploadTab("url")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${uploadTab === "url" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadTab("local")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${uploadTab === "local" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                      LOCAL
                    </button>
                  </div>

                  {uploadTab === "url" ? (
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input
                        type="text"
                        className="admin-input-compact !pl-10"
                        placeholder="https://example.com/photo.jpg"
                        value={actorForm.photo_url}
                        onChange={(e) => setActorForm({ ...actorForm, photo_url: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer bg-zinc-950 border border-dashed border-zinc-800 py-4 rounded-xl flex flex-col items-center hover:border-[#cc111f]/30 transition-all"
                    >
                      <CloudArrowUpIcon className="w-6 h-6 text-zinc-700 mb-1" />
                      <span className="text-[10px] font-bold text-zinc-600">Upload from local</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-white text-black hover:bg-[#cc111f] hover:text-white h-[48px] rounded-xl font-bold text-[11px] tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "SAVE PROFILE"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-input-modern {
          width: 100%;
          background: #111;
          border: 1px solid #1f1f23;
          border-radius: 1rem;
          padding: 0.75rem 1.25rem;
          color: white;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #000;
        }
        .admin-input-compact {
          width: 100%;
          background: #111;
          border: 1px solid #1f1f23;
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          color: white;
          font-size: 0.8rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-compact:focus {
          border-color: #cc111f;
          background: #000;
        }
        .modal-scale-animation {
          animation: modal-zoom 0.2s ease-out;
        }
        @keyframes modal-zoom {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}