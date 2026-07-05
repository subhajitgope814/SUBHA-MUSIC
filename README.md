# 🎧 SUBHA MUSIC — Complete Full-Stack Music Streaming Platform

<div align="center">
  <h3>Feel The Music • Own The Moment</h3>
  <p>A production-ready, full-stack music streaming platform built with <strong>React + Vite</strong>, <strong>Node.js + Express</strong>, <strong>Tailwind CSS</strong>, and <strong>Supabase</strong>.</p>
</div>

---

## ✨ Features & Architecture

### 🎵 Free & Legal Music Integration
Subha Music connects strictly to free and legally available music APIs under Creative Commons and decentralized open streaming licenses:
- **Primary Music API**: **Jamendo API v3** — Delivers high-quality independent tracks, albums, artists, and playlists.
- **Secondary Music API**: **Audius API** — Delivers trending decentralized electronic, pop, and indie tracks.
- **Server-Side Proxy Security**: All API requests and credentials (`JAMENDO_CLIENT_ID`, `AUDIUS_APP_NAME`, `JWT_SECRET`) are kept strictly on the Node.js Express server (`/api/*`), keeping API keys 100% hidden from client-side browsers.

### 🌟 Comprehensive Feature Suite
1. **Welcome Vibe Intro & Splash Screen**: Interactive glowing headphone ring logo, animated equalizer waveform, and welcome glassmorphic card.
2. **Home Page & Discovery**: Welcome header with search bar, horizontal category pills (`Recent`, `Top 50`, `Chill`, `R&B`, `Pop`, `EDM`), featured mixes (`R&B Playlist`, `Daily Mix 2`), and quick favorite access.
3. **Latest Songs & New Releases**: Real-time newest independent releases with skeleton card loading and infinite scroll / pagination.
4. **Trending Songs**: Ranked podium cards (Top 3 gold/silver/bronze badges) and grid view.
5. **Artists & Albums Catalogs**: Explore complete artist profiles and album tracklists with instant play.
6. **Multi-Entity Search**: Fast server-side live search filtering across Tracks, Artists, and Albums.
7. **Full-Featured Audio Player**: Fixed bottom bar + expandable Full-Screen Modal featuring:
   - Play, Pause, Next, Previous
   - Volume control & Mute toggle
   - Interactive Progress Scrubber with formatted timestamps
   - Repeat Mode (`Off` → `All` → `One`)
   - Shuffle Mode
   - Interactive Playback Queue Drawer
8. **User Library & Personalization**:
   - Save tracks to **Favorites** (`Heart` button).
   - Create, edit, delete, and organize custom **Playlists**.
   - **Recently Played** listening history tracked across sessions.
9. **Supabase Authentication & Hybrid Storage**:
   - Full JWT login and signup flows ready for **Supabase Auth & Database**.
   - **Zero-Configuration Fallback**: Automatically activates high-speed in-memory / local disk persistence (`.musichub_db.json`) if Supabase credentials are not provided so the app runs instantly out of the box!
10. **Responsive Dark Theme**: Modern slate/cosmic dark mode tailored for Mobile, Tablet, and Desktop displays.

---

## 🛠️ Tech Stack & Folder Structure

```text
├── server.ts                    # Node.js + Express API Server & Proxy
├── src/
│   ├── components/
│   │   ├── SubhaMusicLogo.tsx   # Custom SVG Headphone & Equalizer Logo
│   │   ├── WelcomeScreen.tsx    # Vibe Intro Splash Experience
│   │   ├── AudioPlayer.tsx      # Bottom Player Bar & Full Screen Modal
│   │   ├── MusicCard.tsx        # Track Card with Play & Favorite Toggle
│   │   ├── Navbar.tsx           # Responsive Header & Search Bar
│   │   ├── Sidebar.tsx          # Desktop Navigation Drawer
│   │   ├── QueueDrawer.tsx      # Playback Queue Manager
│   │   └── SkeletonCard.tsx     # Skeleton Loader for Fast UX
│   ├── pages/
│   │   ├── HomePage.tsx         # Discovery & Mockup Match UI
│   │   ├── ExplorePage.tsx      # Genre Filters & Infinite Scroll
│   │   ├── TrendingPage.tsx     # Ranked Top Charts
│   │   ├── LatestPage.tsx       # New Releases
│   │   ├── ArtistsPage.tsx      # Artist Directory
│   │   ├── AlbumsPage.tsx       # Album Catalog
│   │   ├── SearchPage.tsx       # Search Hub
│   │   ├── FavoritesPage.tsx    # Liked Songs Library
│   │   ├── PlaylistsPage.tsx    # Playlist Creator & Manager
│   │   ├── ProfilePage.tsx      # User Profile Management
│   │   ├── AdminPage.tsx        # Secure Role-Based Admin Portal
│   │   └── LoginPage.tsx        # Supabase / JWT Auth Screen
│   ├── context/                 # React Context (AuthContext, PlayerContext)
│   ├── services/                # API Client Services
│   └── server/                  # Jamendo & Audius Integration logic
├── supabase-schema.sql          # Complete Supabase Database & Storage Schema
├── .env.example                 # Environment variables specification
└── package.json                 # Scripts and dependencies
```

