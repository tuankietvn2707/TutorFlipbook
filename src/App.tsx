import React, { useEffect, useRef } from 'react';
import { appState } from './state/appState';
import { initFirebaseAuthListener } from './services/firebaseService';
import { refreshLucideIcons } from './utils/icons';
import { ErrorBoundary } from './components/ErrorBoundary';
import { renderSidebarHtml } from './components/Sidebar';
import { renderHeaderHtml } from './components/Header';
import { renderLibraryViewHtml } from './components/LibraryView';
import { renderFlipbookReaderHtml, cleanupFlipbookReader } from './components/FlipbookReader';
import { renderMediaDockHtml } from './components/MediaDock';
import { renderMobileBottomNavHtml } from './components/MobileBottomNav';
import { initAppBooks } from './app/viewRouter';
import { initializeAppListeners } from './app/setupComponents';
import { createGlobalKeyDownHandler } from './app/keyboardShortcuts';
import { renderAppModalsAndOverlaysHtml } from './app/appOverlaysHtml';

export default function App() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const unsubscribeAuth = initFirebaseAuthListener();
    initAppBooks();
    initializeAppListeners();

    const handleKeyDown = createGlobalKeyDownHandler();
    window.addEventListener('keydown', handleKeyDown);

    refreshLucideIcons();

    const handlePageHide = () => {
      cleanupFlipbookReader();
      const curBook = appState.get('currentBook');
      if (curBook) curBook.pages = [];
      appState.set('currentBook', null);
      appState.set('allBooks', []);
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pagehide', handlePageHide);
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-full w-full overflow-hidden bg-[#F8FAFC]">
        <div id="laser-pointer-dot"></div>
        <div id="spotlight-overlay"></div>

        <div
          id="main-sidebar-container"
          dangerouslySetInnerHTML={{ __html: renderSidebarHtml() }}
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <div
            id="main-header-container"
            dangerouslySetInnerHTML={{ __html: renderHeaderHtml() }}
          />

          <div className="flex-1 overflow-hidden relative w-full h-full">
            <div
              id="view-library-container"
              className="h-full w-full overflow-y-auto p-4 sm:p-6 pb-24"
              dangerouslySetInnerHTML={{ __html: renderLibraryViewHtml() }}
            />

            <div
              id="view-reader-container"
              className="hidden h-full w-full p-2 sm:p-3 pb-20 sm:pb-3 flex flex-col"
              dangerouslySetInnerHTML={{ __html: renderFlipbookReaderHtml() }}
            />
          </div>

          <div
            id="media-dock-container"
            dangerouslySetInnerHTML={{ __html: renderMediaDockHtml() }}
          />

          <div
            id="mobile-bottom-nav-container"
            dangerouslySetInnerHTML={{ __html: renderMobileBottomNavHtml() }}
          />
        </div>

        <div
          id="modals-root"
          dangerouslySetInnerHTML={{ __html: renderAppModalsAndOverlaysHtml() }}
        />
      </div>
    </ErrorBoundary>
  );
}
