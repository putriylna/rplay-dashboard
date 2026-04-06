"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast'; 
import { anton } from '@/lib/fonts';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PlusIcon, 
  XMarkIcon, 
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  MapIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

// --- Types ---
interface City {
  cityId: number;
  cityName: string;
}

interface Cinema {
  cinemaId: number;
  namaBioskop: string; 
  alamat: string;
  mapUrl: string;      
  city?: City;
  cityId: number;      
}

export default function CinemasPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [displayLimit, setDisplayLimit] = useState(12);
  
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_bioskop: "",
    city_id: "",
    alamat: "",
    map_url: ""
  });

  const fetchData = useCallback(async () => {
    try {
      const { data: resCities } = await api.api.cities.get();
      const { data: resCinemas } = await api.api.cinemas.get();
      
      if (resCities) setCities(resCities as City[]);
      if (resCinemas) setCinemas(resCinemas as unknown as Cinema[]);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Gagal mengambil data dari server");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupedCinemas = useMemo(() => {
    const filtered = cinemas.filter(c => {
      const matchesSearch = (c.namaBioskop?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (c.alamat?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesCity = selectedCityId ? (c.cityId === selectedCityId || c.city?.cityId === selectedCityId) : true;
      return matchesSearch && matchesCity;
    });

    const groups: { [key: string]: Cinema[] } = {};
    filtered.forEach(cinema => {
      const cityName = cinema.city?.cityName || "Lainnya";
      if (!groups[cityName]) groups[cityName] = [];
      groups[cityName].push(cinema);
    });

    return groups;
  }, [cinemas, searchTerm, selectedCityId]);

  const totalFilteredCount = useMemo(() => 
    Object.values(groupedCinemas).reduce((acc, curr) => acc + curr.length, 0), 
  [groupedCinemas]);

  const cityOptions = useMemo(() => [
    { value: null, label: "Semua Kota" },
    ...cities.map(city => ({ value: city.cityId, label: city.cityName }))
  ], [cities]);

  const handleEditOpen = (cinema: Cinema) => {
    setEditId(cinema.cinemaId);
    setFormData({
      nama_bioskop: cinema.namaBioskop || "",
      city_id: (cinema.cityId || cinema.city?.cityId || "").toString(),
      alamat: cinema.alamat || "",
      map_url: cinema.mapUrl || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const { nama_bioskop, city_id, alamat, map_url } = formData;
    if (!nama_bioskop || !city_id || !alamat) return toast.error("Isi semua field wajib!");

    setLoading(true);
    const loadingToast = toast.loading(editId ? "Memperbarui data..." : "Mendaftarkan bioskop...");
    
    try {
      const payload = { nama_bioskop, city_id: Number(city_id), alamat, map_url: map_url || "" };
      let result;
      if (editId) result = await (api.api.cinemas as any)[Number(editId)].put(payload);
      else result = await api.api.cinemas.post(payload);

      if (result.error) throw new Error("Gagal menyimpan");
      
      toast.success(editId ? "Data berhasil diperbarui!" : "Bioskop berhasil ditambahkan!", { id: loadingToast });
      handleCloseModal();
      await fetchData(); 
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-zinc-900">Hapus bioskop ini secara permanen?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const delToast = toast.loading("Menghapus...");
              try {
                const { error } = await (api.api.cinemas as any)[Number(id)].delete();
                if (error) throw new Error();
                toast.success("Berhasil dihapus", { id: delToast });
                fetchData();
              } catch {
                toast.error("Gagal menghapus", { id: delToast });
              }
            }}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            Ya, Hapus
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold">
            Batal
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ nama_bioskop: "", city_id: "", alamat: "", map_url: "" });
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#09090b',
      borderColor: '#1f1f23',
      borderRadius: '0.75rem',
      padding: '2px',
      color: 'white',
      boxShadow: 'none',
      '&:hover': { borderColor: '#cc111f' }
    }),
    menu: (base: any) => ({ ...base, backgroundColor: '#09090b', border: '1px solid #1f1f23', zIndex: 9999 }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#cc111f' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.875rem'
    }),
    singleValue: (base: any) => ({ ...base, color: 'white', fontSize: '0.875rem' }),
    input: (base: any) => ({ ...base, color: 'white' }),
    placeholder: (base: any) => ({ ...base, color: '#52525b', fontSize: '0.875rem' })
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto min-h-screen text-zinc-300">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className={`${anton.className} text-4xl text-white tracking-tight`}>
            Theater <span className="text-[#cc111f]">Management</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Pengaturan unit dan lokasi strategis bioskop.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#cc111f] hover:bg-[#b00e1a] flex items-center gap-2 px-6 py-3 rounded-xl transition-all active:scale-95 text-white font-bold text-sm shadow-lg shadow-[#cc111f]/20"
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
          Tambah Bioskop
        </button>
      </div>

      {/* --- Filter Bar --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
        <div className="md:col-span-2 relative group">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
          <input
            type="text"
            placeholder="Cari nama atau alamat..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-[#cc111f]/50 transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setDisplayLimit(12); }}
          />
        </div>
        
        <div className="relative">
          <Select
            options={cityOptions}
            styles={selectStyles}
            placeholder="Pilih Kota"
            isSearchable
            onChange={(opt: any) => { setSelectedCityId(opt.value); setDisplayLimit(12); }}
          />
        </div>
      </div>

      {/* --- List Section --- */}
      <div className="space-y-10">
        {initialLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-zinc-900/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : totalFilteredCount > 0 ? (
          <>
            {Object.entries(groupedCinemas).map(([cityName, cinemaList]) => (
              <div key={cityName} className="space-y-4">
                <div className="flex items-center gap-3 border-l-4 border-[#cc111f] pl-4 bg-zinc-900/10 py-1">
                   <h2 className="text-lg font-bold text-white tracking-tight">{cityName}</h2>
                   <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">{cinemaList.length} Unit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cinemaList.slice(0, displayLimit).map((c) => (
                    <div key={c.cinemaId} className="group bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-4 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-[#cc111f]/30 transition-colors">
                        <BuildingOfficeIcon className="w-5 h-5 text-[#cc111f]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm truncate tracking-tight">{c.namaBioskop}</h3>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{c.alamat}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {c.mapUrl && (
                          <a href={c.mapUrl} target="_blank" className="p-2 bg-zinc-800/50 hover:bg-white hover:text-black text-zinc-500 rounded-lg transition-all">
                            <MapIcon className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => handleEditOpen(c)} className="p-2 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-500 hover:text-white rounded-lg transition-all">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.cinemaId)} className="p-2 bg-zinc-800/50 hover:bg-red-950 hover:text-red-500 text-zinc-500 rounded-lg transition-all">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {totalFilteredCount > displayLimit && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setDisplayLimit(prev => prev + 12)}
                  className="flex items-center gap-2 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 hover:text-white transition-all tracking-wide"
                >
                  Tampilkan lebih banyak <ChevronRightIcon className="w-3 h-3 rotate-90" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-600">
              <BuildingOfficeIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Tidak ada bioskop yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* --- Modal Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 w-full max-w-lg rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden modal-scale-animation">
            <div className="px-8 py-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {editId ? 'Edit Bioskop' : 'Tambah Bioskop Baru'}
                </h2>
                <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Database Unit Lokasi</p>
              </div>
              <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors border border-zinc-800">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 tracking-widest ml-1 uppercase">Nama Bioskop</label>
                <input 
                  required type="text" className="admin-input-v3" placeholder="Contoh: RPlay Cinema Grand Indonesia" 
                  value={formData.nama_bioskop}
                  onChange={(e) => setFormData({...formData, nama_bioskop: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-widest ml-1 uppercase">Lokasi Kota</label>
                  <Select
                    options={cities.map(c => ({ value: c.cityId, label: c.cityName }))}
                    styles={selectStyles}
                    value={cityOptions.find(opt => opt.value === Number(formData.city_id))}
                    onChange={(opt: any) => setFormData({...formData, city_id: opt.value})}
                    placeholder="Pilih Kota"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-widest ml-1 uppercase">URL Google Maps</label>
                  <input 
                    type="url" className="admin-input-v3" placeholder="https://maps.google.com/..." 
                    value={formData.map_url}
                    onChange={(e) => setFormData({...formData, map_url: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 tracking-widest ml-1 uppercase">Alamat Lengkap</label>
                <textarea 
                  required className="admin-input-v3 h-24 resize-none py-3" placeholder="Detail jalan, gedung, dan nomor lantai..." 
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={loading} type="submit" 
                  className="w-full bg-white text-black hover:bg-[#cc111f] hover:text-white h-12 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest uppercase"
                >
                  {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : (editId ? "Simpan Perubahan" : "Simpan Bioskop")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-input-v3 {
          width: 100%;
          background: #09090b;
          border: 1px solid #1f1f23;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-v3:focus {
          border-color: #cc111f;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .modal-scale-animation {
          animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modal-pop {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}