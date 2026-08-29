import React, { useEffect, useRef } from 'react';
import { appState } from './state/appState';
import { loadAllBooksFromDB, saveBookToDB } from './services/dbService';
import { initAuthListener, requestDriveAuth } from './services/googleDriveService';
import { playFlipSound } from './services/audioService';
import { toggleLaser, toggleSpotlight, setDrawingTool, clearAllAnnotations } from './services/annotationService';
import { showToast } from './utils/toast';

// Modular Component Renderers & Listeners
import { renderSidebarHtml, setupSidebarListeners } from './components/Sidebar';
import { renderHeaderHtml, setupHeaderListeners, updateHeaderStats } from './components/Header';
import { renderLibraryViewHtml, setupLibraryListeners, renderLibraryGrid } from './components/LibraryView';
import {
  renderFlipbookReaderHtml,
  setupFlipbookReaderListeners,
  openBookInReader,
  flipNextPage,
  flipPrevPage,
  flipFirstPage,
  flipLastPage,
  zoomIn,
  zoomOut,
  resetReaderZoom,
  togglePanTool,
  toggleFullscreenTeachingMode,
  triggerRewardConfetti,
  jumpToPage
} from './components/FlipbookReader';
import {
  renderMediaDockHtml,
  setupMediaDockListeners,
  togglePlayAudio,
  playNextTrack,
  playPrevTrack,
  toggleMediaDockVisibility
} from './components/MediaDock';
import { renderMobileBottomNavHtml, setupMobileNavListeners } from './components/MobileBottomNav';
import { renderUploadModalHtml, setupUploadModalListeners, openUploadModal } from './components/UploadModal';
import { renderBatchMediaModalHtml, setupBatchMediaListeners, openBatchMediaModal } from './components/BatchMediaModal';
import { renderGoogleDriveModalHtml, setupGoogleDriveListeners, openGoogleDriveModal } from './components/GoogleDriveModal';
import { renderThumbnailsModalHtml, setupThumbnailsListeners, openThumbnailsModal } from './components/ThumbnailsModal';
import { renderShortcutsModalHtml, setupShortcutsListeners, openShortcutsModal, closeShortcutsModal } from './components/ShortcutsModal';
import { renderVideoModalHtml, setupVideoModalListeners, openVideoModal } from './components/VideoModal';
import { renderDeleteConfirmModalHtml, setupDeleteConfirmListeners, openDeleteConfirmModal } from './components/DeleteConfirmModal';
import { renderPwaInstallModalHtml, setupPwaListeners, openPwaInstallModal } from './components/PwaInstallModal';
import { Book } from './types';
import { refreshLucideIcons } from './utils/icons';

