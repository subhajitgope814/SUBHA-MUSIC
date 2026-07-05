import { Track, Album, Artist, Playlist, User, BannerConfig, Category, AdminStats } from '../types/index.js';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('musichub_token');
  }

  private getHeaders(auth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (auth) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Auth ---
  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('musichub_token', data.token);
    return data;
  }

  async register(email: string, pass: string, name: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password: pass, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('musichub_token', data.token);
    return data;
  }

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data.message;
  }

  async getMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: this.getHeaders(true) });
      if (!res.ok) {
        localStorage.removeItem('musichub_token');
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('musichub_token');
  }

  // --- Music & Jamendo Tracks ---
  async getTracks(params: Record<string, string | number> = {}): Promise<Track[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/jamendo/tracks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load tracks');
    const data = await res.json();
    return data.results || [];
  }

  async getAlbums(params: Record<string, string | number> = {}): Promise<Album[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/jamendo/albums?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load albums');
    const data = await res.json();
    return data.results || [];
  }

  async getArtists(params: Record<string, string | number> = {}): Promise<Artist[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/jamendo/artists?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load artists');
    const data = await res.json();
    return data.results || [];
  }

  async getFeatured(): Promise<{
    trending: Track[];
    latest: Track[];
    albums: Album[];
    banner: BannerConfig;
    categories: Category[];
    featuredPlaylists: Playlist[];
  }> {
    const res = await fetch(`${API_BASE}/jamendo/featured`);
    if (!res.ok) throw new Error('Failed to load featured catalog');
    return await res.json();
  }

  // --- Profile, Favorites, Playlists ---
  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');
    return data.user;
  }

  async getFavorites(): Promise<string[]> {
    if (!this.getToken()) {
      const local = localStorage.getItem('musichub_local_favs');
      return local ? JSON.parse(local) : ['1888998', '1875421'];
    }
    const res = await fetch(`${API_BASE}/favorites`, { headers: this.getHeaders(true) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.favorites || [];
  }

  async toggleFavorite(trackId: string, isFav: boolean): Promise<string[]> {
    if (!this.getToken()) {
      const current = await this.getFavorites();
      const updated = isFav ? current.filter(id => id !== trackId) : [...current, trackId];
      localStorage.setItem('musichub_local_favs', JSON.stringify(updated));
      return updated;
    }
    const method = isFav ? 'DELETE' : 'POST';
    const url = isFav ? `${API_BASE}/favorites/${trackId}` : `${API_BASE}/favorites`;
    const res = await fetch(url, {
      method,
      headers: this.getHeaders(true),
      body: isFav ? undefined : JSON.stringify({ trackId })
    });
    const data = await res.json();
    return data.favorites || [];
  }

  async getPlaylists(): Promise<Playlist[]> {
    const res = await fetch(`${API_BASE}/playlists`, { headers: this.getHeaders(true) });
    const data = await res.json();
    return data.playlists || [];
  }

  async createPlaylist(name: string, description: string, isPublic = true): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ name, description, isPublic })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create playlist');
    return data.playlist;
  }

  async updatePlaylistTracks(playlistId: string, trackIds: string[]): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ trackIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update playlist');
    return data.playlist;
  }

  async deletePlaylist(playlistId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    return res.ok;
  }

  async getHistory(): Promise<{ track: Track; timestamp: string }[]> {
    if (!this.getToken()) {
      const local = localStorage.getItem('musichub_local_history');
      return local ? JSON.parse(local) : [];
    }
    const res = await fetch(`${API_BASE}/history`, { headers: this.getHeaders(true) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  }

  async logHistory(track: Track): Promise<void> {
    if (!this.getToken()) {
      const history = await this.getHistory();
      const filtered = history.filter(h => h.track.id !== track.id);
      filtered.unshift({ track, timestamp: new Date().toISOString() });
      localStorage.setItem('musichub_local_history', JSON.stringify(filtered.slice(0, 20)));
      return;
    }
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ track })
    });
  }

  // --- Admin API ---
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: this.getHeaders(true) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data.stats;
  }

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: this.getHeaders(true) });
    const data = await res.json();
    return data.users || [];
  }

  async updateBanner(banner: Partial<BannerConfig>): Promise<BannerConfig> {
    const res = await fetch(`${API_BASE}/admin/banner`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(banner)
    });
    const data = await res.json();
    return data.banner;
  }

  async updateCategories(categories: Category[]): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ categories })
    });
    const data = await res.json();
    return data.categories;
  }

  // --- Admin Track Management ---
  async getAdminTracks(): Promise<Track[]> {
    const res = await fetch(`${API_BASE}/admin/tracks`, { headers: this.getHeaders(true) });
    const data = await res.json();
    return data.tracks || [];
  }

  async addAdminTrack(track: Partial<Track>): Promise<Track> {
    const res = await fetch(`${API_BASE}/admin/tracks`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(track)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add track');
    return data.track;
  }

  async updateAdminTrack(id: string, track: Partial<Track>): Promise<Track> {
    const res = await fetch(`${API_BASE}/admin/tracks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(track)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update track');
    return data.track;
  }

  async deleteAdminTrack(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/tracks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    return !!data.success;
  }

  // --- Admin User & Role Management ---
  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    return data.user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    return !!data.success;
  }

  // --- Admin Playlists Management ---
  async getAdminPlaylists(): Promise<Playlist[]> {
    const res = await fetch(`${API_BASE}/admin/playlists`, { headers: this.getHeaders(true) });
    const data = await res.json();
    return data.playlists || [];
  }

  async togglePlaylistFeature(id: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/admin/playlists/${id}/feature`, {
      method: 'PUT',
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    return data.playlist;
  }

  async deleteAdminPlaylist(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/playlists/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    return !!data.success;
  }

  async getAdminSqlSchema(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/admin/sql-schema`, { headers: this.getHeaders(true) });
      const data = await res.json();
      return data.sql || '-- SQL Schema file not found.';
    } catch (err) {
      return '-- Error fetching SQL schema code.';
    }
  }

  async getAdminBackendInfo(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/backend-info`, { headers: this.getHeaders(true) });
      return await res.json();
    } catch (err) {
      return null;
    }
  }
}

export const api = new ApiService();
