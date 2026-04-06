import { api } from "@/lib/api";
import { Cinema } from "@/types";

/**
 * Data Transfer Object untuk Cinema
 */
export interface CreateCinemaDTO {
  nama_bioskop: string;
  city_id: number;
  alamat: string;
  map_url?: string;
}

export const cinemaService = {
  /**
   * Mengambil semua data bioskop
   * Backend diharapkan mengembalikan data include relation City
   */
  getAll: async (): Promise<Cinema[]> => {
    const { data, error } = await api.api.cinemas.get();

    if (error) {
      console.error("CinemaService.getAll Error:", error);
      throw new Error("Gagal mengambil data bioskop");
    }

    // Casting ke Cinema[] agar sesuai dengan interface kita
    return (data as unknown as Cinema[]) || [];
  },

  /**
   * Mengambil detail bioskop berdasarkan ID
   */
  getById: async (id: number): Promise<Cinema> => {
    const { data, error } = await (api.api.cinemas as any)[id].get();

    if (error) {
      throw new Error(`Bioskop dengan ID ${id} tidak ditemukan`);
    }

    return data as unknown as Cinema;
  },

  /**
   * Menambahkan bioskop baru
   */
  create: async (payload: CreateCinemaDTO) => {
    const { data, error } = await api.api.cinemas.post({
      ...payload,
      city_id: Number(payload.city_id), // Pastikan menjadi number
    });

    if (error) {
      const detail = (error.value as any)?.message || "Gagal membuat bioskop";
      throw new Error(detail);
    }

    return data;
  },

  /**
   * Memperbarui data bioskop
   */
  update: async (id: number, payload: Partial<CreateCinemaDTO>) => {
    const { data, error } = await (api.api.cinemas as any)[id].put({
      ...payload,
      ...(payload.city_id && { city_id: Number(payload.city_id) }),
    });

    if (error) {
      const detail = (error.value as any)?.message || "Gagal memperbarui bioskop";
      throw new Error(detail);
    }

    return data;
  },

  /**
   * Menghapus bioskop
   */
  delete: async (id: number) => {
    const { data, error } = await (api.api.cinemas as any)[id].delete();

    if (error) {
      throw new Error("Gagal menghapus bioskop. Mungkin masih ada studio yang terdaftar di bioskop ini.");
    }

    return data;
  },
};