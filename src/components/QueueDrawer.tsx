import React, { useState } from 'react';
import { X, Trash2, Music, ListMusic, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.js';
import { formatDuration } from './MusicCard.js';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const { currentTrack, queue, playTrack, removeFromQueue, reorderQueue, clearQueue } = usePlayer();
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIdx(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== index) {
      reorderQueue(draggedIdx, index);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition animate-in fade-in">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ListMusic className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Playback Queue</h3>
              <p className="text-[11px] text-slate-400">Drag tracks to reorder your listening flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Track */}
        {currentTrack && (
          <div className="border-b border-slate-800/80 bg-indigo-950/30 p-4">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Now Playing</span>
            <div className="mt-2 flex items-center gap-3">
              <img
                src={currentTrack.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                alt={currentTrack.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-lg object-cover shadow-md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-white">{currentTrack.name}</h4>
                <p className="truncate text-xs text-slate-400">{currentTrack.artist_name}</p>
              </div>
              <span className="text-xs font-mono text-indigo-400">{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>
        )}

        {/* Next Up Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900/60 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            Next Up ({queue.length})
            {queue.length > 1 && (
              <span className="text-[10px] text-indigo-400/90 font-normal bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Drag & drop enabled
              </span>
            )}
          </span>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Queue
            </button>
          )}
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center px-4">
              <Music className="h-10 w-10 text-slate-700 mb-2" />
              <p className="text-sm font-medium text-slate-400">Queue is empty</p>
              <p className="text-xs text-slate-600 mt-1">Add tracks from Explore or Trending to build your flow.</p>
            </div>
          ) : (
            queue.map((track, index) => {
              const isDragging = draggedIdx === index;
              const isDragOver = dragOverIdx === index && draggedIdx !== index;
              const dropAbove = isDragOver && draggedIdx !== null && index < draggedIdx;
              const dropBelow = isDragOver && draggedIdx !== null && index > draggedIdx;

              return (
                <div
                  key={`${track.id}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    const remaining = queue.filter((_, idx) => idx !== index);
                    playTrack(track, remaining);
                  }}
                  className={`group flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition cursor-pointer ${
                    isDragging
                      ? 'opacity-40 border-dashed border-indigo-500/60 bg-indigo-950/20 scale-95 shadow-inner'
                      : isDragOver
                      ? dropAbove
                        ? 'border-t-2 border-t-indigo-400 border-x-slate-700 border-b-slate-800 bg-indigo-950/40 scale-[1.01] shadow-lg'
                        : 'border-b-2 border-b-indigo-400 border-x-slate-700 border-t-slate-800 bg-indigo-950/40 scale-[1.01] shadow-lg'
                      : 'border-slate-800/60 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-slate-600 group-hover:text-slate-400 hover:bg-slate-800 rounded transition flex items-center justify-center"
                      title="Drag to reorder"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <span className="text-xs font-mono text-slate-500 w-4 text-center">{index + 1}</span>
                    <img
                      src={track.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'}
                      alt={track.name}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-lg object-cover pointer-events-none"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition">{track.name}</h5>
                      <p className="truncate text-xs text-slate-500">{track.artist_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Reorder Up/Down arrows for quick touch/keyboard ease */}
                    {queue.length > 1 && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition mr-1">
                        <button
                          disabled={index === 0}
                          onClick={() => reorderQueue(index, index - 1)}
                          className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-20 disabled:hover:text-slate-500 transition rounded hover:bg-slate-800"
                          title="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={index === queue.length - 1}
                          onClick={() => reorderQueue(index, index + 1)}
                          className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-20 disabled:hover:text-slate-500 transition rounded hover:bg-slate-800"
                          title="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <span className="text-xs font-mono text-slate-500">{formatDuration(track.duration)}</span>
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition ml-1"
                      title="Remove from queue"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
