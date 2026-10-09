import React, { useEffect, useState } from 'react';
import { reportsService } from '../services/reportsService';
import { ItemMatch } from '../types';
import { MatchExplanationCard } from '../components/reports/MatchExplanationCard';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { Sparkles, ShieldAlert, SlidersHorizontal } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState<number>(30);

  const fetchMatches = async (threshold: number) => {
    try {
      setIsLoading(true);
      const data = await reportsService.getMatches(threshold);
      setMatches(data);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      showToast(err.message || 'Error loading matches', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(scoreFilter);
  }, [scoreFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Matches
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pairs identified by comparing active lost items with reported found items.
          </p>
        </div>

        {/* Global Warning Banner */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs max-w-md">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> Matches are heuristic indicators based on overlapping attributes. Always verify details before claiming an item.
          </span>
        </div>
      </div>

      {/* Threshold Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter by Score Confidence:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScoreFilter(30)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              scoreFilter === 30
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Plausible (≥ 30%)
          </button>
          <button
            type="button"
            onClick={() => setScoreFilter(50)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              scoreFilter === 50
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Moderate+ (≥ 50%)
          </button>
          <button
            type="button"
            onClick={() => setScoreFilter(70)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              scoreFilter === 70
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            High Probability (≥ 70%)
          </button>
        </div>

        <span className="text-slate-400 font-medium">
          Showing {matches.length} matched pair{matches.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Matches List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-10 h-10 text-slate-400" />}
          title="No candidate matches found"
          description={`No lost and found pairs currently meet the score threshold of ${scoreFilter}%. Try lowering the threshold to see lower-confidence candidates.`}
          actionText="Show All Plausible Candidates"
          onAction={() => setScoreFilter(30)}
        />
      ) : (
        <div className="space-y-5">
          {matches.map((match) => (
            <MatchExplanationCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
