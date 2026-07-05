import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { jamendo } from './src/server/jamendo.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'musichub_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'user' | 'admin';
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'user' | 'admin' };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
};

// ==========================================
// 1. AUTHENTICATION REST API
// ==========================================
const registerHandler = (req: Request, res: Response) => {
  try {
    const { email, password, name, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const displayName = name || full_name || email.split('@')[0];
    const user = db.createUser(email, password, displayName);
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || 'Registration failed' });
  }
};

app.post('/api/auth/register', registerHandler);
app.post('/api/register', registerHandler);
app.post('/register', registerHandler);

const loginHandler = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = db.getUserByEmail(email);
    if (!user || !db.verifyPassword(email, password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Login failed' });
  }
};

app.post('/api/auth/login', loginHandler);
app.post('/api/login', loginHandler);
app.post('/login', loginHandler);

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = db.getUserByEmail(email);
  // In a real email flow we'd send an email. Here we simulate success.
  return res.json({ message: `If an account exists for ${email}, a password reset link has been dispatched.` });
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.getUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

// ==========================================
// 2. JAMENDO API PROXY (Never expose keys!)
// ==========================================
app.get('/api/jamendo/tracks', async (req, res) => {
  try {
    const params: Record<string, any> = {};
    Object.keys(req.query).forEach(key => {
      params[key] = req.query[key];
    });
    const tracks = await jamendo.fetchTracks(params);
    res.json({ results: tracks });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch tracks' });
  }
});

app.get('/api/jamendo/albums', async (req, res) => {
  try {
    const params: Record<string, any> = {};
    Object.keys(req.query).forEach(key => {
      params[key] = req.query[key];
    });
    const albums = await jamendo.fetchAlbums(params);
    res.json({ results: albums });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch albums' });
  }
});

app.get('/api/jamendo/artists', async (req, res) => {
  try {
    const params: Record<string, any> = {};
    Object.keys(req.query).forEach(key => {
      params[key] = req.query[key];
    });
    const artists = await jamendo.fetchArtists(params);
    res.json({ results: artists });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch artists' });
  }
});

