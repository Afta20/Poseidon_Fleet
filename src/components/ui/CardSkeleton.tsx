import React from 'react';

interface CardSkeletonProps {
  count?: number;
  columns?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 6, columns = 3 }) => {
  const gridClass =
    columns === 2
      ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#121217] border border-white/10 rounded-2xl p-6 animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 bg-zinc-800 rounded w-32" />
            <div className="h-5 bg-zinc-800 rounded w-16" />
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-zinc-800/60 rounded w-full" />
            <div className="h-3 bg-zinc-800/60 rounded w-3/4" />
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between">
            <div className="h-3 bg-zinc-800/40 rounded w-24" />
            <div className="h-3 bg-zinc-800/40 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};
