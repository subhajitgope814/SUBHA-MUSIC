import React, { useState, useEffect } from 'react';
import { Heart, Play, Music, Compass } from 'lucide-react';
import { Track, PageRoute } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { MusicCard } from '../components/MusicCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';

interface FavoritesPageProps {
  setActivePage: (page: PageRoute) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ setActivePage }) => {
  const { favorites, playTrack } = usePlayer();
  const [favTracks, setFavTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteTracks();
  }, [favorites]);

  const loadFavoriteTracks = async () => {
    setLoading(true);
    try {
      if (favorites.length === 0) {
        setFavTracks([]);
        return;
      }
      // fetch trending and filter or query IDs
      const all = await api.getTracks({ limit: 50 });
      const matched = all.filter(t => favorites.includes(t.id));
      setFavTracks(matched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
            <Heart className="h-6 w-6 fill-white text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Favorite Songs</h1>
            <p className="text-sm text-slate-400">{favorites.length} saved liked tracks</p>
          </div>
        </div>

        {favTracks.length > 0 && (
          <button
            onClick={() => playTrack(favTracks[0], favTracks)}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition self-start sm:self-auto"
          >
            <Play className="h-4 w-4 fill-white" /> Play Favorites
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <SkeletonCard count={6} />
        </div>
      ) : favTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/40 py-20 px-4 text-center">
          <Music className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">Your Favorites List is Empty</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md">
            Click the heart icon on any music card while browsing Explore or Trending to save songs right here.
          </p>
          <button
            onClick={() => setActivePage('explore')}
            className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Compass className="h-4 w-4" /> Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favTracks.map((t, idx) => <MusicCard key={`fav-${t.id}-${idx}`} track={t} trackList={favTracks} />)}
        </div>
      )}
    </div>
  );
};
