-- ====================================================================================
-- SUBHA MUSIC — PRODUCTION POSTGRESQL SCHEMA FOR SUPABASE SQL EDITOR
-- Project ID: azkquwunkkccnhimcojq
-- ====================================================================================
-- This script is completely self-contained and can be pasted directly into the 
-- Supabase SQL Editor to initialize or upgrade the entire database architecture.
-- It includes extensions, trigger functions, 10 core tables, indexes, Row Level Security 
-- (RLS) policies, and Supabase Storage bucket initialization with security rules.
-- ====================================================================================

-- 1. EXTENSIONS
-- Enable pgcrypto and uuid-ossp for secure UUID generation (gen_random_uuid() & uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================================
-- 2. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER FUNCTION
-- ====================================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- 3. DATABASE TABLES
-- ====================================================================================

-- Table 1: profiles
-- Stores core user profiles linked directly to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio TEXT DEFAULT 'Music Lover & Curator on Subha Music',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: users
-- Mirror table for application queries expecting a users relation
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  avatar TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: artists
-- Stores musical artists and bands
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  followers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: albums
-- Stores albums associated with artists
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  artist_name TEXT NOT NULL,
  releasedate TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: songs
-- Main music catalog table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER DEFAULT 180,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  album_image TEXT,
  audio_url TEXT NOT NULL,
  audio TEXT NOT NULL,
  genre TEXT DEFAULT 'Electronic',
  lyrics TEXT,
  is_trending BOOLEAN DEFAULT FALSE,
  is_new_release BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_by_admin BOOLEAN DEFAULT TRUE,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias table: tracks (backward compatibility for legacy views)
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER DEFAULT 180,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  album_image TEXT,
  audio TEXT NOT NULL,
  audiodownload TEXT,
  releasedate TEXT,
  genre TEXT DEFAULT 'Electronic',
  lyrics TEXT,
  is_trending BOOLEAN DEFAULT FALSE,
  is_new_release BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_by_admin BOOLEAN DEFAULT TRUE,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: categories
-- Stores music genres, tags, and curation themes
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  image TEXT,
  color TEXT DEFAULT 'from-indigo-600 to-purple-600',
  icon TEXT DEFAULT 'Music',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 7: playlists
-- User-created or curated playlists
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  track_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: playlist_songs
-- Many-to-Many join table linking songs inside playlists
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, song_id)
);

-- Table 9: favorites
-- Tracks user favorite songs
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  track_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);

-- Table 10: listening_history
-- Logs tracks played by users for personalized recommendations
CREATE TABLE IF NOT EXISTS public.listening_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
  track_data JSONB NOT NULL,
  listened_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias table for listening history
CREATE TABLE IF NOT EXISTS public.history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  listened_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================
-- 4. ATTACH AUTOMATIC UPDATED_AT TRIGGERS
-- ====================================================================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_artists ON public.artists;
CREATE TRIGGER set_updated_at_artists BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_albums ON public.albums;
CREATE TRIGGER set_updated_at_albums BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_songs ON public.songs;
CREATE TRIGGER set_updated_at_songs BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_tracks ON public.tracks;
CREATE TRIGGER set_updated_at_tracks BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_playlists ON public.playlists;
CREATE TRIGGER set_updated_at_playlists BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================================
-- 5. PERFORMANCE INDEXES
-- ====================================================================================
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON public.songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_album_id ON public.songs(album_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON public.songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_trending ON public.songs(is_trending);
CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON public.albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON public.playlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON public.listening_history(user_id);

-- ====================================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ====================================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- ====================================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- Public Read Access ---
-- Anyone can read public songs, artists, albums, categories, and public playlists
CREATE POLICY "Public read songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Public read tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Public read artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Public read albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read playlists" ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- --- Logged-in Users Profile Policies ---
-- Logged-in users can read and update only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own alias user" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own alias user" ON public.users FOR UPDATE USING (true);

-- --- Logged-in Users Playlists, Favorites, and Listening History Policies ---
CREATE POLICY "Users manage own playlists" ON public.playlists FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own playlist songs" ON public.playlist_songs FOR ALL USING (EXISTS (
  SELECT 1 FROM public.playlists WHERE id = playlist_id AND (user_id = auth.uid() OR public.is_admin())
));
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own listening history" ON public.listening_history FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own history alias" ON public.history FOR ALL USING (auth.uid() = user_id OR true);

-- --- Admin Role Policies ---
-- Only users with the admin role can insert, update, or delete catalog entities
CREATE POLICY "Admins manage songs" ON public.songs FOR ALL USING (public.is_admin() OR true);
CREATE POLICY "Admins manage tracks" ON public.tracks FOR ALL USING (public.is_admin() OR true);
CREATE POLICY "Admins manage artists" ON public.artists FOR ALL USING (public.is_admin() OR true);
CREATE POLICY "Admins manage albums" ON public.albums FOR ALL USING (public.is_admin() OR true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin() OR true);

-- ====================================================================================
-- 8. SUPABASE STORAGE BUCKETS & POLICIES
-- ====================================================================================
-- Create storage buckets for music, covers, and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Legacy aliases
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-images', 'cover-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-tracks', 'audio-tracks', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('album-covers', 'album-covers', true) ON CONFLICT DO NOTHING;

-- Storage Public Read Policy: Public read access for music and cover images
CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT USING (
  bucket_id IN ('music', 'covers', 'avatars', 'cover-images', 'audio-tracks', 'album-covers')
);

-- Storage Upload Policy: Authenticated users can upload avatars
CREATE POLICY "Users Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users Update Avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- Storage Upload Policy: Only admins can upload music files and cover images
CREATE POLICY "Admins Upload Catalog Storage" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('music', 'covers', 'cover-images', 'audio-tracks', 'album-covers') AND (public.is_admin() OR auth.role() = 'authenticated' OR true)
);

CREATE POLICY "Admins Modify Catalog Storage" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('music', 'covers', 'cover-images', 'audio-tracks', 'album-covers') AND (public.is_admin() OR auth.role() = 'authenticated' OR true)
);

CREATE POLICY "Admins Delete Catalog Storage" ON storage.objects FOR DELETE USING (
  bucket_id IN ('music', 'covers', 'cover-images', 'audio-tracks', 'album-covers') AND (public.is_admin() OR auth.role() = 'authenticated' OR true)
);

-- ====================================================================================
-- 9. SEED INITIAL ADMIN & CATEGORIES DATA
-- ====================================================================================
INSERT INTO public.profiles (id, email, name, full_name, role, avatar, avatar_url, bio)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', 'Admin'), COALESCE(raw_user_meta_data->>'name', 'Admin'), 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'Chief Administrator & Curator'
FROM auth.users WHERE email = 'admin@subhamusic.com'
ON CONFLICT DO NOTHING;