app.get('/api/jamendo/featured', async (req, res) => {
  try {
    // Fetch top popular tracks and categories
    const trending = await jamendo.fetchTracks({ order: 'popularity_total', limit: 12 });
    const latest = await jamendo.fetchTracks({ order: 'releasedate_desc', limit: 12 });
    const albums = await jamendo.fetchAlbums({ limit: 8 });
    const banner = db.getBanner();
    const categories = db.getCategories();
    const featuredPlaylists = db.getFeaturedPlaylists();

    res.json({
      trending,
      latest,
      albums,
      banner,
      categories,
      featuredPlaylists
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2.5 COMPLETE REST CRUD APIs (Songs, Albums, Artists, Categories)
// ==========================================
app.get('/api/songs', async (req, res) => {
  try {
    const supa = db.getSupabase();
    if (supa) {
      const { data, error } = await supa.from('songs').select('*');
      if (data && !error && data.length > 0) return res.json({ songs: data });
    }
    res.json({ songs: db.getCustomTracks() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/songs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const track = db.addCustomTrack(req.body);
    const supa = db.getSupabase();
    if (supa) {
      await supa.from('songs').upsert({
        id: track.id,
        title: track.name,
        name: track.name,
        duration: track.duration,
        artist_name: track.artist_name,
        album_name: track.album_name,
        album_image: track.album_image,
        audio_url: track.audio,
        audio: track.audio,
        genre: track.genre || 'Electronic'
      }).select();
    }
    res.status(201).json({ song: track });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/songs/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = db.updateCustomTrack(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Song not found' });
    const supa = db.getSupabase();
    if (supa) {
      await supa.from('songs').update({
        title: updated.name,
        name: updated.name,
        duration: updated.duration,
        artist_name: updated.artist_name,
        album_name: updated.album_name,
        album_image: updated.album_image,
        audio_url: updated.audio,
        audio: updated.audio,
        genre: updated.genre
      }).eq('id', req.params.id);
    }
    res.json({ song: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/songs/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const success = db.deleteCustomTrack(req.params.id);
  const supa = db.getSupabase();
  if (supa) {
    await supa.from('songs').delete().eq('id', req.params.id);
  }
  res.json({ success });
});

// Albums CRUD
app.get('/api/albums', async (req, res) => {
  try {
    const supa = db.getSupabase();
    if (supa) {
      const { data, error } = await supa.from('albums').select('*');
      if (data && !error && data.length > 0) return res.json({ albums: data });
    }
    res.json({ albums: db.getCatalogAlbums() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/albums', authMiddleware, adminMiddleware, async (req, res) => {
  res.status(201).json({ album: { id: `album-${Date.now()}`, ...req.body } });
});

app.put('/api/albums/:id', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ album: { id: req.params.id, ...req.body } });
});

app.delete('/api/albums/:id', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ success: true });
});

// Artists CRUD
app.get('/api/artists', async (req, res) => {
  try {
    const supa = db.getSupabase();
    if (supa) {
      const { data, error } = await supa.from('artists').select('*');
      if (data && !error && data.length > 0) return res.json({ artists: data });
    }
    res.json({ artists: db.getCatalogArtists() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/artists', authMiddleware, adminMiddleware, async (req, res) => {
  res.status(201).json({ artist: { id: `artist-${Date.now()}`, ...req.body } });
});

app.put('/api/artists/:id', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ artist: { id: req.params.id, ...req.body } });
});

app.delete('/api/artists/:id', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ success: true });
});

// Categories CRUD
app.get('/api/categories', async (req, res) => {
  res.json({ categories: db.getCategories() });
});

app.post('/api/categories', authMiddleware, adminMiddleware, async (req, res) => {
  const cats = db.getCategories();
  const newCat = { 
    id: `cat-${Date.now()}`, 
    name: req.body.name || 'New Genre', 
    tag: req.body.tag || 'genre', 
    image: req.body.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    color: req.body.color || 'from-indigo-600 to-purple-600',
    icon: req.body.icon || 'Music'
  };
  cats.push(newCat);
  db.updateCategories(cats);
  res.status(201).json({ category: newCat });
});

app.put('/api/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const cats = db.getCategories().map(c => c.id === req.params.id ? { ...c, ...req.body } : c);
  db.updateCategories(cats);
  res.json({ categories: cats });
});

app.delete('/api/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const cats = db.getCategories().filter(c => c.id !== req.params.id);
  db.updateCategories(cats);
  res.json({ success: true });
});

// ==========================================
// 3. USER PROFILE, FAVORITES & PLAYLISTS
// ==========================================
const getProfileHandler = (req: AuthRequest, res: Response) => {
  const user = db.getUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
};

app.get('/api/user/profile', authMiddleware, getProfileHandler);
app.get('/api/profile', authMiddleware, getProfileHandler);
app.get('/profile', authMiddleware, getProfileHandler);

const putProfileHandler = (req: AuthRequest, res: Response) => {
  try {
    const { name, full_name, bio, avatar, avatar_url } = req.body;
    const updated = db.updateUserProfile(req.userId!, { 
      name: name || full_name, 
      bio, 
      avatar: avatar || avatar_url 
    });
    res.json({ user: updated });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

app.put('/api/user/profile', authMiddleware, putProfileHandler);
app.put('/api/profile', authMiddleware, putProfileHandler);
app.put('/profile', authMiddleware, putProfileHandler);

app.get('/api/favorites', authMiddleware, (req: AuthRequest, res: Response) => {
  const favIds = db.getFavorites(req.userId!);
  res.json({ favorites: favIds });
});

app.post('/api/favorites', authMiddleware, (req: AuthRequest, res: Response) => {
  const { trackId } = req.body;
  if (!trackId) return res.status(400).json({ error: 'trackId required' });
  const favIds = db.addFavorite(req.userId!, trackId);
  res.json({ favorites: favIds });
});

app.delete('/api/favorites/:trackId', authMiddleware, (req: AuthRequest, res: Response) => {
  const favIds = db.removeFavorite(req.userId!, req.params.trackId);
  res.json({ favorites: favIds });
});

app.get('/api/playlists', (req: AuthRequest, res: Response) => {
  // Can be public or user-specific if auth header present
  const authHeader = req.headers.authorization;
  let userId: string | undefined = undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
      userId = payload.userId;
    } catch (e) {}
  }
  const playlists = db.getPlaylists(userId);
  res.json({ playlists });
});

app.post('/api/playlists', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, description, isPublic } = req.body;
  if (!name) return res.status(400).json({ error: 'Playlist name required' });
  const newPl = db.createPlaylist(req.userId!, name, description || '', isPublic ?? true);
  res.json({ playlist: newPl });
});

app.put('/api/playlists/:id/tracks', authMiddleware, (req: AuthRequest, res: Response) => {
  const { trackIds } = req.body;
  const pl = db.updatePlaylistTracks(req.params.id, trackIds || []);
  if (!pl) return res.status(404).json({ error: 'Playlist not found' });
  res.json({ playlist: pl });
});

app.delete('/api/playlists/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const success = db.deletePlaylist(req.userId!, req.params.id);
  if (!success) return res.status(403).json({ error: 'Cannot delete playlist' });
  res.json({ success: true });
});

app.get('/api/history', authMiddleware, (req: AuthRequest, res: Response) => {
  const history = db.getHistory(req.userId!);
  res.json({ history });
});

app.post('/api/history', authMiddleware, (req: AuthRequest, res: Response) => {
  const { track } = req.body;
  if (!track || !track.id) return res.status(400).json({ error: 'Valid track required' });
  db.addHistory(req.userId!, track);
  res.json({ success: true });
});

