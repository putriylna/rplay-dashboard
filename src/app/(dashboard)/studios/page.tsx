"use client";

import { useState, useEffect, useCallback } from 'react';
import { anton } from '@/lib/fonts';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  TvIcon,
  XMarkIcon,
  RectangleGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { api } from '@/lib/api'; 
import { studioService } from '@/services/studioService'; // Import Service Baru
import { Studio } from '@/types'; // Import Interface
import { toast } from 'react-hot-toast'; // Opsional: Untuk feedback UI

// --- SKELETON COMPONENT ---
const StudioSkeleton = () => (
  <div className="bg-[#0f0f0f] border border-zinc-900 rounded-[1.5rem] p-6 animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-2xl bg-zinc-800" />
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-lg bg-zinc-800" />
        <div className="w-8 h-8 rounded-lg bg-zinc-800" />
      </div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-3 w-16 bg-zinc-800 rounded" />
      <div className="h-8 w-3/4 bg-zinc-800 rounded-lg" />
      <div className="h-3 w-1/2 bg-zinc-800 rounded" />
    </div>
    <div className="h-12 w-full bg-zinc-800 rounded-xl" />
  </div>
);

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_studio: '',
    type: 'Reguler',
    cinema_id: ''
  });

  // 1. FETCH DATA MENGGUNAKAN SERVICE
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Mengambil studio via Service & Cinema via direct API (atau buatkan cinemaService nanti)
      const [resStudios, { data: resCinemas }] = await Promise.all([
        studioService.getAll(),
        api.api.cinemas.get()
      ]);
      
      setStudios(resStudios);
      if (resCinemas) setCinemas(resCinemas as any[]);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengambil data");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditOpen = (studio: Studio) => {
    setEditId(studio.studioId);
    setFormData({
      nama_studio: studio.namaStudio,
      type: studio.type,
      cinema_id: studio.cinemaId.toString()
    });
    setIsModalOpen(true);
  };

  // 2. HANDLE SUBMIT MENGGUNAKAN SERVICE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        nama_studio: formData.nama_studio,
        type: formData.type,
        cinema_id: Number(formData.cinema_id)
      };

      if (editId) {
        await studioService.update(editId, payload);
        toast.success("Studio berhasil diperbarui");
      } else {
        await studioService.create(payload);
        toast.success("Studio berhasil dibuat");
      }
      handleCloseModal();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data");
      setLoading(false);
    }
  };

  // 3. HANDLE DELETE MENGGUNAKAN SERVICE
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus studio ini? Semua kursi di studio ini juga akan terhapus.")) return;
    try {
      await studioService.delete(id);
      toast.success("Studio dihapus");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama_studio: '', type: 'Reguler', cinema_id: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className={`${anton.className} text-5xl text-white italic tracking-tight`}>
            Theater Studios
          </h1>
          <p className="text-zinc-500 text-sm font-medium italic">
            Kelola konfigurasi studio dan tipe layar di setiap bioskop.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-8 h-[48px] rounded-xl bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-bold text-xs transition-all active:scale-95 shadow-lg"
        >
          <PlusIcon className="w-4 h-4 stroke-[3px]" /> Add New Studio
        </Button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <StudioSkeleton key={i} />)
        ) : studios.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
             <TvIcon className="w-12 h-12 mb-3 text-zinc-500" />
             <p className="text-xs font-bold italic uppercase tracking-widest">No Studios Found</p>
          </div>
        ) : (
          studios.map((studio) => (
            <div key={studio.studioId} className="bg-[#0f0f0f] border border-zinc-900 rounded-[1.5rem] p-6 group hover:border-[#cc111f]/30 hover:bg-[#121212] transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-[#cc111f]/10 group-hover:border-[#cc111f]/20 transition-all">
                  <TvIcon className="w-6 h-6 text-[#cc111f]" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditOpen(studio)} className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(studio.studioId)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6 flex-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter inline-block ${
                  studio.type === 'IMAX' ? 'bg-blue-600 text-white' :
                  studio.type === 'Premiere' ? 'bg-yellow-500 text-black' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {studio.type}
                </span>
                <h3 className="text-zinc-100 font-bold text-2xl italic tracking-tight">{studio.namaStudio}</h3>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <MapPinIcon className="w-3 h-3" />
                  <p className="text-[11px] font-medium leading-none">{studio.cinema?.namaBioskop || 'Unknown Location'}</p>
                </div>
              </div>

              <Link 
                href={`/studios/${studio.studioId}/seats`}
                className="w-full py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 group/btn"
              >
                <RectangleGroupIcon className="w-4 h-4 transition-transform group-hover/btn:scale-110" /> 
                Seat Management
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className={`${anton.className} text-3xl text-white italic tracking-tight`}>
                {editId ? 'Edit Studio' : 'New Studio'}
              </h2>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Studio Name</label>
                <input 
                  type="text" 
                  className="admin-input-modern" 
                  placeholder="e.g. Studio 1"
                  value={formData.nama_studio}
                  onChange={e => setFormData({...formData, nama_studio: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Location</label>
                <select 
                  className="admin-input-modern appearance-none cursor-pointer"
                  value={formData.cinema_id}
                  onChange={e => setFormData({...formData, cinema_id: e.target.value})}
                  required
                >
                  <option value="" className="bg-zinc-900 text-zinc-400">Select Cinema</option>
                  {cinemas.map((c: any) => (
                    <option key={c.cinemaId} value={c.cinemaId} className="bg-zinc-900">{c.namaBioskop}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1 text-center block">Screen Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Reguler', 'IMAX', 'Premiere'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, type: t})}
                      className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                        formData.type === t 
                        ? 'bg-[#cc111f] border-[#cc111f] text-white shadow-lg' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-[56px] mt-4 rounded-2xl bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-black text-xs tracking-widest transition-all"
              >
                {loading ? 'SAVING...' : editId ? 'UPDATE STUDIO' : 'CREATE STUDIO'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for Modern Input */}
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
          transition: all 0.2s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #000;
          box-shadow: 0 0 0 4px rgba(204, 17, 31, 0.1);
        }
      `}</style>
    </div>
  );
}