---

## 🚀 Local Installation & Run Instructions

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd subha-music
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env`:
```env
JAMENDO_CLIENT_ID="56d30c95"
AUDIUS_APP_NAME="SubhaMusic"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
JWT_SECRET="subhamusic_secret_key_2026"
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ⚡ Supabase Integration & Setup Guide

Subha Music features a complete, production-grade integration with **Supabase** across both frontend (React + Vite) and backend (Express + Node.js).

### 1. Environment Configuration Files
All environment variables are clearly documented in `.env.example`. For local development, copy `.env.example` into `.env` or `.env.local`:
```bash
cp .env.example .env.local
```

Configured Supabase credentials:
* **Project ID**: `azkquwunkkccnhimcojq`
* **VITE_SUPABASE_URL** / **SUPABASE_URL**: `https://azkquwunkkccnhimcojq.supabase.co`
* **VITE_SUPABASE_ANON_KEY** / **SUPABASE_ANON_KEY**: Read securely from your environment variables without hardcoding.

### 2. Complete SQL Schema & Storage Setup
Execute the comprehensive production script located in `supabase-schema.sql` directly inside your Supabase SQL Editor. This single script provisions:
1. **Tables (10 Production Tables)**:
   * `profiles` & `users`: User profiles with roles (`user`, `admin`).
   * `admin_users`: Explicit superadmin hierarchy table.
   * `songs` & `tracks`: Complete audio track catalog and metadata.
   * `artists`: Artist profiles and follower counts.
   * `albums`: Album collections linked to artists.
   * `categories`: Genre categories and curation banners.
   * `playlists`: Custom user & featured playlists.
   * `playlist_songs`: M:N junction table connecting songs to playlists.
   * `favorites`: User bookmarked tracks.
   * `listening_history` & `history`: Timestamped user play logs.
2. **Row Level Security (RLS)**:
   * Secure policies enabled on all tables for public browsing, authenticated user management, and admin full CRUD access.
3. **Storage Buckets & Policies**:
   * Auto-provisions public buckets: `music` and `cover-images` (with backward-compatible aliases `audio-tracks` and `album-covers`).

---

## 🌍 Production Deployment Guide

### 1. Database Setup on Supabase
1. Open your project dashboard at [Supabase.com](https://supabase.com).
2. Go to **SQL Editor**, paste the contents of `supabase-schema.sql`, and click **Run**.
3. All primary keys, foreign keys, performance indexes, RLS policies, and storage buckets are created instantly!

### 2. Backend Deployment on Render
1. Create a new **Web Service** on [Render.com](https://render.com) connected to your repository.
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `npm start`
4. Add Environment Variables in Render settings:
   - `JAMENDO_CLIENT_ID`, `AUDIUS_APP_NAME`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `NODE_ENV=production`.
5. Copy your Render backend domain (e.g., `https://subha-music-backend.onrender.com`).

### 3. Frontend Deployment on Netlify
1. Create a new site on [Netlify](https://netlify.com) connected to your repository.
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. In Netlify Site Settings → Environment Variables, add:
   - `VITE_API_BASE_URL`: Point to your Render backend URL (`https://subha-music-backend.onrender.com/api`).
5. Add a `_redirects` file or netlify rewrite rule if proxying directly:
   ```text
   /api/*  https://subha-music-backend.onrender.com/api/:splat  200
   /*      /index.html   200
   ```

---

## 🎧 Demo Credentials
To test the platform immediately without registration:
- **Demo User**: `alex@example.com` / `password123`
- **Admin User**: `admin@subhamusic.com` / `adminpassword123`
