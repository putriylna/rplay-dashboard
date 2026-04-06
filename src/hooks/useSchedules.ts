import { useState, useEffect, useCallback, useMemo } from "react";
import { scheduleService } from "@/services/scheduleService";
import { movieService } from "@/services/movieService";
import { studioService } from "@/services/studioService";
import { Movie, Studio } from "@/types";
import { toast } from "react-hot-toast";

export function useSchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getAll();
      setSchedules(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error("Gagal memuat jadwal tayang");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [movieData, studioData] = await Promise.all([
          movieService.getAll(),
          studioService.getAll(),
        ]);
        setMovies(movieData || []);
        setStudios(studioData || []);
        await fetchSchedules();
      } catch (err) {
        toast.error("Gagal memuat data master");
      }
    };
    loadInitialData();
  }, [fetchSchedules]);

  const groupedSchedules = useMemo(() => {
    const filtered = schedules.filter((s) => {
      const matchesSearch = s.movie?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = s.play_at?.date === activeDate;
      return matchesSearch && matchesDate;
    });

    const groups: Record<string, any> = {};
    filtered.forEach((s) => {
      const cinemaName = s.location?.cinema || "Unknown Cinema";
      if (!groups[cinemaName]) {
        groups[cinemaName] = { name: cinemaName, city: s.location?.city, schedules: [] };
      }
      groups[cinemaName].schedules.push(s);
    });
    return Object.values(groups);
  }, [schedules, searchQuery, activeDate]);

  return {
    movies, studios, isLoading, searchQuery, setSearchQuery,
    activeDate, setActiveDate, groupedSchedules, fetchSchedules
  };
}