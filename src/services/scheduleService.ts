import { api } from "@/lib/api";

export interface CreateScheduleDTO {
  movie_id: number;
  studio_id: number;
  show_date: string;
  show_time: string;
  price: number;
}

export const scheduleService = {
  // Ambil semua jadwal
  getAll: async () => {
    const { data, error } = await api.api.schedules.get(); 
    if (error) throw new Error("Gagal mengambil daftar jadwal");
    return data;
  },

  // Mengambil jadwal berdasarkan film atau kota
  getFiltered: async (movieId?: number, cityId?: number) => {
    const { data, error } = await api.api.schedules.filter.get({
      query: {
        movie_id: movieId,
        city_id: cityId
      }
    });
    if (error) throw new Error("Gagal memfilter jadwal");
    return data;
  },

  // Simpan jadwal baru
  create: async (payload: CreateScheduleDTO) => {
    const { data, error } = await api.api.schedules.post(payload);
    if (error) {
      const errMsg = (error.value as any)?.error || "Gagal membuat jadwal";
      throw new Error(errMsg);
    }
    return data;
  },

  /**
   * UPDATE JADWAL
   * Menggunakan method PUT ke /schedules/:id
   */
  update: async (id: number, payload: Partial<CreateScheduleDTO>) => {
    const { data, error } = await (api.api.schedules as any)[id].put(payload);
    
    if (error) {
      // Menangkap pesan error "Gagal! Studio sudah terisi..." jika update menyebabkan bentrok
      const errMsg = (error.value as any)?.error || "Gagal memperbarui jadwal";
      throw new Error(errMsg);
    }
    
    return data;
  },

  // Detail jadwal
  getById: async (id: number) => {
    const { data, error } = await (api.api.schedules as any)[id].get();
    if (error) throw new Error("Jadwal tidak ditemukan");
    return data;
  },

  // Hapus jadwal
  delete: async (id: number) => {
    const { data, error } = await (api.api.schedules as any)[id].delete();
    if (error) throw new Error("Gagal menghapus jadwal");
    return data;
  }
};