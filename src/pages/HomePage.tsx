import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsService } from '../services/reportsService';
import { ItemReport, ItemMatch, DashboardStats } from '../types';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { TopMatchesPreview } from '../components/dashboard/TopMatchesPreview';
import { ReportCard } from '../components/reports/ReportCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalActiveReports: 0,
    totalLostReports: 0,
    totalFoundReports: 0,
    totalPossibleMatches: 0,
    resolvedReportsCount: 0
  });
  const [recentReports, setRecentReports] = useState<ItemReport[]>([]);
  const [topMatches, setTopMatches] = useState<ItemMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [fetchedStats, fetchedReports, fetchedMatches] = await Promise.all([
        reportsService.getDashboardStats(),
        reportsService.getReports({ status: 'active', sortBy: 'newest' }),
        reportsService.getMatches(35)
      ]);

      setStats(fetchedStats);
      setRecentReports(fetchedReports);
      setTopMatches(fetchedMatches);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      showToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const filteredRecentReports = recentReports
    .filter((r) => (activeTab === 'all' ? true : r.report_type === activeTab))
    .slice(0, 6);

  return (
    <div className="space-y-2">
      {/* Hero Banner with Search & Action Buttons */}
      <HeroBanner />

      {/* Real-time Database Statistics Overview */}
      <StatsOverview stats={stats} isLoading={isLoading} />

      {/* Top Possible Matches Highlight */}
      <TopMatchesPreview matches={topMatches} isLoading={isLoading} />

      {/* Recent Lost & Found Reports Section */}
      <div className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Campus Reports
            </h2>
            <p className="text-xs text-slate-500">
              Live updates from across libraries, academic halls, and campus quads
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab pill selector */}
            <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lost')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'lost'
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lost Items
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('found')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'found'
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Found Items
              </button>
            </div>

            <Link to="/browse">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Browse All
              </Button>
            </Link>
          </div>
        </div>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredRecentReports.length === 0 ? (
          <EmptyState
            title="No reports match this view"
            description="Be the first to report a missing or found item on campus."
            actionText="Report an Item"
            onAction={() => (window.location.href = '/create')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
