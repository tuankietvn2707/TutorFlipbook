import { appState } from '../state/appState';
import { Book } from '../types';
import { showToast } from '../utils/toast';
import { setupAnnotationListeners } from '../services/annotationService';
import { setupSidebarListeners } from '../components/Sidebar';
import { setupHeaderListeners, updateHeaderStats } from '../components/Header';
import { setupLibraryListeners, renderLibraryGrid } from '../components/LibraryView';
import {
  setupFlipbookReaderListeners,
  openBookInReader,
  toggleFullscreenTeachingMode
} from '../components/FlipbookReader';
import { setupMediaDockListeners } from '../components/MediaDock';
import { setupMobileNavListeners } from '../components/MobileBottomNav';
import { setupUploadModalListeners, openUploadModal } from '../components/UploadModal';
import { setupBatchMediaListeners, openBatchMediaModal } from '../components/BatchMediaModal';
import { setupCloudSyncListeners, openCloudSyncModal } from '../components/CloudSyncModal';
import { registerLibrarySyncCallback } from '../services/firebaseService';
import { setupThumbnailsListeners, openThumbnailsModal } from '../components/ThumbnailsModal';
import { setupShortcutsListeners } from '../components/ShortcutsModal';
import { setupVideoModalListeners, openVideoModal } from '../components/VideoModal';
import { setupDeleteConfirmListeners, openDeleteConfirmModal } from '../components/DeleteConfirmModal';
import { setupPwaListeners, openPwaInstallModal } from '../components/PwaInstallModal';
import { handleOpenBook, showLibraryView, showReaderView } from './viewRouter';

export function initializeAppListeners(): void {
  setupSidebarListeners({
    onShowLibrary: showLibraryView,
    onResumeReader: showReaderView,
    onOpenTeachingMeet: () => {
      showReaderView();
      if (appState.get('currentBook') && !appState.get('isTeachingMode')) {
        toggleFullscreenTeachingMode();
      }
    },
    onOpenUploadModal: openUploadModal,
    onOpenBatchMediaModal: openBatchMediaModal,
    onOpenDriveModal: openCloudSyncModal,
    onOpenPwaModal: openPwaInstallModal
  });

  setupHeaderListeners({
    onSearch: (query) => {
      appState.set('searchQuery', query);
      renderLibraryGrid();
    },
    onShowLibrary: showLibraryView,
    onOpenUpload: openUploadModal,
    onOpenDriveModal: openCloudSyncModal,
    onOpenPwaModal: openPwaInstallModal
  });

  setupLibraryListeners({
    onOpenBook: handleOpenBook,
    onDeleteBook: (book) => openDeleteConfirmModal(book),
    onOpenUpload: openUploadModal,
    onOpenBatchMedia: (bookId?: string) => openBatchMediaModal(bookId)
  });

  setupFlipbookReaderListeners({
    onBackToLibrary: showLibraryView,
    onOpenThumbnails: openThumbnailsModal,
    onOpenBatchAudio: openBatchMediaModal,
    onOpenVideo: (url, title) => openVideoModal(url, title)
  });

  setupMediaDockListeners({ onOpenBatchMedia: openBatchMediaModal });

  setupMobileNavListeners({
    onShowLibrary: showLibraryView,
    onResumeReader: showReaderView,
    onOpenUpload: openUploadModal,
    onToggleAudio: () => {
      appState.set('isMediaDockOpen', !appState.get('isMediaDockOpen'));
    },
    onOpenDrive: openCloudSyncModal
  });

  setupUploadModalListeners((newBook: Book) => {
    const updated = [newBook, ...appState.get('allBooks')];
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

  setupCloudSyncListeners();
  registerLibrarySyncCallback(() => {
    renderLibraryGrid();
    updateHeaderStats(appState.get('allBooks').length);
  });

  setupThumbnailsListeners();
  setupShortcutsListeners();
  setupVideoModalListeners();

  setupDeleteConfirmListeners((deletedId: string) => {
    const filtered = appState.get('allBooks').filter(b => b.id !== deletedId);
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
  setupAnnotationListeners();
}
