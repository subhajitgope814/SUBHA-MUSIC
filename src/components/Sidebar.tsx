import React from 'react';
import { Home, Compass, Flame, Clock, Music, Users, Heart, ListMusic, ShieldAlert } from 'lucide-react';
import { PageRoute } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { SubhaMusicLogo } from './SubhaMusicLogo.js';

interface SidebarProps {
  activePage: PageRoute;
  setActivePage: (page: PageRoute) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'home' as PageRoute, label: 'Home', icon: Home },
    { id: 'explore' as PageRoute, label: 'Explore', icon: Compass },
    { id: 'latest' as PageRoute, label: 'Latest Songs', icon: Clock },
    { id: 'trending' as PageRoute, label: 'Trending Charts', icon: Flame },
    { id: 'artists' as PageRoute, label: 'Artists Directory', icon: Users },
    { id: 'albums' as PageRoute, label: 'Albums Releases', icon: Music },
  ];

  const libraryItems = [
    { id: 'favorites' as PageRoute, label: 'Favorite Songs', icon: Heart, color: 'text-rose-500' },
    { id: 'playlists' as PageRoute, label: 'My Playlists', icon: ListMusic, color: 'text-purple-400' },
  ];

  return (
    <aside className="hidden xl:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/60 p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="mb-6 flex justify-center pb-4 border-b border-slate-800/60 cursor-pointer" onClick={() => setActivePage('home')}>
        <SubhaMusicLogo variant="full" className="scale-90" />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Discover</h3>
          <div className="mt-2 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Your Library</h3>
          <div className="mt-2 space-y-1">
            {libraryItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-800">
            <h3 className="px-3 text-[11px] font-bold tracking-wider text-amber-500 uppercase">Management</h3>
            <button
              onClick={() => setActivePage('admin')}
              className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                activePage === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Admin Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800/80">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 p-4 border border-indigo-500/20">
          <p className="text-xs font-semibold text-indigo-300">API Terms Compliance</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Unlimited free independent streaming provided via the Jamendo API v3 under Creative Commons.
          </p>
        </div>
      </div>
    </aside>
  );
};
