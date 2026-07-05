import { Track, Album, Artist } from '../types/index.js';
import { FALLBACK_TRACKS, FALLBACK_ALBUMS, FALLBACK_ARTISTS } from './mockCatalog.js';
import { db } from './db.js';

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class JamendoService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  private getClientId(): string {
    return process.env.JAMENDO_CLIENT_ID || '56d30c95';
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache<T>(key: string, data: T) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private filterCustomTracks(params: Record<string, string | number>): Track[] {
    let custom = [...db.getCustomTracks()];
    if (params.id) {
      const idStr = String(params.id);
      custom = custom.filter(t => t.id === idStr || (Array.isArray(params.id) && params.id.includes(t.id)));
    }
    if (params.artist_id) {
      custom = custom.filter(t => t.artist_id === String(params.artist_id));
    }
    if (params.album_id) {
      custom = custom.filter(t => t.album_id === String(params.album_id));
    }
    if (params.search) {
      const q = String(params.search).toLowerCase();
      custom = custom.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.artist_name.toLowerCase().includes(q) || 
        t.album_name.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (params.tags) {
      const tag = String(params.tags).toLowerCase();
      custom = custom.filter(t => t.tags?.some(tTag => tTag.toLowerCase().includes(tag)) || t.genre?.toLowerCase() === tag);
    }
    if (params.order === 'popularity_total') {
      custom.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (params.order === 'releasedate_desc') {
      custom.sort((a, b) => (b.releasedate || '').localeCompare(a.releasedate || ''));
    }
    return custom;
  }

  public async fetchTracks(params: Record<string, string | number>): Promise<Track[]> {
    const cacheKey = `tracks:${JSON.stringify(params)}`;
    const cached = this.getFromCache<Track[]>(cacheKey);
    if (cached) return cached;

    const customTracks = this.filterCustomTracks(params);
    const limit = Number(params.limit) || 20;
    const offset = Number(params.offset) || 0;

    const clientId = this.getClientId();
    const urlParams = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(limit + 5),
      include: 'musicinfo stats licenses',
      imagesize: '600',
      ...params
    });

    try {
      const response = await fetch(`${JAMENDO_BASE}/tracks/?${urlParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Jamendo API HTTP status ${response.status}`);
      }
      const json = await response.json();
      if (!json || !json.results || !Array.isArray(json.results) || (json.headers && json.headers.status === 'failed')) {
        throw new Error(json?.headers?.error_message || 'Invalid Jamendo response structure');
      }

      const apiTracks: Track[] = json.results.map((t: any) => ({
        id: String(t.id),
        name: t.name || 'Untitled Track',
        duration: Number(t.duration) || 180,
        artist_id: String(t.artist_id || ''),
        artist_name: t.artist_name || 'Independent Artist',
        album_name: t.album_name || 'Single',
        album_id: String(t.album_id || ''),
        album_image: t.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        audio: t.audio || '',
        audiodownload: t.audiodownload || t.audio,
        releasedate: t.releasedate || '',
        license_ccurl: t.license_ccurl || '',
        tags: (t.musicinfo?.tags?.tags || []).slice(0, 4),
        plays: t.stats?.rate_listened_total || Math.floor(Math.random() * 50000 + 5000),
        likes: t.stats?.likes_total || Math.floor(Math.random() * 4000 + 200)
      })).filter((t: Track) => t.audio && t.audio.startsWith('http'));

      const combined = [...customTracks];
      const existingIds = new Set(combined.map(c => c.id));
      for (const t of apiTracks) {
        if (!existingIds.has(t.id)) {
          combined.push(t);
          existingIds.add(t.id);
        }
      }

      const sliced = combined.slice(offset, offset + limit);
      if (sliced.length > 0) {
        this.setCache(cacheKey, sliced);
        return sliced;
      }
      throw new Error('No valid playable tracks returned');
    } catch (err) {
      // Seamlessly serve Creative Commons stream catalog (Zero-Config Fallback Mode)
      let filtered = [...FALLBACK_TRACKS];
      if (params.id) {
        const idStr = String(params.id);
        filtered = filtered.filter(t => t.id === idStr || (Array.isArray(params.id) && params.id.includes(t.id)));
      }
      if (params.artist_id) {
        filtered = filtered.filter(t => t.artist_id === String(params.artist_id));
      }
      if (params.album_id) {
        filtered = filtered.filter(t => t.album_id === String(params.album_id));
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(q) || 
          t.artist_name.toLowerCase().includes(q) || 
          t.album_name.toLowerCase().includes(q) ||
          t.tags?.some(tag => tag.toLowerCase().includes(q))
        );
      }
      if (params.tags) {
        const tag = String(params.tags).toLowerCase();
        filtered = filtered.filter(t => t.tags?.some(tTag => tTag.toLowerCase().includes(tag)));
      }
      if (params.order === 'popularity_total') {
        filtered.sort((a, b) => (b.plays || 0) - (a.plays || 0));
      } else if (params.order === 'releasedate_desc') {
        filtered.sort((a, b) => (b.releasedate || '').localeCompare(a.releasedate || ''));
      }

      const combined = [...customTracks];
      const existingIds = new Set(combined.map(c => c.id));
      for (const t of filtered) {
        if (!existingIds.has(t.id)) {
          combined.push(t);
          existingIds.add(t.id);
        }
      }

      const res = combined.slice(offset, offset + limit);
      return res;
    }
  }

  public async fetchAlbums(params: Record<string, string | number>): Promise<Album[]> {
    const cacheKey = `albums:${JSON.stringify(params)}`;
    const cached = this.getFromCache<Album[]>(cacheKey);
    if (cached) return cached;

    const clientId = this.getClientId();
    const urlParams = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(params.limit || 16),
      imagesize: '600',
      ...params
    });

    try {
      const response = await fetch(`${JAMENDO_BASE}/albums/?${urlParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const json = await response.json();
      if (!json.results || (json.headers && json.headers.status === 'failed')) throw new Error('Invalid albums structure');

      const albums: Album[] = json.results.map((a: any) => ({
        id: String(a.id),
        name: a.name || 'Untitled Album',
        releasedate: a.releasedate || '2025',
        artist_id: String(a.artist_id || ''),
        artist_name: a.artist_name || 'Independent Artist',
        image: a.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
        zip: a.zip
      }));

      if (albums.length > 0) {
        this.setCache(cacheKey, albums);
        return albums;
      }
      throw new Error('No valid albums returned');
    } catch (err) {
      let filtered = [...FALLBACK_ALBUMS];
      if (params.id) {
        filtered = filtered.filter(a => a.id === String(params.id));
      }
      if (params.artist_id) {
        filtered = filtered.filter(a => a.artist_id === String(params.artist_id));
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.artist_name.toLowerCase().includes(q));
      }
      const limit = Number(params.limit) || 16;
      const offset = Number(params.offset) || 0;
      const res = filtered.slice(offset, offset + limit);
      return res;
    }
  }

  public async fetchArtists(params: Record<string, string | number>): Promise<Artist[]> {
    const cacheKey = `artists:${JSON.stringify(params)}`;
    const cached = this.getFromCache<Artist[]>(cacheKey);
    if (cached) return cached;

    const clientId = this.getClientId();
    const urlParams = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(params.limit || 16),
      order: 'popularity_total',
      ...params
    });

    try {
      const response = await fetch(`${JAMENDO_BASE}/artists/?${urlParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const json = await response.json();
      if (!json.results || (json.headers && json.headers.status === 'failed')) throw new Error('Invalid artists structure');

      const artists: Artist[] = json.results.map((art: any) => ({
        id: String(art.id),
        name: art.name || 'Unknown Artist',
        website: art.website,
        joindate: art.joindate || '2024-01-01',
        image: art.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
      }));

      if (artists.length > 0) {
        this.setCache(cacheKey, artists);
        return artists;
      }
      throw new Error('No valid artists returned');
    } catch (err) {
      let filtered = [...FALLBACK_ARTISTS];
      if (params.id) {
        filtered = filtered.filter(a => a.id === String(params.id));
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(a => a.name.toLowerCase().includes(q));
      }
      const limit = Number(params.limit) || 16;
      const offset = Number(params.offset) || 0;
      const res = filtered.slice(offset, offset + limit);
      return res;
    }
  }
}

export const jamendo = new JamendoService();
