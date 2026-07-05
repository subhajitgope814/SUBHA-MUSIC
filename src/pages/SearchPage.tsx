import React, { useState, useEffect } from 'react';
import { Search, Music, Users, Disc } from 'lucide-react';
import { Track, Artist, Album } from '../types/index.js';
import { api } from '../services/api.js';
import { MusicCard } from '../components/MusicCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';

interface SearchPageProps {
  initialQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery, setSearchQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'artists' | 'albums'>('all');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const runSearch = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setLoading(true);
    try {
      const [tRes, artRes, albRes] = await Promise.all([
        api.getTracks({ search: searchStr, limit: 18 }),
        api.getArtists({ search: searchStr, limit: 8 }),
        api.getAlbums({ search: searchStr, limit: 8 })
      ]);
      setTracks(tRes);
      setArtists(artRes);
      setAlbums(albRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => {
        runSearch(query);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      // load default trending if query empty
      runSearch('neon');
    }
  }, [query]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
    runSearch(query);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Search Catalog</h1>
        <p className="mt-1 text-sm text-slate-400">Search over 500k songs, independent bands, and albums.</p>

        <form onSubmit={handleFormSubmit} className="mt-6 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search by song name, artist, tag, or album..."
              className="w-full rounded-2xl bg-slate-900 py-3.5 pl-12 pr-4 text-base text-white placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none shadow-lg"
            />
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'tracks', label: `Tracks (${tracks.length})` },
            { id: 'artists', label: `Artists (${artists.length})` },
            { id: 'albums', label: `Albums (${albums.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <SkeletonCard count={12} />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Tracks Section */}
          {(activeTab === 'all' || activeTab === 'tracks') && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Music className="h-5 w-5 text-indigo-400" /> Songs matching "{query || 'Neon'}"
              </h3>
              {tracks.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No tracks matched.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {tracks.map((t, idx) => <MusicCard key={`search-${t.id}-${idx}`} track={t} trackList={tracks} />)}
                </div>
              )}
            </div>
          )}

          {/* Artists Section */}
          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" /> Artists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {artists.map(art => (
                  <div key={art.id} className="flex flex-col items-center rounded-2xl bg-slate-900/60 p-4 border border-slate-800 text-center">
                    <img
                      src={art.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={art.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-full object-cover border border-slate-700"
                    />
                    <h4 className="mt-2 truncate w-full text-xs font-bold text-white">{art.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Disc className="h-5 w-5 text-pink-400" /> Albums
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {albums.map(alb => (
                  <div key={alb.id} className="flex flex-col rounded-2xl bg-slate-900/60 p-3 border border-slate-800">
                    <img
                      src={alb.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80'}
                      alt={alb.name}
                      referrerPolicy="no-referrer"
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <h4 className="mt-2 truncate text-xs font-bold text-white">{alb.name}</h4>
                    <span className="truncate text-[10px] text-slate-400">{alb.artist_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
