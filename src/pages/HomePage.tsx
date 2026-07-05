import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Flame, Clock, Compass, ListMusic, ChevronRight, RefreshCw, Search, Heart, Pause } from 'lucide-react';
import { Track, Album, BannerConfig, Category, Playlist, PageRoute } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { MusicCard, formatDuration } from '../components/MusicCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';

interface HomePageProps {
  setActivePage: (page: PageRoute) => void;
  onSelectCategory: (tag: string) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActivePage, onSelectCategory, onSelectPlaylist }) => {
  const { history, playTrack, currentTrack, isPlaying, togglePlayPause, favorites, toggleFavorite } = usePlayer();
  const [trending, setTrending] = useState<Track[]>([]);
  const [latest, setLatest] = useState<Track[]>([]);
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Mockup UI States
  const [activePill, setActivePill] = useState<string>('Recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryPills = ['Recent', 'Top 50', 'Chill', 'R&B', 'Pop', 'EDM', 'Lo-Fi', 'Rock'];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getFeatured();
      setTrending(data.trending || []);
      setLatest(data.latest || []);
      setBanner(data.banner);
      setCategories(data.categories || []);
      setFeaturedPlaylists(data.featuredPlaylists || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tracks for "Your favourites / mockup list" based on pill and search
  const mockupTracks = trending.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.artist_name.toLowerCase().includes(q);
    }
    if (activePill === 'Top 50') return t.tags?.includes('top50') || t.plays && t.plays > 500000;
    if (activePill === 'Chill') return t.tags?.includes('chill') || t.tags?.includes('lofi');
    if (activePill === 'R&B') return t.tags?.includes('rnb');
    if (activePill === 'Pop') return t.tags?.includes('pop');
    return true;
  }).slice(0, 6);

  return (
    <div className="space-y-10 pb-24">
      
      {/* --- MOCKUP DESIGN HERO & DISCOVERY SECTION (Matches Image 2 Screen 2) --- */}
      <section className="space-y-6 pt-2">
        {/* Welcome Back Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back!
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-400 font-medium">
            What do you feel like today?
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search song, playlist, artist..."
            className="w-full rounded-2xl bg-slate-900/90 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-[#9B51E0] focus:outline-none focus:ring-1 focus:ring-[#9B51E0] shadow-inner transition"
          />
        </div>

        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categoryPills.map((pill) => {
            const isActive = activePill === pill;
            return (
              <button
                key={pill}
                onClick={() => setActivePill(pill)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#9B51E0] to-[#8A2BE2] text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Featured Mix Cards (R&B Playlist / Daily Mix 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {featuredPlaylists.slice(0, 2).map((pl, idx) => (
            <div
              key={`feat-pl-${pl.id}-${idx}`}
              onClick={() => onSelectPlaylist(pl)}
              className="group relative flex items-center justify-between rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 transition duration-300 hover:border-[#9B51E0]/50 hover:bg-slate-900 cursor-pointer overflow-hidden shadow-lg"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-800 shadow-md">
                  <img
                    src={pl.coverImage}
                    alt={pl.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-8 w-8 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-white group-hover:text-[#9B51E0] transition">{pl.name}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-400">{pl.description}</p>
                </div>
              </div>
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 group-hover:bg-[#9B51E0] group-hover:text-white transition">
                <Play className="h-5 w-5 fill-current ml-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Your favourites Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Your favourites</h2>
            <button onClick={() => setActivePage('favorites')} className="text-xs font-semibold text-[#9B51E0] hover:underline">
              See all
            </button>
          </div>

          <div className="space-y-2.5">
            {mockupTracks.map((track, idx) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              const isFav = favorites.includes(track.id);
              return (
                <div
                  key={`fav-${track.id}-${idx}`}
                  onClick={() => playTrack(track, mockupTracks)}
                  className="group flex items-center justify-between rounded-2xl border border-slate-900 bg-slate-900/40 p-3 hover:bg-slate-900/90 hover:border-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow">
                      <img
                        src={track.album_image}
                        alt={track.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                        {isPlayingThis ? (
                          <Pause className="h-5 w-5 fill-white text-white" />
                        ) : (
                          <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`truncate text-sm font-bold ${isPlayingThis ? 'text-[#9B51E0]' : 'text-white'}`}>
                        {track.name}
                      </h4>
                      <p className="truncate text-xs text-slate-400 font-medium">{track.artist_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className={`p-1.5 rounded-full transition ${isFav ? 'text-rose-500' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>
                    <span className="text-xs font-mono text-slate-400 w-10 text-right">
                      {formatDuration(track.duration || 249)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      {banner && banner.active && (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 shadow-2xl">
          <div className="absolute inset-0">
            <img
              src={banner.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80'}
              alt="Banner"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-10 lg:p-14 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Featured Collection
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              {banner.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              {banner.subtitle}
            </p>
            
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {trending.length > 0 && (
                <button
                  onClick={() => playTrack(trending[0], trending)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/40 transition hover:bg-indigo-500 hover:scale-105 active:scale-95"
                >
                  <Play className="h-5 w-5 fill-white" /> Stream Top Chart
                </button>
              )}
              <button
                onClick={() => setActivePage('explore')}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Browse Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue Listening Section */}
      {history.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Continue Listening</h2>
            </div>
            <span className="text-xs text-slate-400">Recently played ({history.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {history.slice(0, 4).map((track, idx) => (
              <div
                key={`hist-${track.id}-${idx}`}
                onClick={() => playTrack(track, history)}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 transition hover:border-indigo-500/40 hover:bg-slate-900 cursor-pointer"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                  <img
                    src={track.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                    alt={track.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-6 w-6 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-white group-hover:text-indigo-400">{track.name}</h4>
                  <p className="truncate text-xs text-slate-400">{track.artist_name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Bar */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Browse Genres & Moods</h2>
          </div>
          <button onClick={() => setActivePage('explore')} className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            See All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.tag)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-4 transition duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer min-h-[90px] flex flex-col justify-between`}
            >
              <h3 className="text-sm font-bold text-white z-10 leading-snug">{cat.name}</h3>
              <span className="text-[10px] font-mono uppercase text-white/80 tracking-wider">#{cat.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Tracks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Flame className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Trending Now on Jamendo</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setActivePage('trending')} className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
              Top Charts <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            <SkeletonCard count={6} />
          ) : (
            trending.slice(0, 6).map((track, idx) => (
              <MusicCard key={`trend-${track.id}-${idx}`} track={track} trackList={trending} />
            ))
          )}
        </div>
      </section>

      {/* Featured Curated Playlists */}
      {featuredPlaylists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <ListMusic className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Featured Playlists</h2>
            </div>
            <button onClick={() => setActivePage('playlists')} className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
              All Playlists <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredPlaylists.map((pl, idx) => (
              <div
                key={`all-pl-${pl.id}-${idx}`}
                onClick={() => onSelectPlaylist(pl)}
                className="group relative flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition duration-300 hover:border-indigo-500/40 hover:bg-slate-900 cursor-pointer"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow-lg">
                  <img
                    src={pl.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'}
                    alt={pl.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-8 w-8 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 mb-1">
                    Curated Flow
                  </span>
                  <h4 className="truncate text-base font-bold text-white group-hover:text-indigo-400">{pl.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400 leading-relaxed">{pl.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Releases */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Latest Independent Drops</h2>
          </div>
          <button onClick={() => setActivePage('latest')} className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            See All Latest <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            <SkeletonCard count={6} />
          ) : (
            latest.slice(0, 6).map((track, idx) => (
              <MusicCard key={`lat-${track.id}-${idx}`} track={track} trackList={latest} />
            ))
          )}
        </div>
      </section>

    </div>
  );
};
