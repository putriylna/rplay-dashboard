// src/services/movieService.ts
import { api } from "@/lib/api";
import { Movie, Actor, Cast } from "@/types";

export const movieService = {
  // --- MOVIES ---

  // 1. GET ALL MOVIES
  getAll: async (): Promise<Movie[]> => {
    const { data } = await api.api.movies.get();
    return data || [];
  },

  // 2. CREATE MOVIE (Updated with release_date & end_date)
  create: async (payload: any): Promise<any> => {
    const { data, error } = await api.api.movies.create.post({
      title: payload.title,
      synopsis: payload.synopsis,
      duration: Number(payload.duration),
      genre: payload.genre,
      slug: payload.slug,
      // Mapping dari camelCase ke snake_case sesuai backend
      rating_age: payload.ratingAge || payload.rating_age,
      release_date: payload.releaseDate || payload.release_date, 
      end_date: payload.endDate || payload.end_date,
      photo_url: payload.photoUrl || payload.photo_url,
      trailer_url: payload.trailerUrl || payload.trailer_url,
      is_playing: payload.isPlaying ?? payload.is_playing ?? false,
    });

    if (error) {
      console.error("Create Movie Error:", error.value);
      throw new Error(error.value?.error || "Gagal menambah film");
    }
    return data;
  },

  // 3. UPDATE MOVIE (Updated with release_date & end_date)
  update: async (id: number, payload: any): Promise<any> => {
    const { data, error } = await (api.api.movies.update as any)[id].patch({
      title: payload.title,
      synopsis: payload.synopsis,
      duration: payload.duration ? Number(payload.duration) : undefined,
      genre: payload.genre,
      slug: payload.slug,
      // Mapping dari camelCase ke snake_case sesuai backend
      rating_age: payload.ratingAge || payload.rating_age,
      release_date: payload.releaseDate || payload.release_date,
      end_date: payload.endDate || payload.end_date,
      photo_url: payload.photoUrl || payload.photo_url,
      trailer_url: payload.trailerUrl || payload.trailer_url,
      is_playing: payload.isPlaying ?? payload.is_playing,
    });

    if (error) {
      console.error("Update Movie Error:", error.value);
      throw new Error(error.value?.error || "Gagal memperbarui film");
    }
    return data;
  },

  // 4. DELETE MOVIE
  delete: async (id: number): Promise<any> => {
    const { data, error } = await (api.api.movies.delete as any)[id].delete();
    if (error) throw new Error(error.value?.error || "Gagal menghapus film");
    return data;
  },

  // --- ACTORS ---
  getActors: async (): Promise<Actor[]> => {
    const { data } = await api.api.actors.get();
    return data || [];
  },

  createActor: async (name: string, photoUrl?: string): Promise<any> => {
    return await api.api.actors.post({
      actor_name: name,
      photo_url: photoUrl,
    });
  },

  updateActor: async (id: number, name: string, photoUrl?: string): Promise<any> => {
    return await (api.api.actors as any)[id].put({
      actor_name: name,
      photo_url: photoUrl,
    });
  },

  deleteActor: async (id: number): Promise<any> => {
    return await (api.api.actors as any)[id].delete();
  },

  // --- CASTS ---
  getMovieCasts: async (movieId: number): Promise<any[]> => {
    const { data, error } = await api.api.casts.movie[movieId].get();
    if (error) return [];
    return data || [];
  },

  addCast: async (
    movieId: number,
    actorId: number,
    characterName: string,
    photoUrl?: string,
  ): Promise<any> => {
    const { data, error } = await api.api.casts.post({
      movie_id: Number(movieId),
      actor_id: Number(actorId),
      character_name: characterName,
      photo_url: photoUrl || "",
    });

    if (error) throw new Error("Gagal menambah cast");
    return data;
  },

  updateCast: async (
    castId: number,
    payload: { movie_id?: number; actor_id?: number; character_name: string; photo_url?: string },
  ): Promise<any> => {
    const { data, error } = await (api.api.casts as any)[castId].put({
      character_name: payload.character_name,
      photo_url: payload.photo_url || "",
      movie_id: payload.movie_id,
      actor_id: payload.actor_id
    });

    if (error) throw new Error("Gagal update cast");
    return data;
  },

  deleteCast: async (castId: number): Promise<any> => {
    const { data, error } = await (api.api.casts as any)[castId].delete();
    if (error) throw new Error("Gagal menghapus pemeran");
    return data;
  },
};