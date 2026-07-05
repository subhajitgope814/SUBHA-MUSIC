import React, { useState, useEffect } from 'react';
import { Users, Search, Play, Globe, Calendar, X, Music } from 'lucide-react';
import { Artist, Track } from '../types/index.js';
import { api } from '../services/api.js';
import { usePlayer } from '../context/PlayerContext.js';
import { formatDuration } from '../components/MusicCard.js';

export const ArtistsPage: React.FC = () => {
  const { playTrack } = usePlayer();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.getArtists({ search: q, limit: 24 });
      setArtists(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadArtists(searchQuery);
  };

  const openArtistModal = async (artist: Artist) => {
    setSelectedArtist(artist);
    setTracksLoading(true);
    try {
      const tracks = await api.getTracks({ artist_id: artist.id, limit: 12 });
      // if search by id returns empty, try searching artist name
      if (tracks.length === 0) {
        const byName = await api.getTracks({ search: artist.name, limit: 10 });
        setArtistTracks(byName);
      } else {
        setArtistTracks(tracks);
      }
    } catch (e) {
      setArtistTracks([]);
    } finally {
      setTracksLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Users className="h-6 w-6 text-purple-400" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Artists Directory</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">Discover independent musicians and creators across Jamendo.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter artists..."
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 animate-pulse">
              <div className="h-28 w-28 rounded-full bg-slate-800" />
              <div className="mt-4 h-4 w-3/4 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : artists.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base font-semibold text-slate-300">No artists found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => openArtistModal(artist)}
              className="group flex flex-col items-center rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition duration-300 hover:border-purple-500/50 hover:bg-slate-900 cursor-pointer text-center"
            >
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-slate-700/80 shadow-lg group-hover:border-purple-500 transition">
                <img
                  src={artist.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="mt-4 truncate w-full text-base font-bold text-white group-hover:text-purple-400">{artist.name}</h3>
              <span className="mt-1 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3" /> Joined {artist.joindate?.split('-')[0] || '2024'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Artist Tracks Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedArtist.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={selectedArtist.name}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedArtist.name}</h2>
                  {selectedArtist.website && (
                    <a
                      href={selectedArtist.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:underline mt-0.5"
                    >
                      <Globe className="h-3 w-3" /> Official Website
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedArtist(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300">Popular Tracks ({artistTracks.length})</h4>
              {artistTracks.length > 0 && (
                <button
                  onClick={() => playTrack(artistTracks[0], artistTracks)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
                >
                  <Play className="h-3.5 w-3.5 fill-white" /> Play Artist Flow
                </button>
              )}
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {tracksLoading ? (
                <p className="text-center py-10 text-sm text-slate-400">Loading artist catalog...</p>
              ) : artistTracks.length === 0 ? (
                <div className="text-center py-10">
                  <Music className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No streamable tracks found directly for this artist ID.</p>
                </div>
              ) : (
                artistTracks.map((t, idx) => (
                  <div
                    key={`art-tr-${t.id}-${idx}`}
                    onClick={() => playTrack(t, artistTracks)}
                    className="group flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-mono text-slate-500">{idx + 1}</span>
                      <img
                        src={t.album_image || selectedArtist.image}
                        alt={t.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h5 className="truncate text-sm font-medium text-white group-hover:text-purple-400">{t.name}</h5>
                        <p className="truncate text-xs text-slate-400">{t.album_name}</p>
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
