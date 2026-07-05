import React, { useState, useEffect } from 'react';
import { Compass, Filter, Play, RefreshCw, Sparkles } from 'lucide-react';
import { Track } from '../types/index.js';
import { api } from '../services/api.js';
import { MusicCard } from '../components/MusicCard.js';
import { SkeletonCard } from '../components/SkeletonCard.js';
import { usePlayer } from '../context/PlayerContext.js';

interface ExplorePageProps {
  initialTag?: string;
}

const TAGS = ['all', 'electronic', 'lofi', 'rock', 'acoustic', 'cinematic', 'jazz', 'synthwave', 'ambient', 'house', 'folk', 'pop'];
const ORDERS = [
  { id: 'popularity_total', label: 'Most Popular' },
  { id: 'releasedate_desc', label: 'Newest First' },
  { id: 'rate_listened_total', label: 'Most Streamed' }
];

export const ExplorePage: React.FC<ExplorePageProps> = ({ initialTag }) => {
  const { playTrack } = usePlayer();
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || 'all');
  const [selectedOrder, setSelectedOrder] = useState<string>('popularity_total');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    if (initialTag) setSelectedTag(initialTag);
  }, [initialTag]);

  const loadTracks = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    }
    try {
      const currentPage = reset ? 1 : page;
      const params: Record<string, string | number> = {
        limit: 18,
        order: selectedOrder,
        offset: (currentPage - 1) * 18
      };
      if (selectedTag && selectedTag !== 'all') {
        params.tags = selectedTag;
      }
      const res = await api.getTracks(params);
      if (reset) {
        setTracks(res);
      } else {
        setTracks(prev => {
          const ids = new Set(prev.map(t => t.id));
          return [...prev, ...res.filter(t => !ids.has(t.id))];
        });
      }
      setHasMore(res.length >= 12);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks(true);
  }, [selectedTag, selectedOrder]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 1) loadTracks(false);
  }, [page]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Independent Catalog</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">Stream over 500,000 Creative Commons tracks from Jamendo around the world.</p>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0], tracks)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition self-start sm:self-auto"
          >
            <Play className="h-4 w-4 fill-white" /> Play All
          </button>
        )}
      </div>

      {/* Filter Tabs & Sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              {tag === 'all' ? <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> All Genres</span> : tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            {ORDERS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading && tracks.length === 0 ? (
          <SkeletonCard count={12} />
        ) : tracks.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <p className="text-base font-semibold text-slate-300">No tracks found for this genre</p>
            <button
              onClick={() => setSelectedTag('all')}
              className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          tracks.map((t, idx) => (
            <MusicCard key={`exp-${t.id}-${idx}`} track={t} trackList={tracks} />
          ))
        )}
      </div>

      {/* Load More Button */}
      {tracks.length > 0 && hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-8 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            ) : null}
            {loading ? 'Loading More...' : 'Load More Tracks'}
          </button>
        </div>
      )}
    </div>
  );
};
