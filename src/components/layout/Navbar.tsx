import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  PlusCircle,
  Menu,
  X,
  Compass,
  Sparkles,
  Layers,
  User,
  Database,
  ChevronDown
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { profile, isDemoMode, demoUsers, activeDemoUser, switchDemoUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Browse Reports', path: '/browse' },
    { label: 'Matches', path: '/matches', icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" /> },
    { label: 'My Reports', path: '/my-reports' },
    { label: 'DB & Setup', path: '/setup', icon: <Database className="w-3.5 h-3.5 text-slate-500" /> }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    FoundIt AI
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200/60">
                    Campus
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 hidden sm:block -mt-0.5">
                  Smart Lost & Found
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Report CTAs */}
            <Link to="/create?type=lost">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100/60"
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-amber-600" />}
              >
                Report Lost
              </Button>
            </Link>
            <Link to="/create?type=found">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Report Found
              </Button>
            </Link>

            {/* Demo Persona / User Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                  {profile?.display_name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[110px] truncate">
                  {profile?.display_name?.split(' ')[0] || 'Demo User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Current Persona</p>
                    <p className="text-[11px] text-slate-500 truncate">{profile?.email || 'Demo Profile'}</p>
                    {isDemoMode && (
                      <Badge variant="warning" size="sm" className="mt-1">
                        Demo Mode (Local)
                      </Badge>
                    )}
                  </div>

                  {isDemoMode && (
                    <div className="py-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                        Switch Tester Persona:
                      </p>
                      {demoUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchDemoUser(u);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                            activeDemoUser.id === u.id
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p>{u.display_name}</p>
                            <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                          </div>
                          {activeDemoUser.id === u.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      to="/my-reports"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      View My Reports
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/create?type=lost" className="sm:hidden">
              <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                + Report
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/create?type=lost"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="outline" className="w-full border-amber-300 text-amber-800 bg-amber-50">
                + Report Lost Item
              </Button>
            </Link>
            <Link
              to="/create?type=found"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="primary" className="w-full">
                + Report Found Item
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
