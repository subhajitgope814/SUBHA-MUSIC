import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Playlist, Track, BannerConfig, Category, AdminStats } from '../types/index.js';
import { INITIAL_BANNER, INITIAL_CATEGORIES, INITIAL_FEATURED_PLAYLISTS, FALLBACK_TRACKS } from './mockCatalog.js';

interface DatabaseState {
  users: User[];
  passwords: Record<string, string>; // email -> hashed/stored password
  favorites: Record<string, string[]>; // userId -> trackId[]
  playlists: Playlist[];
  history: Record<string, { track: Track; timestamp: string }[]>; // userId -> history item[]
  banner: BannerConfig;
  categories: Category[];
  totalStreams: number;
  customTracks: Track[];
}

const DB_FILE = path.join(process.cwd(), '.musichub_db.json');

class DatabaseService {
  private state: DatabaseState;
  private supabase: SupabaseClient | null = null;

  constructor() {
    this.state = {
      users: [
        {
          id: 'admin-user-1',
          email: process.env.ADMIN_EMAIL || 'admin@musichub.com',
          name: 'Music Hub Admin',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: 'System Administrator & Music Curator',
          createdAt: new Date('2025-01-01').toISOString(),
        },
        {
          id: 'demo-user-1',
          email: 'alex@example.com',
          name: 'Alex Rivera',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          bio: 'Synthwave enthusiast & indie music listener',
          createdAt: new Date('2026-02-14').toISOString(),
        }
      ],
      passwords: {
        [process.env.ADMIN_EMAIL || 'admin@musichub.com']: process.env.ADMIN_PASSWORD || 'adminpassword123',
        'alex@example.com': 'password123'
      },
      favorites: {
        'admin-user-1': ['1888998', '1864320'],
        'demo-user-1': ['1875421', '1849900', '1888998']
      },
      playlists: [...INITIAL_FEATURED_PLAYLISTS],
      history: {
        'demo-user-1': [
          { track: FALLBACK_TRACKS[0], timestamp: new Date(Date.now() - 3600000).toISOString() },
          { track: FALLBACK_TRACKS[2], timestamp: new Date(Date.now() - 7200000).toISOString() }
        ]
      },
      banner: { ...INITIAL_BANNER },
      categories: [...INITIAL_CATEGORIES],
      totalStreams: 142850,
      customTracks: [
        {
          id: 'custom-subha-1',
          name: 'Subha Anthem (Starlight Club Mix)',
          duration: 215,
          artist_id: 'subha-collective',
          artist_name: 'Subha Studios Collective',
          album_name: 'Celestial Nights EP',
          album_id: 'album-subha-1',
          album_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
          audio: 'https://prod-1.storage.jamendo.com/?trackid=1888998&format=mp31&from=SubhaMusic',
          releasedate: '2026-06-15',
          tags: ['electronic', 'edm', 'club', 'trending'],
          plays: 28400,
          likes: 3120,
          genre: 'edm',
          isTrending: true,
          isFeatured: true,
          isNewRelease: true,
          uploadedByAdmin: true,
          lyrics: "We light up the night, feeling the bass pulse deep inside.\nDancing under neon skies, Subha Music takes us high."
        },
        {
          id: 'custom-subha-2',
          name: 'Midnight Eclipse (Lo-Fi Beats)',
          duration: 184,
          artist_id: 'subha-collective',
          artist_name: 'Subha & Audius Beats',
          album_name: 'Chill Sessions Vol. 4',
          album_id: 'album-subha-2',
          album_image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
          audio: 'https://prod-1.storage.jamendo.com/?trackid=1875421&format=mp31&from=SubhaMusic',
          releasedate: '2026-07-01',
          tags: ['chill', 'lofi', 'recent'],
          plays: 14900,
          likes: 1850,
          genre: 'chill',
          isTrending: false,
          isFeatured: true,
          isNewRelease: true,
          uploadedByAdmin: true,
          lyrics: "Relax your mind, let the ambient frequencies drift away..."
        }
      ]
    };

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://azkquwunkkccnhimcojq.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oOkDtSXz9eHARhIEcaFtNw_iKPEsquz';
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[DB] Connected to Supabase real instance:', supabaseUrl);
      } catch (err) {
        console.log('[DB] Using local persistent JSON storage (.musichub_db.json) fallback mode.');
      }
    } else {
      console.log('[DB] Using local persistent JSON storage (.musichub_db.json) - zero setup required.');
    }

    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.log('[DB] Initializing fresh local database storage in memory.');
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      // ignore read-only disk environments
    }
  }

  // --- Users & Auth ---
  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public verifyPassword(email: string, pass: string): boolean {
    const stored = this.state.passwords[email.toLowerCase()];
    return stored === pass;
  }

  public createUser(email: string, pass: string, name: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) throw new Error('User already exists with this email.');

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString()
    };

    this.state.users.push(newUser);
    this.state.passwords[email.toLowerCase()] = pass;
    this.state.favorites[newUser.id] = [];
    this.state.history[newUser.id] = [];
    this.saveToFile();

    if (this.supabase) {
      (async () => {
        try {
          await this.supabase.from('profiles').upsert({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            full_name: newUser.name,
            role: newUser.role,
            avatar: newUser.avatar,
            avatar_url: newUser.avatar,
            bio: 'Music Curator on Subha Music',
            updated_at: new Date().toISOString()
          });
        } catch (_) {}
      })();
    }

    return newUser;
  }

  public updateUserProfile(userId: string, updates: Partial<User>): User {
    const idx = this.state.users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    this.saveToFile();

    if (this.supabase) {
      const u = this.state.users[idx];
      (async () => {
        try {
          await this.supabase.from('profiles').upsert({
            id: u.id,
            email: u.email,
            name: u.name,
            full_name: u.name,
            role: u.role,
            avatar: u.avatar,
            avatar_url: u.avatar,
            bio: u.bio || 'Music Curator on Subha Music',
            updated_at: new Date().toISOString()
          });
        } catch (_) {}
      })();
    }

    return this.state.users[idx];
  }

  public getAllUsers(): User[] {
    return this.state.users;
  }

  // --- Favorites ---
  public getFavorites(userId: string): string[] {
    return this.state.favorites[userId] || [];
  }

  public addFavorite(userId: string, trackId: string): string[] {
    if (!this.state.favorites[userId]) this.state.favorites[userId] = [];
    if (!this.state.favorites[userId].includes(trackId)) {
      this.state.favorites[userId].push(trackId);
      this.saveToFile();
    }
    return this.state.favorites[userId];
  }

  public removeFavorite(userId: string, trackId: string): string[] {
    if (!this.state.favorites[userId]) return [];
    this.state.favorites[userId] = this.state.favorites[userId].filter(id => id !== trackId);
    this.saveToFile();
    return this.state.favorites[userId];
  }

  // --- Playlists ---
  public getPlaylists(userId?: string): Playlist[] {
    if (!userId) return this.state.playlists.filter(p => p.isPublic);
    return this.state.playlists.filter(p => p.isPublic || p.userId === userId);
  }

  public getPlaylistById(id: string): Playlist | undefined {
    return this.state.playlists.find(p => p.id === id);
  }

  public createPlaylist(userId: string, name: string, description: string, isPublic: boolean): Playlist {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      userId,
      name,
      description,
      isPublic,
      trackIds: [],
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.playlists.push(newPl);
    this.saveToFile();
    return newPl;
  }

  public updatePlaylistTracks(playlistId: string, trackIds: string[]): Playlist | undefined {
    const pl = this.getPlaylistById(playlistId);
    if (pl) {
      pl.trackIds = trackIds;
      pl.updatedAt = new Date().toISOString();
      this.saveToFile();
    }
    return pl;
  }

  public deletePlaylist(userId: string, playlistId: string): boolean {
    const idx = this.state.playlists.findIndex(p => p.id === playlistId && (p.userId === userId || this.getUserById(userId)?.role === 'admin'));
    if (idx !== -1) {
      this.state.playlists.splice(idx, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Listening History & Stats ---
  public addHistory(userId: string, track: Track) {
    if (!this.state.history[userId]) this.state.history[userId] = [];
    // remove duplicate recent
    this.state.history[userId] = this.state.history[userId].filter(h => h.track.id !== track.id);
    this.state.history[userId].unshift({ track, timestamp: new Date().toISOString() });
    if (this.state.history[userId].length > 30) this.state.history[userId].pop();
    this.state.totalStreams += 1;
    this.saveToFile();
  }

  public getHistory(userId: string): { track: Track; timestamp: string }[] {
    return this.state.history[userId] || [];
  }

  public getAdminStats(): AdminStats {
    let totalFavorites = 0;
    Object.values(this.state.favorites).forEach(favs => { totalFavorites += favs.length; });
    const customCount = (this.state.customTracks || []).length;
    return {
      totalUsers: this.state.users.length,
      totalTracksStreamed: this.state.totalStreams,
      totalPlaylists: this.state.playlists.length,
      totalFavorites,
      activeListenersToday: Math.min(this.state.users.length * 4 + 24, 342),
      totalCustomTracks: customCount,
      storageUsedMB: Number((customCount * 8.4 + 45.2).toFixed(1))
    };
  }

  // --- Admin Track Management (Custom Uploads & Licensed Additions) ---
  public getCustomTracks(): Track[] {
    return this.state.customTracks || [];
  }

  public addCustomTrack(trackData: Partial<Track>): Track {
    if (!this.state.customTracks) this.state.customTracks = [];
    const newTrack: Track = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trackData.name || 'New Custom Track',
      duration: Number(trackData.duration) || 180,
      artist_id: trackData.artist_id || 'subha-artist',
      artist_name: trackData.artist_name || 'Subha Music Artist',
      album_name: trackData.album_name || 'Subha Originals',
      album_id: trackData.album_id || 'subha-album',
      album_image: trackData.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      audio: trackData.audio || 'https://prod-1.storage.jamendo.com/?trackid=1888998&format=mp31&from=SubhaMusic',
      audiodownload: trackData.audiodownload || trackData.audio,
      releasedate: trackData.releasedate || new Date().toISOString().split('T')[0],
      tags: trackData.tags || [trackData.genre || 'electronic'],
      plays: Math.floor(Math.random() * 5000 + 100),
      likes: Math.floor(Math.random() * 500 + 10),
      genre: trackData.genre || 'Electronic',
      lyrics: trackData.lyrics || '',
      isTrending: !!trackData.isTrending,
      isNewRelease: !!trackData.isNewRelease,
      isFeatured: !!trackData.isFeatured,
      uploadedByAdmin: true
    };
    this.state.customTracks.unshift(newTrack);
    this.saveToFile();
    return newTrack;
  }

  public updateCustomTrack(id: string, updates: Partial<Track>): Track | undefined {
    if (!this.state.customTracks) return undefined;
    const idx = this.state.customTracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.customTracks[idx] = { ...this.state.customTracks[idx], ...updates };
      this.saveToFile();
      return this.state.customTracks[idx];
    }
    return undefined;
  }

  public deleteCustomTrack(id: string): boolean {
    if (!this.state.customTracks) return false;
    const idx = this.state.customTracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.customTracks.splice(idx, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Admin User & Role Management ---
  public updateUserRole(userId: string, role: 'user' | 'admin'): User | undefined {
    const user = this.getUserById(userId);
    if (user) {
      user.role = role;
      this.saveToFile();
    }
    return user;
  }

  public deleteUser(userId: string): boolean {
    const idx = this.state.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.state.users.splice(idx, 1);
      delete this.state.favorites[userId];
      delete this.state.history[userId];
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Admin Playlist Management ---
  public togglePlaylistFeatured(playlistId: string): Playlist | undefined {
    const pl = this.getPlaylistById(playlistId);
    if (pl) {
      pl.isFeatured = !pl.isFeatured;
      pl.updatedAt = new Date().toISOString();
      this.saveToFile();
    }
    return pl;
  }

  public adminDeletePlaylist(playlistId: string): boolean {
    const idx = this.state.playlists.findIndex(p => p.id === playlistId);
    if (idx !== -1) {
      this.state.playlists.splice(idx, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Admin Config Management ---
  public getBanner(): BannerConfig {
    return this.state.banner;
  }

  public updateBanner(banner: Partial<BannerConfig>): BannerConfig {
    this.state.banner = { ...this.state.banner, ...banner };
    this.saveToFile();
    return this.state.banner;
  }

  public getCategories(): Category[] {
    return this.state.categories;
  }

  public updateCategories(categories: Category[]): Category[] {
    this.state.categories = categories;
    this.saveToFile();
    return this.state.categories;
  }

  public getFeaturedPlaylists(): Playlist[] {
    return this.state.playlists.filter(p => p.isFeatured);
  }

  public getSupabase(): SupabaseClient | null {
    return this.supabase;
  }

  public getCatalogArtists(): any[] {
    return [
      { id: 'subha-collective', name: 'Subha Studios Collective', bio: 'Pioneering electronic & synthwave producers.', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', followers: 14200 },
      { id: 'artist-audius', name: 'Audius Beats', bio: 'Decentralized open-audio pioneers.', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', followers: 8900 }
    ];
  }

  public getCatalogAlbums(): any[] {
    return [
      { id: 'album-subha-1', name: 'Celestial Nights EP', artist_id: 'subha-collective', artist_name: 'Subha Studios Collective', releasedate: '2026-06-15', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
      { id: 'album-subha-2', name: 'Chill Sessions Vol. 4', artist_id: 'subha-collective', artist_name: 'Subha & Audius Beats', releasedate: '2026-07-01', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80' }
    ];
  }
}

export const db = new DatabaseService();
