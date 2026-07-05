import React, { useState, useEffect } from 'react';
import { Music, Disc, Search, Play, X, Download } from 'lucide-react';
import { Album, Track } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { formatDuration } from '../components/MusicCard.js';

export const AlbumsPage: React.FC = () => {
  const { playTrack } = usePlayer();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.getAlbums({ search: q, limit: 24 });
      setAlbums(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAlbums(searchQuery);
  };

  const openAlbumModal = async (album: Album) => {
    setSelectedAlbum(album);
    setTracksLoading(true);
    try {
      const tracks = await api.getTracks({ album_id: album.id, limit: 16 });
      if (tracks.length === 0) {
        const byAlbumName = await api.getTracks({ search: album.name, limit: 10 });
        setAlbumTracks(byAlbumName);
      } else {
        setAlbumTracks(tracks);
      }
    } catch (e) {
      setAlbumTracks([]);
    } finally {
      setTracksLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Disc className="h-6 w-6 text-pink-400 animate-spin" style={{ animationDuration: '12s' }} />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Albums Releases</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">Complete independent records and albums released under Creative Commons.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search albums..."
              className="w-full rounded-xl bg-slate-900 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 animate-pulse">
              <div className="aspect-square w-full rounded-xl bg-slate-800" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base font-semibold text-slate-300">No albums found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => openAlbumModal(album)}
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 transition duration-300 hover:border-pink-500/40 hover:bg-slate-900 cursor-pointer"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-800 shadow-md">
                <img
                  src={album.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80'}
                  alt={album.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <Play className="h-8 w-8 fill-white text-white ml-0.5" />
                </div>
              </div>

              <div className="mt-3 min-w-0">
                <h4 className="truncate text-sm font-bold text-white group-hover:text-pink-400">{album.name}</h4>
                <p className="truncate text-xs text-slate-400 font-medium">{album.artist_name}</p>
                <span className="mt-1 block text-[11px] text-slate-500">{album.releasedate?.split('-')[0] || '2025'} Release</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album Tracks Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedAlbum.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=200&q=80'}
                  alt={selectedAlbum.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-xl object-cover border border-slate-700 shadow-md"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAlbum.name}</h2>
                  <p className="text-sm text-slate-300 font-medium">{selectedAlbum.artist_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300">Album Tracks ({albumTracks.length})</h4>
              {albumTracks.length > 0 && (
                <button
                  onClick={() => playTrack(albumTracks[0], albumTracks)}
                  className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-pink-500"
                >
                  <Play className="h-3.5 w-3.5 fill-white" /> Play Album Flow
                </button>
              )}
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {tracksLoading ? (
                <p className="text-center py-10 text-sm text-slate-400">Loading tracks...</p>
              ) : albumTracks.length === 0 ? (
                <div className="text-center py-10">
                  <Music className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No streamable tracks found directly for this album.</p>
                </div>
              ) : (
                albumTracks.map((t, idx) => (
                  <div
                    key={`alb-tr-${t.id}-${idx}`}
                    onClick={() => playTrack(t, albumTracks)}
                    className="group flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-mono text-slate-500">{idx + 1}</span>
                      <div className="min-w-0">
                        <h5 className="truncate text-sm font-medium text-white group-hover:text-pink-400">{t.name}</h5>
                        <p className="truncate text-xs text-slate-400">{t.artist_name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{formatDuration(t.duration)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
