"use client";

import { useState, useEffect, useMemo } from "react";
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
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { movieService } from "@/services/movieService";
import CastModal from "@/components/dashboard/CastModal";
import { Movie, Actor } from "@/types";

const ITEMS_PER_PAGE = 8;
const GENRES = ["Action", "Horror", "Comedy", "Drama", "Sci-Fi", "Animation", "Thriller"];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [movieForm, setMovieForm] = useState({
    title: "",
    synopsis: "",
    duration: 0,
    genre: "", // Diinisialisasi kosong untuk multi-select
    rating_age: "SU",
    release_date: "",
    end_date: "",
    photo_url: "",
    trailer_url: "",
    is_playing: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      console.error("fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic Toggle Genre
  const toggleGenre = (g: string) => {
    const currentGenres = movieForm.genre ? movieForm.genre.split(", ") : [];
    let newGenres;
    if (currentGenres.includes(g)) {
      newGenres = currentGenres.filter((item) => item !== g);
    } else {
      newGenres = [...currentGenres, g];
    }
    setMovieForm({ ...movieForm, genre: newGenres.join(", ") });
  };

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const title = m.title || "";
      const matchesSearch = title.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // Filter genre sekarang mengecek apakah genre yang dipilih ada di dalam string genre film
      const matchesGenre = selectedGenre === "All" || (m.genre && m.genre.includes(selectedGenre));
      
      let matchesStatus = true;
      if (statusFilter === "playing") {
        matchesStatus = m.isPlaying === true;
      } else if (statusFilter === "upcoming") {
        matchesStatus = m.isPlaying === false;
      }

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [movies, debouncedSearch, selectedGenre, statusFilter]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedGenre, statusFilter]);

  const handleOpenMovie = (movie?: Movie) => {
    if (movie) {
      setSelectedMovie(movie);
      setMovieForm({
        title: movie.title,
        synopsis: movie.synopsis,
        duration: movie.duration,
        genre: movie.genre || "",
        rating_age: movie.ratingAge,
        release_date: movie.releaseDate ? movie.releaseDate.split('T')[0] : "", 
        end_date: movie.endDate ? movie.endDate.split('T')[0] : "",
        photo_url: movie.photoUrl || "",
        trailer_url: movie.trailerUrl || "",
        is_playing: movie.isPlaying,
      });
    } else {
      setSelectedMovie(null);
      setMovieForm({
        title: "", synopsis: "", duration: 0, genre: "",
        rating_age: "SU", release_date: "", end_date: "",
        photo_url: "", trailer_url: "", is_playing: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenCast = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsCastModalOpen(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm.genre) return alert("Pilih minimal satu genre!");
    
    const slug = movieForm.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    try {
      if (selectedMovie) {
        await movieService.update(selectedMovie.movieId, { ...movieForm, slug });
      } else {
        await movieService.create({ ...movieForm, slug });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "gagal menyimpan data.");
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (confirm("hapus film secara permanen?")) {
      try {
        await movieService.delete(id);
        loadData();
      } catch (err) {
        alert("gagal menghapus film");
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto text-white">
      {/* header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-zinc-800/50 pb-8">
        <div className="space-y-1">
          <h1 className={`${anton.className} text-4xl lg:text-6xl tracking-tight leading-none text-white`}>
            movie <span className="text-[#cc111f]">catalog</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            menampilkan {filteredMovies.length} film dalam database rplay.
          </p>
        </div>

        <button
          onClick={() => handleOpenMovie()}
          className="bg-white hover:bg-[#cc111f] hover:text-white text-black flex items-center justify-center gap-2 px-8 h-[52px] rounded-2xl transition-all shadow-xl active:scale-95 font-bold text-sm tracking-wider"
        >
          <PlusIcon className="w-5 h-5 stroke-[3px]" />
          add movie
        </button>
      </div>

      {/* filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-[#0a0a0a] p-4 rounded-3xl border border-zinc-800/50 shadow-2xl">
        <div className="relative group">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#cc111f] transition-colors" />
          <input
            type="text"
            placeholder="search movie title..."
            className="admin-input-modern !pl-12 w-full h-[48px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {["all", "playing", "upcoming"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                statusFilter === s ? "bg-[#cc111f] text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <FunnelIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <select
            className="admin-input-modern !pl-10 h-[48px] appearance-none"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="All">all genres</option>
            {GENRES.map((g) => <option key={g} value={g}>{g.toLowerCase()}</option>)}
          </select>
        </div>

        <div className="hidden xl:flex items-center justify-end px-4 text-zinc-500 text-xs font-bold">
          page {currentPage} of {totalPages || 1}
        </div>
      </div>

      {/* movie grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-zinc-900 rounded-[2rem] p-5 animate-pulse h-[450px]" />
          ))}
        </div>
      ) : paginatedMovies.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 bg-zinc-900/20 rounded-[3rem] border-2 border-dashed border-zinc-800">
          <FilmIcon className="w-16 h-16 text-zinc-800" />
          <p className="text-zinc-500 font-bold tracking-widest">no movies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {paginatedMovies.map((movie) => (
            <div
              key={movie.movieId}
              className="group bg-[#0a0a0a] border border-zinc-900 rounded-[2rem] p-4 hover:border-zinc-700 transition-all duration-500 flex flex-col h-full shadow-2xl relative overflow-hidden"
            >
              <div className="aspect-[2/3] mb-5 relative overflow-hidden rounded-[1.5rem] bg-zinc-950 border border-zinc-800/50">
                <img
                  src={movie.photoUrl || "/placeholder.png"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={movie.title}
                />
                
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                    <button onClick={() => handleOpenCast(movie)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-[#cc111f] hover:text-white transition-all transform hover:scale-110">
                      <UserGroupIcon className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenMovie(movie)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-all transform hover:scale-110">
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteMovie(movie.movieId)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform hover:scale-110">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                </div>

                {movie.isPlaying && (
                  <div className="absolute top-4 left-4 bg-[#cc111f] text-white text-[8px] font-black px-3 py-1 rounded-full">
                    now playing
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-[#cc111f] text-[9px] font-black border border-white/10 px-2 py-1 rounded-lg">
                  {movie.ratingAge}
                </div>
              </div>

              <div className="px-2 flex-grow space-y-3">
                <h3 className={`${anton.className} text-lg text-white tracking-tight line-clamp-1`}>
                  {movie.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 border-t border-zinc-900 pt-3">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <TagIcon className="w-3 h-3" />
                    <span className="text-[9px] font-black tracking-tighter">{movie.genre}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <ClockIcon className="w-3 h-3" />
                    <span className="text-[9px] font-black">{movie.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-30 transition-all hover:bg-white hover:text-black"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                  currentPage === i + 1 ? "bg-[#cc111f] text-white" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-30 transition-all hover:bg-white hover:text-black"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0c0c0c] w-full max-w-4xl rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="px-10 py-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#cc111f]/10 rounded-lg">
                  <FilmIcon className="w-6 h-6 text-[#cc111f]" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tighter">
                  {selectedMovie ? "modify entry" : "new release"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-1 space-y-4">
                  <div className="aspect-[2/3] rounded-3xl border border-zinc-800 bg-black overflow-hidden shadow-2xl relative group">
                    {movieForm.photo_url ? (
                      <img src={movieForm.photo_url} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-800">
                        <PhotoIcon className="w-12 h-12 mb-3 opacity-20" />
                        <span className="text-[10px] font-black opacity-40">drop poster url</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-2 block tracking-widest">poster url</label>
                      <input
                        type="text"
                        className="admin-input-modern text-[10px]"
                        placeholder="https://..."
                        value={movieForm.photo_url}
                        onChange={(e) => setMovieForm({ ...movieForm, photo_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-2 block tracking-widest">video trailer url</label>
                      <input
                        type="text"
                        className="admin-input-modern text-[10px]"
                        placeholder="https://youtube.com/..."
                        value={movieForm.trailer_url}
                        onChange={(e) => setMovieForm({ ...movieForm, trailer_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-2 block tracking-widest">duration (min)</label>
                      <input
                        type="number"
                        className="admin-input-modern text-[10px]"
                        placeholder="120"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 mb-2 block tracking-widest">movie title</label>
                    <input
                      type="text"
                      className="admin-input-modern font-black text-lg placeholder:opacity-20"
                      placeholder="enter title"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-3 block tracking-widest uppercase">
                        genres <span className="text-[#cc111f] lowercase">(select multiple)</span>
                      </label>
                      <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                        {GENRES.map((g) => {
                          const isActive = movieForm.genre.split(", ").includes(g);
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => toggleGenre(g)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 border ${
                                isActive 
                                  ? "bg-[#cc111f] border-[#cc111f] text-white shadow-[0_0_15px_rgba(204,17,31,0.3)]" 
                                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-2 block uppercase tracking-widest">parental rating</label>
                      <select
                        className="admin-input-modern text-xs font-bold"
                        value={movieForm.rating_age}
                        onChange={(e) => setMovieForm({ ...movieForm, rating_age: e.target.value })}
                      >
                        <option value="SU">su</option>
                        <option value="13+">13+</option>
                        <option value="17+">17+</option>
                        <option value="21+">21+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-2 block uppercase tracking-widest">start date</label>
                      <input
                        type="date"
                        className="admin-input-modern text-xs [color-scheme:dark]"
                        value={movieForm.release_date}
                        onChange={(e) => setMovieForm({ ...movieForm, release_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 mb-2 block uppercase tracking-widest">end date</label>
                      <input
                        type="date"
                        className="admin-input-modern text-xs [color-scheme:dark]"
                        value={movieForm.end_date}
                        onChange={(e) => setMovieForm({ ...movieForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-500 mb-2 block uppercase tracking-widest">synopsis</label>
                    <textarea
                      className="admin-input-modern h-32 text-xs resize-none leading-relaxed"
                      placeholder="movie summary..."
                      value={movieForm.synopsis}
                      onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-zinc-900">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={movieForm.is_playing}
                      onChange={(e) => setMovieForm({ ...movieForm, is_playing: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${movieForm.is_playing ? 'bg-[#cc111f]' : 'bg-zinc-800'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${movieForm.is_playing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-xs font-black text-zinc-400 group-hover:text-white transition-colors">set as playing now</span>
                </label>

                <button
                  type="submit"
                  className="bg-[#cc111f] hover:bg-white hover:text-black text-white px-12 py-4 rounded-2xl text-xs font-black transition-all transform active:scale-95 shadow-xl"
                >
                  {selectedMovie ? "confirm update" : "release movie"}
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
          background: #111;
          border: 1px solid #222;
          border-radius: 1rem;
          padding: 0.8rem 1.2rem;
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }
        .admin-input-modern:focus {
          border-color: #cc111f;
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cc111f; }
      `}</style>
    </div>
  );
}