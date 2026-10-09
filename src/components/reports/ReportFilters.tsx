import React from 'react';
import { ReportFilterOptions, ITEM_CATEGORIES, CAMPUS_LOCATIONS, ReportType } from '../../types';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export interface ReportFiltersProps {
  filters: ReportFilterOptions;
  onChange: (newFilters: ReportFilterOptions) => void;
  onReset: () => void;
  totalResultsCount?: number;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResultsCount
}) => {
  const handleTypeChange = (type: ReportType | 'all') => {
    onChange({ ...filters, reportType: type });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 mb-6 shadow-xs space-y-4">
      {/* Top row: Search input & Status toggle */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search reports by keyword, item name, location, or color..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
          />
        </div>

        {/* Report Type Pill Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => handleTypeChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filters.reportType === 'all' || !filters.reportType
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filters.reportType === 'lost'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost Items
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('found')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filters.reportType === 'found'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found Items
          </button>
        </div>
      </div>

      {/* Second row: Dropdowns for Category, Location, Sort, and Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Category filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Campus Location
          </label>
          <select
            value={filters.campusLocation || 'all'}
            onChange={(e) => onChange({ ...filters, campusLocation: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Sort filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sort Order
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
          >
            <option value="newest">Newest Reported First</option>
            <option value="oldest">Oldest Reported First</option>
            <option value="event_date">Event Date (Recent First)</option>
          </select>
        </div>

        {/* Reset button & count */}
        <div className="flex items-end justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full h-[38px] text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {typeof totalResultsCount === 'number' && (
        <div className="text-xs text-slate-500 font-medium pt-1">
          Showing <span className="font-bold text-slate-900">{totalResultsCount}</span> report{totalResultsCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
