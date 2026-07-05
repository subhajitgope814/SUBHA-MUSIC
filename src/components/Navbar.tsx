import React, { useState } from 'react';
import { Disc, Search, Menu, X, Heart, ListMusic, User as UserIcon, ShieldAlert, LogIn, LogOut, Sparkles } from 'lucide-react';
import { PageRoute } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { SubhaMusicLogo } from './SubhaMusicLogo.js';

interface NavbarProps {
  activePage: PageRoute;
  setActivePage: (page: PageRoute) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenQueue: () => void;
  onOpenWelcome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  searchQuery,
  setSearchQuery,
  onOpenQueue,
  onOpenWelcome
}) => {
  const { user, logout } = useAuth();
  const { queue } = usePlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('search');
    }
  };

  const navLinks: { id: PageRoute; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'latest', label: 'Latest' },
    { id: 'trending', label: 'Trending' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={() => setActivePage('home')}
          className="flex cursor-pointer items-center transition hover:opacity-90"
        >
          <SubhaMusicLogo variant="compact" />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md mx-8 md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, artists, or albums..."
              className="w-full rounded-full bg-slate-900/90 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activePage === item.id
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile search trigger */}
          <button 
            onClick={() => setActivePage('search')} 
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-900"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Queue Button */}
          <button
            onClick={onOpenQueue}
            className="relative rounded-lg p-2 text-slate-300 hover:bg-slate-900 transition"
            title="Playback Queue"
          >
            <ListMusic className="h-5 w-5" />
            {queue.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
            )}
          </button>

          {/* Welcome Screen Shortcut */}
          {onOpenWelcome && (
            <button
              onClick={onOpenWelcome}
              className="flex items-center gap-1.5 rounded-full border border-[#FF007F]/40 bg-gradient-to-r from-[#FF007F]/10 to-[#00F2FE]/10 px-3 py-1.5 text-xs font-bold text-[#FF007F] shadow-sm transition hover:scale-105 hover:border-[#FF007F]"
              title="View Welcome Experience"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00F2FE] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Vibe Intro</span>
            </button>
          )}

          {/* Favorites shortcut */}
          <button
            onClick={() => setActivePage('favorites')}
            className={`rounded-lg p-2 transition ${activePage === 'favorites' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-300 hover:bg-slate-900'}`}
            title="Favorite Songs"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 py-1 pl-1 pr-3 text-sm font-medium text-slate-200 transition hover:border-indigo-500"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-black/80 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-flex mt-1 items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                        <ShieldAlert className="h-3 w-3" /> Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setActivePage('profile'); setUserDropdown(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
                  >
                    <UserIcon className="h-4 w-4 text-indigo-400" /> My Profile
                  </button>
                  <button
                    onClick={() => { setActivePage('playlists'); setUserDropdown(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
                  >
                    <ListMusic className="h-4 w-4 text-purple-400" /> My Playlists
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setActivePage('admin'); setUserDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-300 hover:bg-slate-800 transition font-medium"
                    >
                      <ShieldAlert className="h-4 w-4 text-amber-400" /> Admin Dashboard
                    </button>
                  )}
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={() => { logout(); setUserDropdown(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95"
            >
              <LogIn className="h-4 w-4" /> Login
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 shadow-2xl">
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists, or albums..."
                className="w-full rounded-xl bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 border border-slate-800"
              />
            </div>
          </form>
          
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center justify-center rounded-xl p-3 text-sm font-medium transition ${
                  activePage === item.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-2">
            <button
              onClick={() => { setActivePage('playlists'); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 rounded-xl bg-slate-900 p-3 text-sm font-medium text-slate-200"
            >
              <ListMusic className="h-5 w-5 text-indigo-400" /> Playlists
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => { setActivePage('admin'); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-3 text-sm font-medium text-amber-400 border border-amber-500/20"
              >
                <ShieldAlert className="h-5 w-5 text-amber-400" /> Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
