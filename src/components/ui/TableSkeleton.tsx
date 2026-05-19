import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-[#1a1a21] border border-white/5 rounded-xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-black/40 flex">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-5 py-4">
            <div className="h-3 bg-zinc-700/50 rounded w-20" />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex border-b border-white/5">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="flex-1 px-5 py-4">
              <div className={`h-3 bg-zinc-800/80 rounded ${j === 0 ? 'w-32' : 'w-20'}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
