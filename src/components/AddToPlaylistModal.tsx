import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Playlist } from '../types/index.js';

export const AddToPlaylistModal: React.FC = () => {
  const { modalTrack, setModalTrack } = usePlayer();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    if (modalTrack) {
      loadPlaylists();
    }
  }, [modalTrack]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const pl = await api.getPlaylists();
      setPlaylists(pl);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!modalTrack) return null;

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const newPl = await api.createPlaylist(newTitle.trim(), 'Created from track selection');
      await api.updatePlaylistTracks(newPl.id, [modalTrack.id]);
      setNewTitle('');
      setModalTrack(null);
    } catch (err) {
      alert('Failed to save to playlist.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTrackInPlaylist = async (pl: Playlist) => {
    const hasTrack = pl.trackIds.includes(modalTrack.id);
    const updatedIds = hasTrack
      ? pl.trackIds.filter(id => id !== modalTrack.id)
      : [...pl.trackIds, modalTrack.id];
    
    try {
      await api.updatePlaylistTracks(pl.id, updatedIds);
      setPlaylists(prev => prev.map(p => p.id === pl.id ? { ...p, trackIds: updatedIds } : p));
    } catch (e) {
      alert('Could not update playlist');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-white">Add to Playlist</h3>
          </div>
          <button
            onClick={() => setModalTrack(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Track info */}
        <div className="my-4 flex items-center gap-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60">
          <img
            src={modalTrack.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
            alt={modalTrack.name}
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-white">{modalTrack.name}</h4>
            <p className="truncate text-xs text-slate-400">{modalTrack.artist_name}</p>
          </div>
        </div>

        {/* Create new playlist form */}
        <form onSubmit={handleCreateAndAdd} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New playlist name..."
            className="flex-1 rounded-xl bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || creating}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </form>

        {/* Playlists list */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <p className="text-center py-6 text-sm text-slate-400">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-500">No playlists yet. Create one above!</p>
          ) : (
            playlists.map(pl => {
              const contains = pl.trackIds.includes(modalTrack.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleTrackInPlaylist(pl)}
                  className={`flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                    contains
                      ? 'border-indigo-500/50 bg-indigo-950/30'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                      <img
                        src={pl.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'}
                        alt={pl.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-white">{pl.name}</h5>
                      <span className="text-xs text-slate-500">{pl.trackIds.length} tracks</span>
                    </div>
                  </div>

                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                    contains ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-700 text-transparent'
                  }`}>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
