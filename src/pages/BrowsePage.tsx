import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reportsService } from '../services/reportsService';
import { ItemReport, ReportFilterOptions } from '../types';
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportCard } from '../components/reports/ReportCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [reports, setReports] = useState<ItemReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<ReportFilterOptions>({
    searchQuery: searchParams.get('search') || '',
    reportType: (searchParams.get('type') as any) || 'all',
    category: searchParams.get('category') || 'all',
    campusLocation: searchParams.get('location') || 'all',
    status: 'all',
    sortBy: 'newest'
  });

  const fetchReports = async (activeFilters: ReportFilterOptions) => {
    try {
      setIsLoading(true);
      const data = await reportsService.getReports(activeFilters);
      setReports(data);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      showToast(err.message || 'Failed to load reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: ReportFilterOptions) => {
    setFilters(newFilters);

    const params: Record<string, string> = {};
    if (newFilters.searchQuery) params.search = newFilters.searchQuery;
    if (newFilters.reportType && newFilters.reportType !== 'all') params.type = newFilters.reportType;
    if (newFilters.category && newFilters.category !== 'all') params.category = newFilters.category;
    if (newFilters.campusLocation && newFilters.campusLocation !== 'all') params.location = newFilters.campusLocation;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const defaultFilters: ReportFilterOptions = {
      searchQuery: '',
      reportType: 'all',
      category: 'all',
      campusLocation: 'all',
      status: 'all',
      sortBy: 'newest'
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Campus Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore all active lost and found records across campus with real-time filters.
        </p>
      </div>

      <ReportFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalResultsCount={reports.length}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports match your filters"
          description="Try clearing your search query or adjusting your category/location filters to see more results."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};
