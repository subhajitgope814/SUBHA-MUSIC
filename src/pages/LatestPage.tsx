import React, { useState, useEffect } from 'react';
import { Clock, Play, Sparkles } from 'lucide-react';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { MusicCard } from '../components/MusicCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';
import { usePlayer } from '../context/PlayerContext.js';

export const LatestPage: React.FC = () => {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTracks({ order: 'releasedate_desc', limit: 24 }).then(res => {
      setTracks(res);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-emerald-400" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Latest Releases</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">Fresh independent music added by artists on Jamendo.</p>
        </div>
        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0], tracks)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 self-start sm:self-auto"
          >
            <Play className="h-4 w-4 fill-white" /> Stream Newest
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? <SkeletonCard count={12} /> : tracks.map((t, idx) => <MusicCard key={`lat-${t.id}-${idx}`} track={t} trackList={tracks} />)}
      </div>
    </div>
  );
};
