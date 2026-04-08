import { api } from "@/lib/api";

export interface CreateScheduleDTO {
  movie_id: number;
  studio_id: number;
  show_dates: string[]; // Digunakan untuk create (multiple)
  show_times: string[]; // Digunakan untuk create (multiple)
  price: number;
}

// Interface khusus untuk UPDATE (Single schedule)
export interface UpdateScheduleDTO {
  movie_id: number;
  studio_id: number;
  show_date: string; // Backend biasanya minta string tunggal
  show_time: string; // Backend biasanya minta string tunggal
  price: number;
}

export const scheduleService = {
  // Ambil semua jadwal
  getAll: async () => {
    const { data, error } = await api.api.schedules.get();
    if (error) throw new Error("Gagal mengambil daftar jadwal");
    return data;
  },

  // Simpan jadwal baru (Batch Create)
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
   * Mengirimkan data tunggal (bukan array) ke endpoint /schedules/:id
   */
  update: async (id: number, payload: UpdateScheduleDTO) => {
    // Casting 'as any' digunakan karena struktur Eden/Elysia dinamis pada segment [id]
    const { data, error } = await (api.api.schedules as any)[id].put(payload);
    
    if (error) {
      // Menangkap pesan error spesifik (misal: "Studio sudah terisi")
      const errMsg = (error.value as any)?.error || "Gagal memperbarui jadwal";
      throw new Error(errMsg);
    }
    
    return data;
  },

  // Hapus jadwal
  delete: async (id: number) => {
    const { data, error } = await (api.api.schedules as any)[id].delete();
    if (error) throw new Error("Gagal menghapus jadwal");
    return data;
  }
};