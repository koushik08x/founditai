import React from 'react';
import { DashboardStats } from '../../types';
import { Card } from '../common/Card';
import { FileText, Search, PackageCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const StatsOverview: React.FC<{ stats: DashboardStats; isLoading?: boolean }> = ({
  stats,
  isLoading = false
}) => {
  const cards = [
    {
      label: 'Active Reports',
      value: stats.totalActiveReports,
      sub: 'Currently open on campus',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100'
    },
    {
      label: 'Lost Items',
      value: stats.totalLostReports,
      sub: 'Awaiting discovery',
      icon: <Search className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-100'
    },
    {
      label: 'Found Items',
      value: stats.totalFoundReports,
      sub: 'Recovered & logged',
      icon: <PackageCheck className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100'
    },
    {
      label: 'Possible Matches',
      value: stats.totalPossibleMatches,
      sub: 'Correlated by matching engine',
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((item, idx) => (
        <Card key={idx} className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {item.label}
            </span>
            <div className={`p-2 rounded-xl border ${item.color}`}>
              {item.icon}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-14 bg-slate-200 animate-pulse rounded-md" />
              ) : (
                item.value
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
