import React from 'react';
import { Play, Pause, Heart, Plus, Music } from 'lucide-react';
import { Track } from '../types/index.js';
import { usePlayer } from '../context/PlayerContext.js';

interface MusicCardProps {
  track: Track;
  trackList?: Track[];
}

export const formatDuration = (secs: number): string => {
  if (!secs || isNaN(secs)) return '3:00';
  const mins = Math.floor(secs / 60);
  const remainder = Math.floor(secs % 60);
  return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
};

export const MusicCard: React.FC<MusicCardProps> = ({ track, trackList }) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, favorites, toggleFavorite, setModalTrack } = usePlayer();

  const isCurrent = currentTrack?.id === track.id;
  const isFav = favorites.includes(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, trackList);
    }
  };

  const handleFavClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(track.id);
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalTrack(track);
  };

  return (
    <div 
      onClick={handlePlayClick}
      className={`group relative flex flex-col rounded-2xl border p-3 transition duration-200 cursor-pointer ${
        isCurrent
          ? 'border-indigo-500/60 bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
          : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Cover Art Box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-800">
        <img
          src={track.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80'}
          alt={track.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Overlay on hover or active */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition ${
          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handlePlayClick}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/50 transition hover:bg-indigo-500 hover:scale-110 active:scale-95"
            title={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="h-6 w-6 fill-white" />
            ) : (
              <Play className="h-6 w-6 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Top badges */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={handleFavClick}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
              isFav ? 'bg-rose-500 text-white' : 'bg-black/60 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:text-white'
            }`}
            title="Favorite"
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-white' : ''}`} />
          </button>
          
          <button
            onClick={handleAddToPlaylistClick}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-slate-300 opacity-0 group-hover:opacity-100 backdrop-blur-md hover:bg-black/80 hover:text-white transition"
            title="Add to playlist"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
          {formatDuration(track.duration)}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-3 flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className={`truncate text-sm font-semibold transition ${isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-100 group-hover:text-indigo-300'}`}>
            {track.name}
          </h4>
          {isCurrent && isPlaying && (
            <span className="flex items-center gap-0.5 text-indigo-400 shrink-0">
              <span className="h-3 w-0.5 animate-pulse bg-indigo-400" />
              <span className="h-2 w-0.5 animate-pulse bg-indigo-400 delay-100" />
              <span className="h-4 w-0.5 animate-pulse bg-indigo-400 delay-200" />
            </span>
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-slate-400 font-medium">
          {track.artist_name}
        </p>
        
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[120px]">{track.album_name || 'Single'}</span>
          {track.plays ? <span>{(track.plays / 1000).toFixed(1)}k plays</span> : null}
        </div>
      </div>
    </div>
  );
};
