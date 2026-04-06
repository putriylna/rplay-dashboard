import { anton } from "@/lib/fonts";
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon, MapIcon, CheckIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Movie, Studio } from "@/types";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  movies: Movie[];
  studios: Studio[];
  formData: any;
  setFormData: any;
  movieSearch: string;
  setMovieSearch: (s: string) => void;
  tempTime: string;
  setTempTime: (t: string) => void;
  addTime: () => void;
  removeTime: (t: string) => void;
  toggleDate: (d: string) => void;
  filteredMovies: Movie[];
}

export const ScheduleModal = ({ 
  isOpen, onClose, onSubmit, movies, studios, formData, setFormData, 
  movieSearch, setMovieSearch, tempTime, setTempTime, addTime, removeTime, toggleDate, filteredMovies 
}: ScheduleModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0a0a0a] w-full max-w-4xl rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#cc111f] rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shadow-[#cc111f]/20">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`${anton.className} text-3xl text-white italic uppercase`}>Buat Jadwal Baru</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Sistem Publikasi Jadwal</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-8 md:p-10 no-scrollbar">
          <form onSubmit={onSubmit} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Kolom Kiri: Movie & Studio */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="label-style"><MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#cc111f]" /> Pilih Film</label>
                  <input type="text" placeholder="Cari film..." className="admin-input-modern" value={movieSearch} onChange={(e) => setMovieSearch(e.target.value)} />
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-2 mt-2">
                    {filteredMovies.map((m) => (
                      <button key={m.movieId} type="button" onClick={() => setFormData({ ...formData, movie_id: m.movieId.toString() })}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.movie_id === m.movieId.toString() ? "bg-[#cc111f] border-[#cc111f] text-white" : "bg-zinc-900/30 border-zinc-800 text-zinc-400"}`}>
                        <span className="text-sm font-bold truncate">{m.title}</span>
                        {formData.movie_id === m.movieId.toString() && <CheckIcon className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="label-style"><MapIcon className="w-3.5 h-3.5 text-[#cc111f]" /> Studio</label>
                    <select className="admin-input-modern" value={formData.studio_id} onChange={(e) => setFormData({ ...formData, studio_id: e.target.value })} required>
                      <option value="">Pilih bioskop & studio...</option>
                      {studios.map((st) => (
                        <option key={st.studioId} value={st.studioId.toString()}>{st.cinema?.namaBioskop} - {st.namaStudio}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="label-style"><CurrencyDollarIcon className="w-3.5 h-3.5 text-[#cc111f]" /> Harga Tiket</label>
                    <input type="number" className="admin-input-modern font-mono" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Tanggal & Jam */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="label-style"><CalendarIcon className="w-3.5 h-3.5 text-[#cc111f]" /> Pilih Tanggal</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                      const d = new Date(); d.setDate(d.getDate() + offset);
                      const ds = d.toISOString().split("T")[0];
                      const active = formData.show_dates.includes(ds);
                      return (
                        <button key={ds} type="button" onClick={() => toggleDate(ds)} className={`flex flex-col items-center py-4 rounded-2xl border transition-all ${active ? "bg-white text-black border-white shadow-xl" : "bg-zinc-900/30 border-zinc-800 text-zinc-500"}`}>
                          <span className="text-[9px] font-bold uppercase mb-1">{d.toLocaleDateString("id-ID", { weekday: "short" })}</span>
                          <span className="text-base font-black">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="label-style"><ClockIcon className="w-3.5 h-3.5 text-[#cc111f]" /> Jam Tayang</label>
                  <div className="flex gap-3">
                    <input type="time" className="admin-input-modern flex-1" value={tempTime} onChange={(e) => setTempTime(e.target.value)} />
                    <button type="button" onClick={addTime} className="bg-white text-black px-6 rounded-2xl hover:bg-[#cc111f] hover:text-white font-black uppercase text-xs">Tambah</button>
                  </div>
                  <div className="flex flex-wrap gap-3 p-6 bg-zinc-950/50 rounded-3xl border border-zinc-900 min-h-[140px] content-start">
                    {formData.show_times.length === 0 ? (
                      <span className="m-auto text-[10px] text-zinc-700 font-bold uppercase italic">Belum ada jam</span>
                    ) : (
                      formData.show_times.map((time: string) => (
                        <div key={time} className="flex items-center gap-2 bg-zinc-900 pl-4 pr-2 py-2 rounded-xl text-sm font-black italic border border-zinc-800">
                          {time}
                          <button type="button" onClick={() => removeTime(time)} className="p-1 hover:bg-red-600 rounded-md"><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 flex justify-end">
              <Button type="submit" className="w-full md:w-auto min-w-[280px] h-14 bg-white hover:bg-[#cc111f] !text-black hover:!text-white font-bold rounded-xl shadow-lg text-lg px-8 transition-all">
                Terbitkan {formData.show_dates.length * formData.show_times.length} Jadwal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};