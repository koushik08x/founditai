import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/70 rounded-lg ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="pt-2 flex justify-between items-center border-t border-slate-100">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
};
