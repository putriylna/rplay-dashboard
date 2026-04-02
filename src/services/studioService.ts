import { api } from "@/lib/api";
import { Studio } from "@/types"; // Pastikan interface Studio ada di file types Anda

export interface CreateStudioDTO {
  nama_studio: string;
  type: string;
  cinema_id: number;
}

export const studioService = {
  /**
   * Mengambil semua data studio
   * Backend mengembalikan array studio include data cinema
   */
  getAll: async (): Promise<Studio[]> => {
    const { data, error } = await api.api.studios.get();
    
    if (error) {
      throw new Error("Gagal mengambil data studio");
    }
    
    return (data as unknown as Studio[]) || [];
  },

  /**
   * Mengambil detail studio berdasarkan ID
   */
  getById: async (id: number): Promise<Studio> => {
    const { data, error } = await (api.api.studios as any)[id].get();
    
    if (error) {
      throw new Error(`Studio dengan ID ${id} tidak ditemukan`);
    }
    
    return data as unknown as Studio;
  },

  /**
   * Membuat studio baru
   */
  create: async (payload: CreateStudioDTO) => {
    const { data, error } = await api.api.studios.post(payload);
    
    if (error) {
      const detail = (error.value as any)?.error || "Gagal membuat studio";
      throw new Error(detail);
    }
    
    return data;
  },

  /**
   * Memperbarui data studio
   */
  update: async (id: number, payload: Partial<CreateStudioDTO>) => {
    const { data, error } = await (api.api.studios as any)[id].put(payload);
    
    if (error) {
      throw new Error(`Gagal memperbarui studio ID: ${id}`);
    }
    
    return data;
  },

  /**
   * Menghapus studio
   */
  delete: async (id: number) => {
    const { data, error } = await (api.api.studios as any)[id].delete();
    
    if (error) {
      throw new Error("Gagal menghapus studio. Mungkin studio sedang digunakan dalam jadwal.");
    }
    
    return data;
  }
};