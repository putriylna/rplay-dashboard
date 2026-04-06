export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface Movie {
  movieId: number;
  title: string;
  synopsis: string;
  duration: number;
  genre: string;
  ratingAge: string;
  photoUrl?: string;
  trailerUrl?: string;
  isPlaying: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Actor {
  actorId: number;
  actorName: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cast {
  castId: number;
  movieId: number;
  actorId: number;
  characterName: string;
  photoUrl?: string;
  actor?: Actor;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  booking_id: number;
  total_price: number;
  status_booking: 'pending' | 'success' | 'cancelled';
  payment_limit: string;
}

export interface City {
  cityId: number;
  cityName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cinema {
  cinemaId: number;
  cityId: number;
  namaBioskop: string;
  alamat: string;
  mapUrl?: string;
  city?: City;
  createdAt?: string;
  updatedAt?: string;
}

// types.ts
export interface Studio {
  studioId: number;
  cinemaId: number;
  namaStudio: string;
  type: string;
  // Ini harus ada supaya UI bisa nampilin nama Bioskopnya
  cinema?: {
    cinemaId: number;
    namaBioskop: string;
    city?: {
      cityName: string;
    }
  };
}

// Component Props Interfaces
export interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  actors: Actor[];
}

export interface Schedule {
  scheduleId: number;
  movieId: number;
  studioId: number;
  showDate: string; // YYYY-MM-DD
  showTime: string; // HH:mm
  price: number;
  availableSeats: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Relasi dari .with di Backend
  movie?: Movie;
  studio?: Studio; 
}
