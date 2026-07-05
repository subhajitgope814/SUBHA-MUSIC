import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart, ListMusic, Plus, ChevronUp, ChevronDown, MoreHorizontal, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.js';
import { formatDuration } from './MusicCard.js';

interface AudioPlayerProps {
  onToggleQueue: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ onToggleQueue }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    favorites,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    setModalTrack,
    queue
  } = usePlayer();

  if (!currentTrack) return null;

  const isFav = favorites.includes(currentTrack.id);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumeLevel(Number(e.target.value));
  };

  return (
    <>
      {/* --- FULL SCREEN NOW PLAYING MODAL (Matches Image 2 Screen 3) --- */}
      {isExpanded && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-between bg-slate-950 p-6 sm:p-10 select-none overflow-y-auto">
          {/* Background Ambient Blur */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-b from-[#00F2FE]/20 to-[#FF007F]/15 blur-[120px]" />
          </div>

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-800"
              title="Minimize Player"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Now Playing</span>
            <button
              onClick={onToggleQueue}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-800"
              title="More Options / Queue"
            >
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </div>

          {/* Album Artwork Center */}
          <div className="relative z-10 my-6 flex flex-1 items-center justify-center">
            <div className="relative aspect-square w-full max-w-[320px] sm:max-w-[380px] overflow-hidden rounded-3xl bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
              <img
                src={currentTrack.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                alt={currentTrack.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Track Info & Controls */}
          <div className="relative z-10 mx-auto w-full max-w-md space-y-6">
            {/* Title & Artist Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-2xl font-black text-white">{currentTrack.name}</h2>
                <p className="truncate text-base font-semibold text-slate-400">{currentTrack.artist_name}</p>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`rounded-full p-2.5 transition ${isFav ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-white bg-slate-900'}`}
              >
                <Heart className={`h-6 w-6 ${isFav ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Lyrics Tag Row */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3.5 py-2 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400">No Lyrics Available</span>
              <button className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 transition hover:bg-slate-700">
                Add
              </button>
            </div>

            {/* Progress Scrubber */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-white transition focus:outline-none"
              />
              <div className="flex justify-between font-mono text-xs text-slate-400">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Main Playback Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={toggleShuffle}
                className={`rounded-full p-2.5 transition ${isShuffle ? 'text-[#9B51E0]' : 'text-slate-400 hover:text-white'}`}
                title="Shuffle"
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button
                onClick={playPrevious}
                className="rounded-full p-2 text-slate-200 hover:scale-110 active:scale-95 transition"
              >
                <SkipBack className="h-7 w-7 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl transition hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="h-8 w-8 fill-slate-950" /> : <Play className="h-8 w-8 fill-slate-950 ml-1" />}
              </button>

              <button
                onClick={playNext}
                className="rounded-full p-2 text-slate-200 hover:scale-110 active:scale-95 transition"
              >
                <SkipForward className="h-7 w-7 fill-current" />
              </button>

              <button
                onClick={onToggleQueue}
                className="rounded-full p-2.5 text-slate-400 hover:text-white transition"
                title="Queue"
              >
                <ListMusic className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM PLAYER BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          
          {/* Track Info */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div 
              onClick={() => setIsExpanded(true)}
              className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow-md cursor-pointer"
              title="Click to expand Now Playing"
            >
              <img
                src={currentTrack.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                alt={currentTrack.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <ChevronUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setIsExpanded(true)}>
              <h4 className="truncate text-sm font-semibold text-white hover:underline">{currentTrack.name}</h4>
              <p className="truncate text-xs text-slate-400 font-medium">{currentTrack.artist_name}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`rounded-full p-1.5 transition ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-white'}`}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                onClick={() => setModalTrack(currentTrack)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white transition"
                title="Add to playlist"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Player Controls & Progress Scrubber */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`rounded-full p-1.5 transition ${isShuffle ? 'text-[#9B51E0] bg-purple-500/10' : 'text-slate-400 hover:text-white'}`}
                title="Shuffle queue"
              >
                <Shuffle className="h-4 w-4" />
              </button>

              <button
                onClick={playPrevious}
                className="rounded-full p-1.5 text-slate-300 hover:text-white transition hover:scale-110 active:scale-95"
                title="Previous song"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#FF007F] to-[#9B51E0] text-white shadow-lg shadow-purple-600/40 transition hover:brightness-110 hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="rounded-full p-1.5 text-slate-300 hover:text-white transition hover:scale-110 active:scale-95"
                title="Next song"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`rounded-full p-1.5 transition ${repeatMode !== 'off' ? 'text-[#9B51E0] bg-purple-500/10' : 'text-slate-400 hover:text-white'}`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex w-full items-center gap-2.5 text-xs text-slate-400">
              <span className="w-9 text-right font-mono text-[11px]">{formatDuration(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-800 accent-[#FF007F] focus:outline-none transition"
              />
              <span className="w-9 font-mono text-[11px]">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Volume & Queue controls */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[140px]">
            <button
              onClick={() => setIsExpanded(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition hidden sm:flex items-center gap-1.5 text-xs font-semibold"
              title="Expand Player"
            >
              <Maximize2 className="h-4 w-4 text-[#00F2FE]" />
            </button>

            <button
              onClick={onToggleQueue}
              className="relative rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition hidden md:flex items-center gap-1 text-xs font-medium"
              title="Open playback queue"
            >
              <ListMusic className="h-4 w-4 text-[#9B51E0]" />
              <span>Queue ({queue.length})</span>
            </button>

            <button onClick={toggleMute} className="text-slate-300 hover:text-white transition">
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="hidden sm:block h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-slate-800 accent-[#00F2FE]"
            />
          </div>

        </div>
      </div>
    </>
  );
};
