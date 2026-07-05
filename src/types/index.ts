export interface Track {
  id: string;
  name: string;
  duration: number; // in seconds
  artist_id?: string;
  artist_name: string;
  album_name: string;
  album_id?: string;
  album_image: string;
  audio: string;
  audiodownload?: string;
  releasedate?: string;
  license_ccurl?: string;
  tags?: string[];
  plays?: number;
  likes?: number;
  genre?: string;
  lyrics?: string;
  isTrending?: boolean;
  isNewRelease?: boolean;
  isFeatured?: boolean;
  uploadedByAdmin?: boolean;
}

export interface Album {
  id: string;
  name: string;
  releasedate: string;
  artist_id: string;
  artist_name: string;
  image: string;
  zip?: string;
}

export interface Artist {
  id: string;
  name: string;
  website?: string;
  joindate?: string;
  image: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  isFeatured?: boolean;
  trackIds: string[];
  tracks?: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface BannerConfig {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  tag: string;
  color: string;
  icon: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTracksStreamed: number;
  totalPlaylists: number;
  totalFavorites: number;
  activeListenersToday: number;
  totalCustomTracks: number;
  storageUsedMB: number;
}

export type PageRoute = 
  | 'home'
  | 'explore'
  | 'latest'
  | 'trending'
  | 'artists'
  | 'albums'
  | 'search'
  | 'favorites'
  | 'playlists'
  | 'profile'
  | 'login'
  | 'register'
  | 'admin';
