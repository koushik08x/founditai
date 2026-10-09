import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-10 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">FoundIt AI</p>
              <p className="text-xs text-slate-500">
                "Lost something? Let's bring it back." — Smart lost-and-found for your campus.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/browse" className="hover:text-blue-600 transition-colors">Browse Reports</Link>
            <Link to="/matches" className="hover:text-blue-600 transition-colors">Candidate Matches</Link>
            <Link to="/setup" className="hover:text-blue-600 transition-colors">Database Setup</Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Built for Campus Hackathon • Privacy First</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} FoundIt AI. All campus reports remain student-confidential.</p>
          <p className="flex items-center gap-1">
            Deterministic Heuristic + Semantic AI Engine
          </p>
        </div>
      </div>
    </footer>
  );
};
