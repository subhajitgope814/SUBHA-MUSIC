import React from 'react';

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 animate-pulse"
        >
          <div className="aspect-square w-full rounded-xl bg-slate-800/80" />
          <div className="mt-3.5 h-4 w-3/4 rounded bg-slate-800" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-800/60" />
          <div className="mt-2.5 flex items-center justify-between">
            <div className="h-3 w-16 rounded bg-slate-800/40" />
            <div className="h-3 w-10 rounded bg-slate-800/40" />
          </div>
        </div>
      ))}
    </>
  );
};
