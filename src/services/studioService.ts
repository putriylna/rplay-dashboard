import { api } from "@/lib/api";
import { Studio } from "@/types";

export const studioService = {
  getAll: async (): Promise<Studio[]> => {
    const { data, error } = await api.api.studios.get();
    if (error) throw new Error("Gagal mengambil data studio");
    return (data as unknown as Studio[]) || [];
  },

  create: async (payload: { nama_studio: string; type: string; cinema_id: number }) => {
    const { data, error } = await api.api.studios.post(payload);
    if (error) throw new Error("Gagal membuat studio");
    return data;
  },

  update: async (id: number, payload: any) => {
    const { data, error } = await (api.api.studios as any)[id].put(payload);
    if (error) throw new Error("Gagal update studio");
    return data;
  },

  delete: async (id: number) => {
    const { data, error } = await (api.api.studios as any)[id].delete();
    if (error) throw new Error("Gagal menghapus studio. Cek apakah ada jadwal aktif.");
    return data;
  }
};