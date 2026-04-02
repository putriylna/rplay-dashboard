// src/services/actorService.ts
import { api } from "@/lib/api";

export const actorService = {
  getAll: async () => {
    const { data, error } = await api.api.actors.get();
    if (error) throw new Error("Gagal mengambil data aktor");
    return data || [];
  },

  create: async (name: string, photoUrl?: string) => {
    const { data, error } = await api.api.actors.post({
      actor_name: name,
      photo_url: photoUrl,
    });
    if (error) throw new Error("Gagal menambahkan aktor baru");
    return data;
  },

  update: async (id: number, name: string, photoUrl?: string) => {
    const { data, error } = await (api.api.actors as any)[id].put({
      actor_name: name,
      photo_url: photoUrl,
    });
    if (error) throw new Error(`Gagal memperbarui aktor dengan ID: ${id}`);
    return data;
  },

  delete: async (id: number) => {
    const { data, error } = await (api.api.actors as any)[id].delete();
    if (error) throw new Error("Gagal menghapus aktor");
    return data;
  },

  getById: async (id: number) => {
    const { data, error } = await (api.api.actors as any)[id].get();
    if (error) throw new Error("Aktor tidak ditemukan");
    return data;
  }
};