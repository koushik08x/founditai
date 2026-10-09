import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Banner indicating Google Cloud & Firebase environment status */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>
          {isDemoMode ? (
            <>
              <strong>100% Google Stack (Demo Mode):</strong> Running with real in-memory state & hackathon seed data.{' '}
              <Link to="/setup" className="text-blue-400 underline hover:text-blue-300 ml-1">
                Configure Google Firebase & Gemini AI
              </Link>
            </>
          ) : (
            <>
              <strong>Google Firebase Connected:</strong> Cloud Firestore & Security Rules active.{' '}
              <Link to="/setup" className="text-blue-400 underline hover:text-blue-300 ml-1">
                View Google Cloud status
              </Link>
            </>
          )}
        </span>
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
};
