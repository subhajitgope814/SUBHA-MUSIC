import React, { useState, useEffect } from 'react';
import { ListMusic, Plus, Play, Trash2, Globe, Lock, X, Music } from 'lucide-react';
import { Playlist, Track } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { formatDuration } from '../components/MusicCard.js';

interface PlaylistsPageProps {
  initialPlaylist?: Playlist | null;
}

export const PlaylistsPage: React.FC<PlaylistsPageProps> = ({ initialPlaylist }) => {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(initialPlaylist || null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  // Modal form for creating playlist
  const [createModal, setCreateModal] = useState(false);
  const [plName, setPlName] = useState('');
  const [plDesc, setPlDesc] = useState('');
  const [plPublic, setPlPublic] = useState(true);

  useEffect(() => {
    if (initialPlaylist) {
      openPlaylistDetail(initialPlaylist);
    }
  }, [initialPlaylist]);

  useEffect(() => {
    loadPlaylists();
  }, [user]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const pl = await api.getPlaylists();
      setPlaylists(pl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPlaylistDetail = async (pl: Playlist) => {
    setSelectedPlaylist(pl);
    setTracksLoading(true);
    try {
      if (!pl.trackIds || pl.trackIds.length === 0) {
        setPlaylistTracks([]);
      } else {
        const all = await api.getTracks({ limit: 50 });
        const matched = all.filter(t => pl.trackIds.includes(t.id));
        setPlaylistTracks(matched);
      }
    } catch (e) {
      setPlaylistTracks([]);
    } finally {
      setTracksLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plName.trim()) return;
    try {
      const newPl = await api.createPlaylist(plName.trim(), plDesc.trim(), plPublic);
      setPlaylists(prev => [...prev, newPl]);
      setCreateModal(false);
      setPlName('');
      setPlDesc('');
      openPlaylistDetail(newPl);
    } catch (err: any) {
      alert(err.message || 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (plId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      const success = await api.deletePlaylist(plId);
      if (success) {
        setPlaylists(prev => prev.filter(p => p.id !== plId));
        if (selectedPlaylist?.id === plId) setSelectedPlaylist(null);
      } else {
        alert('Could not delete playlist.');
      }
    } catch (err) {
      alert('Error deleting playlist.');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30">
            <ListMusic className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Playlists</h1>
            <p className="text-sm text-slate-400">Curated music flows and custom user playlists</p>
          </div>
        </div>

        {user ? (
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create Playlist
          </button>
        ) : (
          <span className="text-xs text-slate-500">Sign in to create personal playlists</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400">No playlists available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => openPlaylistDetail(pl)}
              className="group relative flex items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition duration-300 hover:border-purple-500/40 hover:bg-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow-md">
                  <img
                    src={pl.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'}
                    alt={pl.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-6 w-6 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="truncate text-base font-bold text-white group-hover:text-purple-400">{pl.name}</h4>
                    {pl.isPublic ? <Globe className="h-3.5 w-3.5 text-slate-500" title="Public" /> : <Lock className="h-3.5 w-3.5 text-amber-500" title="Private" />}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">{pl.description || 'Custom playlist'}</p>
                  <span className="mt-1 block text-[11px] text-slate-500 font-mono">{pl.trackIds.length} tracks</span>
                </div>
              </div>

              {(user && (user.id === pl.userId || user.role === 'admin')) && (
                <button
                  onClick={(e) => handleDeletePlaylist(pl.id, e)}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                  title="Delete playlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPlaylist.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80'}
                  alt={selectedPlaylist.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-xl object-cover border border-slate-700 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedPlaylist.name}</h2>
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      Playlist
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{selectedPlaylist.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300">Tracks inside playlist ({playlistTracks.length})</h4>
              {playlistTracks.length > 0 && (
                <button
                  onClick={() => playTrack(playlistTracks[0], playlistTracks)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
                >
                  <Play className="h-3.5 w-3.5 fill-white" /> Play Playlist Flow
                </button>
              )}
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {tracksLoading ? (
                <p className="text-center py-10 text-sm text-slate-400">Loading playlist tracks...</p>
              ) : playlistTracks.length === 0 ? (
                <div className="text-center py-10">
                  <Music className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No tracks added to this playlist yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Browse tracks and click the (+) button to save them here.</p>
                </div>
              ) : (
                playlistTracks.map((t, idx) => (
                  <div
                    key={`pl-tr-${t.id}-${idx}`}
                    onClick={() => playTrack(t, playlistTracks)}
                    className="group flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-mono text-slate-500">{idx + 1}</span>
                      <img
                        src={t.album_image || selectedPlaylist.coverImage}
                        alt={t.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h5 className="truncate text-sm font-medium text-white group-hover:text-purple-400">{t.name}</h5>
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

      {/* Create Playlist Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Playlist Name</label>
                <input
                  type="text"
                  required
                  value={plName}
                  onChange={(e) => setPlName(e.target.value)}
                  placeholder="e.g. Late Night Synth Flow"
                  className="mt-1 w-full rounded-xl bg-slate-950 px-3.5 py-2 text-sm text-white border border-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Description</label>
                <textarea
                  value={plDesc}
                  onChange={(e) => setPlDesc(e.target.value)}
                  placeholder="What's the vibe?"
                  rows={2}
                  className="mt-1 w-full rounded-xl bg-slate-950 px-3.5 py-2 text-sm text-white border border-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={plPublic}
                  onChange={(e) => setPlPublic(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-800 accent-purple-600"
                />
                <label htmlFor="pub" className="text-xs text-slate-300 cursor-pointer">Make playlist public</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
