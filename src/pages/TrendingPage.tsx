import React, { useState, useEffect } from 'react';
import { Flame, Play, Award } from 'lucide-react';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { MusicCard, formatDuration } from '../components/MusicCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';
import { usePlayer } from '../context/PlayerContext.js';

export const TrendingPage: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTracks({ order: 'popularity_total', limit: 30 }).then(res => {
      setTracks(res);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Flame className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Trending Top Charts</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">The most streamed and liked independent songs across Jamendo right now.</p>
        </div>
        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0], tracks)}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 self-start sm:self-auto"
          >
            <Play className="h-4 w-4 fill-white" /> Play Top 30
          </button>
        )}
      </div>

      {/* Top 3 Featured Podiums */}
      {tracks.length >= 3 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tracks.slice(0, 3).map((track, rank) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={`podium-${track.id}-${rank}`}
                onClick={() => isCurrent ? togglePlayPause() : playTrack(track, tracks)}
                className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-5 shadow-xl transition hover:border-amber-500/60 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                    <Award className="h-3.5 w-3.5" /> Rank #{rank + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{formatDuration(track.duration)}</span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-800 shadow-md">
                    <img
                      src={track.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'}
                      alt={track.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                      <Play className="h-6 w-6 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-white group-hover:text-amber-300">{track.name}</h3>
                    <p className="truncate text-xs text-slate-400 mt-0.5">{track.artist_name}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{(track.plays || 25000).toLocaleString()} streams</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid for remainder */}
      <h3 className="text-lg font-bold text-white mt-6">All Trending Tracks</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? <SkeletonCard count={12} /> : tracks.map((t, idx) => <MusicCard key={`trend-${t.id}-${idx}`} track={t} trackList={tracks} />)}
      </div>
    </div>
  );
};
