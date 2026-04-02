"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { anton } from "@/lib/fonts";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  FilmIcon,
  XMarkIcon,
  UserGroupIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TagIcon,
  CalendarIcon, // Icon tambahan untuk tanggal
} from "@heroicons/react/24/outline";
import { movieService } from "@/services/movieService";
import CastModal from "@/components/dashboard/CastModal";
import { Movie, Actor } from "@/types";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // 1. UPDATE STATE FORM (Tambah release_date & end_date)
  const [movieForm, setMovieForm] = useState({
    title: "",
    synopsis: "",
    duration: 0,
    genre: "Action",
    rating_age: "SU",
    release_date: "", // Tambahan
    end_date: "",    // Tambahan
    photo_url: "",
    trailer_url: "",
    is_playing: true,
  });

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, a] = await Promise.all([
        movieService.getAll(),
        movieService.getActors(),
      ]);
      setMovies(Array.isArray(m) ? m : []);
      setActors(Array.isArray(a) ? a : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    return movies.filter((m) =>
      (m?.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [movies, searchTerm]);

  // 2. UPDATE HANDLE OPEN (Mapping data dari backend ke form)
  const handleOpenMovie = (movie?: Movie) => {
    if (movie) {
      setSelectedMovie(movie);
      setMovieForm({
        title: movie.title,
        synopsis: movie.synopsis,
        duration: movie.duration,
        genre: movie.genre,
        rating_age: movie.ratingAge,
        // Pastikan mapping nama properti dari backend (camelCase) ke form (snake_case)
        release_date: movie.releaseDate || "", 
        end_date: movie.endDate || "",
        photo_url: movie.photoUrl || "",
        trailer_url: movie.trailerUrl || "",
        is_playing: movie.isPlaying,
      });
    } else {
      setSelectedMovie(null);
      setMovieForm({
        title: "",
        synopsis: "",
        duration: 0,
        genre: "Action",
        rating_age: "SU",
        release_date: "",
        end_date: "",
        photo_url: "",
        trailer_url: "",
        is_playing: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = movieForm.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    
    try {
      if (selectedMovie)
        await movieService.update(selectedMovie.movieId, {
          ...movieForm,
          slug,
        });
      else await movieService.create({ ...movieForm, slug });
      
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data film.");
    }
  };

  const handleOpenCast = async (movie: Movie) => {
    setSelectedMovie(movie);
    setIsCastModalOpen(true);
  };

  const handleDeleteMovie = async (id: number) => {
    if (confirm("Hapus film ini secara permanen?")) {
      try {
        await movieService.delete(id);
        loadData();
      } catch (err) {
        alert("Gagal menghapus film");
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-zinc-800/50 pb-10">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className={`${anton.className} text-5xl text-white tracking-tight leading-none uppercase italic`}>
            Movie Catalog
          </h1>
          <p className="text-zinc-500 text-sm font-medium italic">
            Kelola daftar film dan aset digital RPlay Cinema
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
            <input
              type="text"
              placeholder="Cari judul film..."
              className="admin-input-modern !pl-12 h-[48px] w-full text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => handleOpenMovie()}
            className="bg-white hover:bg-[#cc111f] hover:text-white flex items-center justify-center gap-2 px-6 h-[48px] rounded-xl transition-all shadow-xl active:scale-95 text-black font-bold text-xs"
          >
            <PlusIcon className="w-4 h-4 stroke-[3px]" />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-zinc-900 rounded-[2.5rem] p-5 animate-pulse h-[400px]" />
            ))
          : filteredMovies.map((movie) => (
              <div
                key={movie.movieId}
                className="group bg-[#0a0a0a] border border-zinc-900 rounded-[2rem] p-5 hover:border-zinc-700 transition-all duration-500 flex flex-col h-full shadow-2xl"
              >
                <div className="aspect-[2/3] mb-6 relative overflow-hidden rounded-[1.5rem] bg-zinc-950 border border-zinc-800/50 group-hover:border-[#cc111f]/20 transition-all">
                  <img
                    src={movie.photoUrl || "/placeholder.png"}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt={movie.title}
                  />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenCast(movie)} className="p-3 bg-white text-black rounded-xl hover:bg-[#cc111f] hover:text-white transition-all">
                        <UserGroupIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleOpenMovie(movie)} className="p-3 bg-white text-black rounded-xl hover:bg-zinc-800 hover:text-white transition-all">
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteMovie(movie.movieId)} className="p-3 bg-white text-black rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {movie.isPlaying && (
                    <div className="absolute top-4 left-4 bg-[#cc111f] text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase italic animate-pulse">
                      Now Playing
                    </div>
                  )}
                </div>

                <div className="px-2 flex-grow flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className={`${anton.className} text-xl text-white italic tracking-tight line-clamp-2`}>
                      {movie.title}
                    </h3>
                    <span className="text-[10px] bg-zinc-900 text-[#cc111f] border border-zinc-800 px-2 py-1 rounded-lg font-bold">
                      {movie.ratingAge}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-zinc-900/50">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <TagIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase">{movie.genre}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 italic">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{movie.duration}m</span>
                    </div>
                    {/* Tampilkan Tanggal Rilis di Card jika perlu */}
                    <div className="flex items-center gap-1.5 text-zinc-600 italic">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{movie.releaseDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* --- Modal Movie Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f0f0f] w-full max-w-2xl rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden relative modal-scale-animation flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FilmIcon className="w-4 h-4 text-[#cc111f]" />
                {selectedMovie ? "Edit Movie Content" : "Add New Movie"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poster Section */}
                <div className="space-y-4">
                  <div className="aspect-[2/3] rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden relative group">
                    {movieForm.photo_url ? (
                      <img src={movieForm.photo_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-800">
                        <PhotoIcon className="w-10 h-10 mb-2 opacity-20" />
                        <span className="text-[10px] font-medium opacity-40">No Poster Loaded</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    className="admin-input-modern text-[11px]"
                    placeholder="Paste photo URL here..."
                    value={movieForm.photo_url}
                    onChange={(e) => setMovieForm({ ...movieForm, photo_url: e.target.value })}
                  />
                </div>

                {/* Main Fields Section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Movie Title</label>
                    <input
                      type="text"
                      className="admin-input-modern font-bold"
                      placeholder="E.g. Inception"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Genre</label>
                      <select
                        className="admin-input-modern text-xs"
                        value={movieForm.genre}
                        onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      >
                        <option value="Action">Action</option>
                        <option value="Horror">Horror</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Drama">Drama</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Animation">Animation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Rating</label>
                      <select
                        className="admin-input-modern text-xs"
                        value={movieForm.rating_age}
                        onChange={(e) => setMovieForm({ ...movieForm, rating_age: e.target.value })}
                      >
                        <option value="SU">SU</option>
                        <option value="13+">13+</option>
                        <option value="17+">17+</option>
                        <option value="21+">21+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Duration (min)</label>
                    <input
                      type="number"
                      className="admin-input-modern text-xs"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    />
                  </div>

                  {/* 3. ADD DATE FIELDS IN MODAL */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Release Date</label>
                      <input
                        type="date"
                        className="admin-input-modern text-xs [color-scheme:dark]"
                        value={movieForm.release_date}
                        onChange={(e) => setMovieForm({ ...movieForm, release_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">End Date</label>
                      <input
                        type="date"
                        className="admin-input-modern text-xs [color-scheme:dark]"
                        value={movieForm.end_date}
                        onChange={(e) => setMovieForm({ ...movieForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Trailer URL</label>
                    <input
                      type="text"
                      className="admin-input-modern text-[11px]"
                      placeholder="YouTube embed link..."
                      value={movieForm.trailer_url}
                      onChange={(e) => setMovieForm({ ...movieForm, trailer_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block">Synopsis</label>
                <textarea
                  className="admin-input-modern h-24 text-xs resize-none"
                  placeholder="Description of the movie..."
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={movieForm.is_playing}
                    onChange={(e) => setMovieForm({ ...movieForm, is_playing: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-[#cc111f] focus:ring-0"
                  />
                  <span className="text-[11px] font-medium text-zinc-400">Set as Now Playing</span>
                </label>
                <button
                  type="submit"
                  className="bg-[#cc111f] hover:bg-white hover:text-black text-white px-8 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  {selectedMovie ? "Update Movie" : "Save Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        movie={selectedMovie}
        actors={actors}
      />

      <style jsx global>{`
        .admin-input-modern {
          width: 100%;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 0.75rem;
          padding: 0.6rem 1rem;
          color: white;
          outline: none;
          transition: all 0.2s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #111;
          box-shadow: 0 0 0 2px rgba(204, 17, 31, 0.1);
        }
        .modal-scale-animation {
          animation: modal-zoom 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes modal-zoom {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cc111f; }
      `}</style>
    </div>
  );
}