export default function App() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 1. Initialize Google Auth State Listener
    const unsubscribeAuth = initAuthListener();

    // 2. Initialize and Load Books from IndexedDB
    const initAppBooks = async () => {
      try {
        const books = await loadAllBooksFromDB();
        appState.set('allBooks', books);
        renderLibraryGrid();
        updateHeaderStats(books.length);
      } catch (err) {
        console.error('Failed to load books:', err);
      }
    };
    initAppBooks();

    // 3. Navigation View Switcher (Library vs Reader)
    const updateNavStyles = (activeTab: 'library' | 'reader') => {
      const navLib = document.getElementById('nav-btn-library');
      const navReader = document.getElementById('nav-btn-reader');
      const mobLib = document.getElementById('mob-nav-library');
      const mobReader = document.getElementById('mob-nav-reader');

      // Desktop Sidebar Library Tab
      if (navLib) {
        const badge = navLib.querySelector('.nav-icon-badge');
        const text = navLib.querySelector('.nav-text');
        if (activeTab === 'library') {
          navLib.className = 'btn-3d btn-nav-library-active w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer';
          if (badge) badge.className = 'nav-icon-badge w-9 h-9 rounded-xl bg-sky-500 text-white shadow-sm flex items-center justify-center transition-all group-hover:scale-105';
          if (text) text.className = 'nav-text text-sky-800 font-black';
        } else {
          navLib.className = 'btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer';
          if (badge) badge.className = 'nav-icon-badge w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-sky-500 group-hover:text-white';
          if (text) text.className = 'nav-text text-slate-700 group-hover:text-sky-700 font-extrabold';
        }
      }

      // Desktop Sidebar Reader Tab
      if (navReader) {
        const badge = navReader.querySelector('.nav-icon-badge');
        const text = navReader.querySelector('.nav-text');
        if (activeTab === 'reader') {
          navReader.className = 'btn-3d btn-nav-reader-active w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer';
          if (badge) badge.className = 'nav-icon-badge w-9 h-9 rounded-xl bg-emerald-500 text-white shadow-sm flex items-center justify-center transition-all group-hover:scale-105';
          if (text) text.className = 'nav-text text-emerald-800 font-black';
        } else {
          navReader.className = 'btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer';
          if (badge) badge.className = 'nav-icon-badge w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white';
          if (text) text.className = 'nav-text text-slate-700 group-hover:text-emerald-700 font-extrabold';
        }
      }

      // Mobile Bottom Nav Library
      if (mobLib) {
        const iconBox = mobLib.querySelector('.mob-icon-box');
        if (activeTab === 'library') {
          mobLib.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-sky-600 font-black text-[10px] gap-1 active:scale-95 transition-all';
          if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-sm';
        } else {
          mobLib.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-extrabold text-[10px] gap-1 active:scale-95 transition-all';
          if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center';
        }
      }

      // Mobile Bottom Nav Reader
      if (mobReader) {
        const iconBox = mobReader.querySelector('.mob-icon-box');
        if (activeTab === 'reader') {
          mobReader.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-emerald-600 font-black text-[10px] gap-1 active:scale-95 transition-all';
          if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm';
        } else {
          mobReader.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-extrabold text-[10px] gap-1 active:scale-95 transition-all';
          if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center';
        }
      }
    };

    const showLibraryView = () => {
      const libContainer = document.getElementById('view-library-container');
      const readerContainer = document.getElementById('view-reader-container');

      libContainer?.classList.remove('hidden');
      readerContainer?.classList.add('hidden');

      updateNavStyles('library');

      // Re-render library grid to ensure fresh counts
      renderLibraryGrid();
    };

    const showReaderView = () => {
      const curBook = appState.get('currentBook');
      const allBooks = appState.get('allBooks');
      if (!curBook && allBooks.length > 0) {
        openBookInReader(allBooks[0]);
      } else if (!curBook) {
        showToast('⚠️ Bạn chưa chọn cuốn sách nào để đọc');
        return;
      }

      const libContainer = document.getElementById('view-library-container');
      const readerContainer = document.getElementById('view-reader-container');

      libContainer?.classList.add('hidden');
      readerContainer?.classList.remove('hidden');

      updateNavStyles('reader');
    };

    // 4. Setup Component Listeners
    setupSidebarListeners({
      onShowLibrary: showLibraryView,
      onResumeReader: showReaderView,
      onOpenUploadModal: openUploadModal,
      onOpenBatchMediaModal: openBatchMediaModal,
      onOpenDriveModal: openGoogleDriveModal,
      onOpenPwaModal: openPwaInstallModal
    });

    setupHeaderListeners({
      onSearch: (query) => {
        appState.set('searchQuery', query);
        renderLibraryGrid();
      },
      onShowLibrary: showLibraryView,
      onOpenUpload: openUploadModal,
      onOpenDrive: openGoogleDriveModal
    });

    setupLibraryListeners({
      onOpenBook: (book) => {
        showReaderView();
        openBookInReader(book);
      },
      onDeleteBook: (book) => {
        openDeleteConfirmModal(book);
      },
      onOpenUpload: openUploadModal,
      onOpenBatchMedia: (bookId?: string) => openBatchMediaModal(bookId)
    });

    setupFlipbookReaderListeners({
      onBackToLibrary: showLibraryView,
      onOpenThumbnails: openThumbnailsModal,
      onOpenBatchAudio: openBatchMediaModal,
      onOpenVideo: (url, title) => openVideoModal(url, title)
    });

    setupMediaDockListeners({
      onOpenBatchMedia: openBatchMediaModal
    });

    setupMobileNavListeners({
      onShowLibrary: showLibraryView,
      onResumeReader: showReaderView,
      onOpenUpload: openUploadModal,
      onToggleAudio: () => {
        const isOpen = appState.get('isMediaDockOpen');
        appState.set('isMediaDockOpen', !isOpen);
      },
      onOpenDrive: openGoogleDriveModal
    });

    setupUploadModalListeners((newBook: Book) => {
      const all = appState.get('allBooks');
      const updated = [newBook, ...all];
      appState.set('allBooks', updated);
      renderLibraryGrid();
      updateHeaderStats(updated.length);
      openBookInReader(newBook);
      showReaderView();
      showToast(`🎉 Sách "${newBook.title}" đã được tải lên thành công!`);
    });

    setupBatchMediaListeners((updatedBook: Book) => {
      const all = appState.get('allBooks');
      const idx = all.findIndex(b => b.id === updatedBook.id);
      if (idx !== -1) {
        all[idx] = updatedBook;
        appState.set('allBooks', [...all]);
      }
      const cur = appState.get('currentBook');
      if (cur && cur.id === updatedBook.id) {
        appState.set('currentBook', { ...updatedBook });
      }
      renderLibraryGrid();
    });

    setupGoogleDriveListeners((importedBooks: Book[]) => {
      const current = appState.get('allBooks');
      const merged = [...importedBooks, ...current];
      // deduplicate
      const unique = merged.filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);
      appState.set('allBooks', unique);
      renderLibraryGrid();
      updateHeaderStats(unique.length);
    });

    setupThumbnailsListeners();
    setupShortcutsListeners();
    setupVideoModalListeners();

    setupDeleteConfirmListeners((deletedId: string) => {
      const all = appState.get('allBooks');
      const filtered = all.filter(b => b.id !== deletedId);
      appState.set('allBooks', filtered);
      renderLibraryGrid();
      updateHeaderStats(filtered.length);

      const cur = appState.get('currentBook');
      if (cur && cur.id === deletedId) {
        appState.set('currentBook', null);
        showLibraryView();
      }
    });

    setupPwaListeners();

    // 5. Global Keyboard Shortcuts for Online Teaching & Reading
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or contenteditable
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }

      const readerContainer = document.getElementById('view-reader-container');
      const isReaderVisible = readerContainer && !readerContainer.classList.contains('hidden');

      // Key routing
      switch (e.key) {
        // Page Navigation
        case 'ArrowRight':
        case 'PageDown':
        case 'j':
        case 'J':
          if (isReaderVisible) {
            e.preventDefault();
            flipNextPage();
          }
          break;

        case 'ArrowLeft':
        case 'PageUp':
        case 'k':
        case 'K':
          if (isReaderVisible) {
            e.preventDefault();
            flipPrevPage();
          }
          break;

        case 'Home':
          if (isReaderVisible) {
            e.preventDefault();
            flipFirstPage();
          }
          break;

        case 'End':
          if (isReaderVisible) {
            e.preventDefault();
            flipLastPage();
          }
          break;

        // Zoom & Pan
        case '+':
        case '=':
          if (isReaderVisible) {
            e.preventDefault();
            zoomIn();
          }
          break;

        case '-':
        case '_':
          if (isReaderVisible) {
            e.preventDefault();
            zoomOut();
          }
          break;

        case '0':
        case 'z':
        case 'Z':
          if (isReaderVisible) {
            e.preventDefault();
            resetReaderZoom();
          }
          break;

        case 'h':
        case 'H':
        case 'm':
        case 'M':
          if (isReaderVisible) {
            e.preventDefault();
            const active = togglePanTool();
            showToast(active ? '✋ Đã bật Bàn tay kéo trang [H]' : 'Đã tắt Bàn tay kéo trang');
          }
          break;

        // Teaching & Annotation Tools
        case 'l':
        case 'L':
          e.preventDefault();
          {
            const active = toggleLaser();
            showToast(active ? '🔴 Đã bật con trỏ Laser [L]' : 'Đã tắt con trỏ Laser');
          }
          break;

        case 's':
        case 'S':
          e.preventDefault();
          {
            const active = toggleSpotlight();
            showToast(active ? '💡 Đã bật Đèn rọi Spotlight [S]' : 'Đã tắt Đèn rọi Spotlight');
          }
          break;

        case 'p':
        case 'P':
        case '1':
          e.preventDefault();
          setDrawingTool('highlighter');
          showToast('🖍️ Đã chọn Bút dạ quang vàng [P]');
          break;

        case 'd':
        case 'D':
        case '2':
          e.preventDefault();
          setDrawingTool('pen-red');
          showToast('✏️ Đã chọn Bút vẽ đỏ [D]');
          break;

        case 'b':
        case 'B':
        case '3':
          e.preventDefault();
          setDrawingTool('pen-blue');
          showToast('🖊️ Đã chọn Bút vẽ xanh [B]');
          break;

        case 'e':
        case 'E':
        case '4':
          e.preventDefault();
          setDrawingTool('eraser');
          showToast('🧹 Đã chọn Cục tẩy [E]');
          break;

        case 'c':
        case 'C':
        case 'Delete':
          if (isReaderVisible) {
            e.preventDefault();
            clearAllAnnotations();
            showToast('🗑️ Đã xóa sạch nét vẽ trên trang [C]');
          }
          break;

        // Audio controls
        case ' ':
          // Spacebar toggles audio if audio dock is active or current track exists, otherwise flips page
          e.preventDefault();
          if (appState.get('currentBook')?.audioTracks?.length) {
            togglePlayAudio();
          } else if (isReaderVisible) {
            flipNextPage();
          }
          break;

        case 'a':
        case 'A':
          e.preventDefault();
          toggleMediaDockVisibility();
          break;

        case '[':
          e.preventDefault();
          playPrevTrack();
          break;

        case ']':
          e.preventDefault();
          playNextTrack();
          break;

        // Modals & Mode switches
        case 'g':
        case 'G':
        case 't':
        case 'T':
          if (isReaderVisible) {
            e.preventDefault();
            openThumbnailsModal();
          }
          break;

        case '?':
        case 'F1':
          e.preventDefault();
          openShortcutsModal();
          break;

        case 'f':
        case 'F':
          if (isReaderVisible) {
            e.preventDefault();
            toggleFullscreenTeachingMode();
          }
          break;

        case 'Escape':
          closeShortcutsModal();
          if (appState.get('isTeachingMode')) {
            toggleFullscreenTeachingMode();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 6. Initialize Lucide Icons
    refreshLucideIcons();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }
    };
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#F7F9FC]">
      {/* Laser Pointer Dot */}
      <div id="laser-pointer-dot"></div>

      {/* Spotlight Overlay */}
      <div id="spotlight-overlay"></div>

      {/* Main Sidebar */}
      <div
        id="main-sidebar-container"
        dangerouslySetInnerHTML={{ __html: renderSidebarHtml() }}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Main Header */}
        <div
          id="main-header-container"
          dangerouslySetInnerHTML={{ __html: renderHeaderHtml() }}
        />

        {/* Dynamic Views Viewport */}
        <div className="flex-1 overflow-hidden relative w-full h-full">
          {/* Library View */}
          <div
            id="view-library-container"
            className="h-full w-full overflow-y-auto p-4 sm:p-6 pb-24"
            dangerouslySetInnerHTML={{ __html: renderLibraryViewHtml() }}
          />

          {/* 3D Flipbook Reader View */}
          <div
            id="view-reader-container"
            className="hidden h-full w-full p-2 sm:p-3 pb-20 sm:pb-3 flex flex-col"
            dangerouslySetInnerHTML={{ __html: renderFlipbookReaderHtml() }}
          />
        </div>

        {/* Bottom Floating Media Dock */}
        <div
          id="media-dock-container"
          dangerouslySetInnerHTML={{ __html: renderMediaDockHtml() }}
        />

        {/* Mobile Bottom Navigation */}
        <div
          id="mobile-bottom-nav-container"
          dangerouslySetInnerHTML={{ __html: renderMobileBottomNavHtml() }}
        />
      </div>

      {/* Modals Container */}
      <div
        id="modals-root"
        dangerouslySetInnerHTML={{
          __html: `
            ${renderUploadModalHtml()}
            ${renderBatchMediaModalHtml()}
            ${renderGoogleDriveModalHtml()}
            ${renderThumbnailsModalHtml()}
            ${renderShortcutsModalHtml()}
            ${renderVideoModalHtml()}
            ${renderDeleteConfirmModalHtml()}
            ${renderPwaInstallModalHtml()}

            <!-- Global Toast Notification -->
            <div 
              id="toast" 
              class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white font-extrabold px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border-2 border-slate-700 max-w-sm text-xs sm:text-sm text-center opacity-0 -translate-y-24 backdrop-blur-md"
            >
              <span id="toast-message">Thông báo</span>
            </div>

            <!-- Global Loading Progress Overlay with Cancel Button -->
            <div 
              id="flipbook-loader" 
              class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-4"
            >
              <div class="relative w-20 h-20">
                <div class="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                <div class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center font-black text-xs text-emerald-400" id="loader-percent">
                  0%
                </div>
              </div>
              <div class="space-y-1">
                <p id="loader-status" class="font-black text-lg text-white">Đang nạp dữ liệu...</p>
                <p id="loader-substatus" class="text-xs font-bold text-slate-400">Vui lòng chờ trong giây lát</p>
              </div>
              <div class="w-64 max-w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div id="loader-progress-bar" class="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full w-0 transition-all duration-200"></div>
              </div>
              <button 
                type="button"
                id="btn-cancel-loading-op"
                onclick="window.cancelLoaderOp && window.cancelLoaderOp()"
                class="btn-3d btn-white text-xs font-black px-4 py-1.5 rounded-xl text-slate-700 mt-2"
              >
                Hủy Thao Tác
              </button>
            </div>
          `
        }}
      />
    </div>
  );
}