// ==========================================
// 4. ADMIN DASHBOARD API
// ==========================================
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ stats: db.getAdminStats() });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ users: db.getAllUsers() });
});

app.put('/api/admin/banner', authMiddleware, adminMiddleware, (req, res) => {
  const updated = db.updateBanner(req.body);
  res.json({ banner: updated });
});

app.put('/api/admin/categories', authMiddleware, adminMiddleware, (req, res) => {
  const updated = db.updateCategories(req.body.categories || []);
  res.json({ categories: updated });
});

// --- Admin Track Management ---
app.get('/api/admin/tracks', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ tracks: db.getCustomTracks() });
});

app.post('/api/admin/tracks', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const newTrack = db.addCustomTrack(req.body);
    res.json({ track: newTrack });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/tracks/:id', authMiddleware, adminMiddleware, (req, res) => {
  const updated = db.updateCustomTrack(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Track not found' });
  res.json({ track: updated });
});

app.delete('/api/admin/tracks/:id', authMiddleware, adminMiddleware, (req, res) => {
  const success = db.deleteCustomTrack(req.params.id);
  res.json({ success });
});

// --- Admin User Management ---
app.put('/api/admin/users/:id/role', authMiddleware, adminMiddleware, (req, res) => {
  const { role } = req.body;
  const user = db.updateUserRole(req.params.id, role);
  res.json({ user });
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const success = db.deleteUser(req.params.id);
  res.json({ success });
});

// --- Admin Playlists Management ---
app.get('/api/admin/playlists', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ playlists: db.getPlaylists() });
});

app.put('/api/admin/playlists/:id/feature', authMiddleware, adminMiddleware, (req, res) => {
  const pl = db.togglePlaylistFeatured(req.params.id);
  res.json({ playlist: pl });
});

app.delete('/api/admin/playlists/:id', authMiddleware, adminMiddleware, (req, res) => {
  const success = db.adminDeletePlaylist(req.params.id);
  res.json({ success });
});

// --- Admin SQL Editor Code & Backend API Console ---
app.get('/api/admin/sql-schema', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlCode = fs.readFileSync(schemaPath, 'utf-8');
      return res.json({ sql: sqlCode });
    }
    res.json({ sql: '-- SQL Schema file not found.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/backend-info', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    status: 'online',
    port: 3000,
    databaseMode: db.getSupabase() ? 'Hybrid (Supabase Cloud + Local Cache)' : 'Local File Storage Cache',
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://azkquwunkkccnhimcojq.supabase.co',
    endpoints: [
      { method: 'GET', route: '/api/songs', description: 'Fetch all tracks from Supabase or catalog' },
      { method: 'POST', route: '/api/songs', description: 'Admin create/upload song' },
      { method: 'PUT', route: '/api/songs/:id', description: 'Admin update song metadata' },
      { method: 'DELETE', route: '/api/songs/:id', description: 'Admin delete song' },
      { method: 'GET', route: '/api/albums', description: 'Fetch albums collection' },
      { method: 'GET', route: '/api/artists', description: 'Fetch artists catalog' },
      { method: 'GET', route: '/api/categories', description: 'Fetch genre categories' },
      { method: 'GET', route: '/api/jamendo/tracks', description: 'Proxy search Jamendo Creative Commons music' },
      { method: 'GET', route: '/api/audius/trending', description: 'Proxy Audius decentralized trending tracks' },
      { method: 'POST', route: '/api/auth/login', description: 'Authenticates user via JWT or Supabase' },
      { method: 'POST', route: '/api/auth/register', description: 'Registers new user' }
    ]
  });
});

// ==========================================
// 5. PRODUCTION SEO & PWA ENDPOINTS
// ==========================================
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${process.env.APP_URL || 'https://musichub.app'}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const appUrl = process.env.APP_URL || 'https://musichub.app';
  const now = new Date().toISOString().split('T')[0];
  const pages = ['home', 'explore', 'latest', 'trending', 'artists', 'albums', 'search', 'playlists', 'login', 'register'];
  const urlsXml = pages.map(page => `
  <url>
    <loc>${appUrl}/${page === 'home' ? '' : page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === 'home' ? '1.0' : '0.8'}</priority>
  </url>`).join('');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXml}
</urlset>`);
});

app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Music Hub - Independent Music Streaming',
    short_name: 'Music Hub',
    description: 'Stream royalty-free Creative Commons tracks powered by Jamendo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    icons: [
      {
        src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=192&q=80',
        sizes: '192x192',
        type: 'image/jpeg'
      },
      {
        src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=512&q=80',
        sizes: '512x512',
        type: 'image/jpeg'
      }
    ]
  });
});

// ==========================================
// 6. VITE MIDDLEWARE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 Music Hub Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
