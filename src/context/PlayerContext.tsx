import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // seconds
  duration: number; // seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  queue: Track[];
  history: Track[];
  favorites: string[]; // track ids
  repeatMode: RepeatMode;
  isShuffle: boolean;
  modalTrack: Track | null; // for AddToPlaylistModal
  setModalTrack: (track: Track | null) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (seconds: number) => void;
  setVolumeLevel: (val: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleFavorite: (trackId: string) => Promise<void>;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNextInternal();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [repeatMode]);

  // Load user favorites & history when auth changes
  useEffect(() => {
    const loadFavsAndHistory = async () => {
      const favs = await api.getFavorites();
      setFavorites(favs);
      const hist = await api.getHistory();
      setHistory(hist.map(h => h.track));
    };
    loadFavsAndHistory();
  }, [user]);

  const playNextInternal = () => {
    if (queue.length === 0) {
      if (repeatMode === 'all' && currentTrack) {
        audioRef.current?.play();
      } else {
        setIsPlaying(false);
      }
      return;
    }

    let nextIndex = 0;
    if (isShuffle && queue.length > 1) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    const nextTrack = queue[nextIndex];
    const remainingQueue = queue.filter((_, idx) => idx !== nextIndex);
    setQueue(remainingQueue);
    playTrack(nextTrack, remainingQueue);
  };

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue !== undefined) {
      setQueue(newQueue);
    }

    setCurrentTrack(track);
    setDuration(track.duration || 180);
    setProgress(0);
    setIsPlaying(true);

    // Log history
    api.logHistory(track).then(() => {
      setHistory(prev => [track, ...prev.filter(t => t.id !== track.id)].slice(0, 20));
    });

    audioRef.current.src = track.audio;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.play().catch(err => {
      console.warn('Playback error (possibly browser autoplay blocked):', err);
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    playNextInternal();
  };

  const playPrevious = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 4 || history.length === 0) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevTrack = history[0];
    if (prevTrack) {
      playTrack(prevTrack, [currentTrack!, ...queue]);
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  };

  const setVolumeLevel = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleFavorite = async (trackId: string) => {
    const isFav = favorites.includes(trackId);
    const updated = await api.toggleFavorite(trackId, isFav);
    setFavorites(updated);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex || startIndex < 0 || endIndex < 0) return;
    setQueue(prev => {
      if (startIndex >= prev.length || endIndex >= prev.length) return prev;
      const updated = [...prev];
      const [movedTrack] = updated.splice(startIndex, 1);
      updated.splice(endIndex, 0, movedTrack);
      return updated;
    });
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      duration,
      volume,
      isMuted,
      queue,
      history,
      favorites,
      repeatMode,
      isShuffle,
      modalTrack,
      setModalTrack,
      playTrack,
      togglePlayPause,
      playNext,
      playPrevious,
      seekTo,
      setVolumeLevel,
      toggleMute,
      toggleRepeat,
      toggleShuffle,
      toggleFavorite,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      clearQueue
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
};
