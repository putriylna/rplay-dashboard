import { api } from "@/lib/api";

export interface CreateScheduleDTO {
  movie_id: number;
  studio_id: number;
  show_dates: string[]; // Batch create menggunakan array
  show_times: string[]; // Batch create menggunakan array
  price: number;
}

/**
 * Interface khusus Update
 * Backend biasanya memproses ID spesifik untuk satu slot waktu/tanggal tertentu.
 */
export interface UpdateScheduleDTO {
  movie_id: number;
  studio_id: number;
  show_date: string; // Tunggal
  show_time: string; // Tunggal
  price: number;
}

export const scheduleService = {
  // 1. Ambil semua jadwal
  getAll: async () => {
    const { data, error } = await api.api.schedules.get();
    if (error) throw new Error("Gagal mengambil daftar jadwal");
    return data;
  },

  // 2. Simpan jadwal baru (Batch Create)
  create: async (payload: CreateScheduleDTO) => {
    const { data, error } = await api.api.schedules.post(payload);
    if (error) {
      const errMsg = (error.value as any)?.error || "Gagal membuat jadwal";
      throw new Error(errMsg);
    }
    return data;
  },

  /**
   * 3. UPDATE JADWAL
   * Pastikan id dikonversi ke string saat mengakses segment Eden
   */
  update: async (id: number | string, payload: UpdateScheduleDTO) => {
    // Gunakan id.toString() untuk keamanan segment URL pada Elysia/Eden
    const { data, error } = await (api.api.schedules as any)[id.toString()].put(payload);
    
    if (error) {
      const errMsg = (error.value as any)?.error || "Gagal memperbarui jadwal";
      throw new Error(errMsg);
    }
    
    return data;
  },

  // 4. Hapus jadwal
  delete: async (id: number | string) => {
    const { data, error } = await (api.api.schedules as any)[id.toString()].delete();
    if (error) throw new Error("Gagal menghapus jadwal");
    return data;
  }
};