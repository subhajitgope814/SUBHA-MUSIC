import React, { useState } from 'react';
import { User as UserIcon, Save, Clock, Heart, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { formatDuration } from '../components/MusicCard.js';
import { PageRoute } from '../types/index.js';

interface ProfilePageProps {
  setActivePage: (page: PageRoute) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setActivePage }) => {
  const { user, updateProfile, logout } = useAuth();
  const { history, favorites, playTrack } = usePlayer();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <UserIcon className="h-12 w-12 mx-auto text-slate-600 mb-3" />
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <p className="text-sm text-slate-400 mt-1">You must be logged in to view your user profile.</p>
        <button
          onClick={() => setActivePage('login')}
          className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, bio, avatar });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt={user.name}
          className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500 shadow-xl"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30 self-center sm:self-auto">
                <ShieldAlert className="h-3.5 w-3.5" /> Admin Account
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 font-mono mt-0.5">{user.email}</p>
          <p className="text-sm text-slate-300 mt-2">{user.bio || 'Music enthusiast & stream listener'}</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Favorite Songs</span>
          <p className="mt-1 text-2xl font-extrabold text-white">{favorites.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Listening Sessions</span>
          <p className="mt-1 text-2xl font-extrabold text-indigo-400">{history.length}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <span className="text-xs text-slate-400 font-medium">Account Status</span>
          <p className="mt-1 text-base font-bold text-emerald-400 capitalize">{user.role} Verified</p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4">Edit Profile Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm text-white border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400">Avatar URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm text-white border border-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell other listeners about your taste in music..."
              className="mt-1 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm text-white border border-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedMessage ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Listening History */}
      {history.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" /> Recent Listening History
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((t, idx) => (
              <div
                key={`prof-hist-${t.id}-${idx}`}
                onClick={() => playTrack(t, history)}
                className="group flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-950/50 p-3 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={t.album_image} alt={t.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <h5 className="truncate text-sm font-medium text-white group-hover:text-indigo-400">{t.name}</h5>
                    <p className="truncate text-xs text-slate-400">{t.artist_name}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">{formatDuration(t.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
