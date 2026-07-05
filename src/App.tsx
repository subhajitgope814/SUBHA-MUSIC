import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { PlayerProvider } from './context/PlayerContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { AudioPlayer } from './components/AudioPlayer.js';
import { QueueDrawer } from './components/QueueDrawer.js';
import { AddToPlaylistModal } from './components/AddToPlaylistModal.js';
import { WelcomeScreen } from './components/WelcomeScreen.js';
import { HomePage } from './pages/HomePage.js';
import { ExplorePage } from './pages/ExplorePage.js';
import { LatestPage } from './pages/LatestPage.js';
import { TrendingPage } from './pages/TrendingPage.js';
import { ArtistsPage } from './pages/ArtistsPage.js';
import { AlbumsPage } from './pages/AlbumsPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { PlaylistsPage } from './pages/PlaylistsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { PageRoute, Playlist } from './types/index.js';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<PageRoute>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exploreCategory, setExploreCategory] = useState<string>('all');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [queueOpen, setQueueOpen] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  useEffect(() => {
    const seen = localStorage.getItem('subha_welcome_seen_v1');
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  const handleContinueWelcome = () => {
    localStorage.setItem('subha_welcome_seen_v1', 'true');
    setShowWelcome(false);
  };

  const handleSelectCategory = (tag: string) => {
    setExploreCategory(tag);
    setActivePage('explore');
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActivePage('playlists');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#FF007F] selection:text-white">
      {showWelcome && <WelcomeScreen onContinue={handleContinueWelcome} />}

      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenQueue={() => setQueueOpen(true)}
        onOpenWelcome={() => setShowWelcome(true)}
      />

      <div className="flex flex-1">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {activePage === 'home' && (
            <HomePage
              setActivePage={setActivePage}
              onSelectCategory={handleSelectCategory}
              onSelectPlaylist={handleSelectPlaylist}
            />
          )}
          {activePage === 'explore' && <ExplorePage initialTag={exploreCategory} />}
          {activePage === 'latest' && <LatestPage />}
          {activePage === 'trending' && <TrendingPage />}
          {activePage === 'artists' && <ArtistsPage />}
          {activePage === 'albums' && <AlbumsPage />}
          {activePage === 'search' && (
            <SearchPage initialQuery={searchQuery} setSearchQuery={setSearchQuery} />
          )}
          {activePage === 'favorites' && <FavoritesPage setActivePage={setActivePage} />}
          {activePage === 'playlists' && <PlaylistsPage initialPlaylist={selectedPlaylist} />}
          {activePage === 'profile' && <ProfilePage setActivePage={setActivePage} />}
          {activePage === 'login' && <LoginPage setActivePage={setActivePage} />}
          {activePage === 'register' && <RegisterPage setActivePage={setActivePage} />}
          {activePage === 'admin' && <AdminPage />}
        </main>
      </div>

      <AudioPlayer onToggleQueue={() => setQueueOpen(true)} />
      <QueueDrawer isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
      <AddToPlaylistModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainLayout />
      </PlayerProvider>
    </AuthProvider>
  );
}
