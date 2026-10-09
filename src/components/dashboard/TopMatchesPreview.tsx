import React from 'react';
import { Link } from 'react-router-dom';
import { ItemMatch } from '../../types';
import { MatchScorePill } from '../common/MatchScorePill';
import { Card } from '../common/Card';
import { ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const TopMatchesPreview: React.FC<{ matches: ItemMatch[]; isLoading?: boolean }> = ({
  matches,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 mb-8">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-md mb-2" />
        <div className="h-24 w-full bg-slate-200 animate-pulse rounded-2xl" />
        <div className="h-24 w-full bg-slate-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // Filter top matches with score >= 40, limit to top 3
  const topMatches = matches.filter(m => m.score >= 40).slice(0, 3);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Top Possible Matches</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            {matches.length} Identified
          </span>
        </div>
        <Link
          to="/matches"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
        >
          <span>View All Matches</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {topMatches.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-slate-400" />}
          title="No confident matches right now"
          description="As new lost and found reports are submitted on campus, our matching engine will correlate them automatically."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topMatches.map((m) => {
            const lost = m.lost_report;
            const found = m.found_report;
            if (!lost || !found) return null;

            return (
              <Card key={m.id} hoverable className="p-4 flex flex-col justify-between border-slate-200/90">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <MatchScorePill score={m.score} size="sm" />
                    <span className="text-[11px] text-slate-400">{lost.event_date}</span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="text-xs">
                      <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-sm mr-1">
                        LOST:
                      </span>
                      <span className="font-bold text-slate-900">{lost.item_name}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-sm mr-1">
                        FOUND:
                      </span>
                      <span className="font-bold text-slate-900">{found.item_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{lost.campus_location}</span>
                  </div>

                  {m.explanation.sharedAttributes[0] && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 font-medium truncate">
                      Algorithm match: {m.explanation.sharedAttributes[0]}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    to="/matches"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <span>Inspect Match</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
