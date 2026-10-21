import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { TopNav } from './components/layout/TopNav.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { HomeView } from './views/HomeView.tsx';
import { MoviesView } from './views/MoviesView.tsx';
import { TvShowsView } from './views/TvShowsView.tsx';
import { SportsView } from './views/SportsView.tsx';
import { LiveTvView } from './views/LiveTvView.tsx';
import { MyListView } from './views/MyListView.tsx';
import { HistoryView } from './views/HistoryView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { TmdbOnboardingModal } from './components/onboarding/TmdbOnboardingModal.tsx';
import { MediaDetailModal } from './components/media/MediaDetailModal.tsx';
import { SearchModal } from './components/search/SearchModal.tsx';
import { VideoPlayer } from './components/player/VideoPlayer.tsx';
import { MediaItem, NavigationTab, PlaybackTarget, SportsMatch } from './types/index.ts';
import { storage } from './services/storage.ts';
import { zetsuCore } from './services/zetsuCore.ts';
import { useTvNavigation } from './hooks/useTvNavigation.ts';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals & Player State
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedSportsMatch, setSelectedSportsMatch] = useState<SportsMatch | null>(null);
  const [playbackTarget, setPlaybackTarget] = useState<PlaybackTarget | null>(null);

  // Smart TV Remote D-Pad Navigation & Back Button handler
  useTvNavigation({
    onBack: () => {
      if (playbackTarget) {
        setPlaybackTarget(null);
        return true;
      }
      if (selectedMedia) {
        setSelectedMedia(null);
        return true;
      }
      if (showSearchModal) {
        setShowSearchModal(false);
        return true;
      }
      if (showTmdbModal) {
        setShowTmdbModal(false);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    },
  });

  // Status
  const [hasTmdbKey, setHasTmdbKey] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [myListCount, setMyListCount] = useState(0);

  useEffect(() => {
    // 1. Check TMDB status
    const key = storage.getTmdbKey();
    setHasTmdbKey(!!key);

    // Initial launch: Prompt for TMDB API Key if not configured
    if (!key && !storage.hasOnboarded()) {
      setShowTmdbModal(true);
    }

    // 2. Check Backend health
    zetsuCore.isOnline().then(setIsBackendOnline);

    // 3. Update My List count
    setMyListCount(storage.getMyList().length);

    // 4. Global Keyboard Shortcut for Search (Ctrl+K or Cmd+K)
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleTmdbModalClose = (saved: boolean) => {
    setShowTmdbModal(false);
    if (saved) {
      setHasTmdbKey(true);
      // Reload current view
      window.location.reload();
    }
  };

  const handleSelectSportMatch = (match: SportsMatch) => {
    setSelectedSportsMatch(match);
    setActiveTab('sports');
  };

  return (
    <div className="flex h-screen w-screen bg-[#070a08] text-[#f3f7f5] overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMyListCount(storage.getMyList().length);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        myListCount={myListCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <TopNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenTmdbModal={() => setShowTmdbModal(true)}
          hasTmdbKey={hasTmdbKey}
          isBackendOnline={isBackendOnline}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 pb-28 md:pb-8">
          {activeTab === 'home' && (
            <HomeView
              onSelectMedia={setSelectedMedia}
              onSelectSport={handleSelectSportMatch}
              onStartPlayback={setPlaybackTarget}
            />
          )}

          {activeTab === 'movies' && (
            <MoviesView onSelectMedia={setSelectedMedia} />
          )}

          {activeTab === 'tv' && (
            <TvShowsView onSelectMedia={setSelectedMedia} />
          )}

          {activeTab === 'sports' && (
            <SportsView
              onStartPlayback={setPlaybackTarget}
              selectedMatchInitial={selectedSportsMatch}
            />
          )}

          {activeTab === 'livetv' && (
            <LiveTvView onStartPlayback={setPlaybackTarget} />
          )}

          {activeTab === 'mylist' && (
            <MyListView
              onSelectMedia={setSelectedMedia}
              onBrowseCatalog={() => setActiveTab('movies')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              onStartPlayback={setPlaybackTarget}
              onBrowseCatalog={() => setActiveTab('movies')}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMyListCount(storage.getMyList().length);
          }}
          myListCount={myListCount}
        />
      </div>

      {/* Onboarding / TMDB Key Setup Modal */}
      <TmdbOnboardingModal
        isOpen={showTmdbModal}
        onClose={handleTmdbModalClose}
      />

      {/* Instant Search Modal (Ctrl + K) */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectMedia={setSelectedMedia}
        onSelectSport={handleSelectSportMatch}
      />

      {/* Media Detail Modal */}
      <MediaDetailModal
        item={selectedMedia}
        onClose={() => {
          setSelectedMedia(null);
          setMyListCount(storage.getMyList().length);
        }}
        onStartPlayback={(target) => {
          setSelectedMedia(null);
          setPlaybackTarget(target);
        }}
      />

      {/* Fullscreen Video Player */}
      {playbackTarget && (
        <VideoPlayer
          key={`${playbackTarget.tmdbId || playbackTarget.title}_${playbackTarget.season || 0}_${playbackTarget.episode || 0}`}
          target={playbackTarget}
          onClose={() => setPlaybackTarget(null)}
        />
      )}
    </div>
  );
};
