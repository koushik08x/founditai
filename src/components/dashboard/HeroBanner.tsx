import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroBanner: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const quickSearches = ['Water bottle', 'Notebook', 'ID card', 'Keys', 'AirPods', 'Backpack'];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-blue-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 lg:p-12 mb-8 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>FoundIt AI • Smart Campus Lost & Found</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          Lost something? <br className="hidden sm:inline" />
          <span className="text-blue-400">Let's bring it back.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-8 leading-relaxed">
          Smart lost-and-found for your campus. Report missing belongings, log items you've recovered, and let our intelligent engine match descriptions, colors, locations, and timelines.
        </p>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by item, color (e.g. 'black water bottle', 'keys')..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-slate-400 text-sm rounded-xl border border-white/20 focus:border-blue-400 focus:outline-hidden transition-all"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="sm:w-auto h-[46px] px-6 text-sm font-semibold shadow-md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Search
          </Button>
        </form>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-8">
          <span className="text-slate-400 font-medium">Popular:</span>
          {quickSearches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => navigate(`/browse?search=${encodeURIComponent(tag)}`)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Quick Report Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={() => navigate('/create?type=lost')}
            variant="outline"
            size="md"
            className="border-amber-400/40 text-amber-200 bg-amber-500/10 hover:bg-amber-500/20"
            leftIcon={<PlusCircle className="w-4 h-4 text-amber-400" />}
          >
            Report Lost Item
          </Button>
          <Button
            onClick={() => navigate('/create?type=found')}
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Report Found Item
          </Button>
          <Button
            onClick={() => navigate('/matches')}
            variant="ghost"
            size="md"
            className="text-slate-300 hover:text-white hover:bg-white/5"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All Matches
          </Button>
        </div>
      </div>
    </div>
  );
};
