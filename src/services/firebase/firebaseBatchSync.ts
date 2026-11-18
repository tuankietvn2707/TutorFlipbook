import { doc, getDoc } from 'firebase/firestore';
import { loadAllBooksFromDB, loadBookById } from '../dbService';
import { showToast } from '../../utils/toast';
import { auth, db, withTimeout } from './firebaseClient';
import { getVerifiedEmailLibraryId, listLegacyUidBookIds } from './firebaseLibraryPath';
import { sanitizeFirestoreId } from './firebaseMediaHelpers';
import { downloadBookPagesFromCloud } from './firebasePageSync';
import { downloadBookAudioFromCloud } from './firebaseAudioDownload';
import { updateCloudSyncStatus } from './firebaseSyncState';
import { syncBookToCloud } from './firebaseSyncService';

let activeBatchPromise: Promise<number> | null = null;

export async function migrateLegacyBooksAndSyncLocal(existingCloudIds: Set<string>): Promise<void> {
  const libraryId = getVerifiedEmailLibraryId();
  const uid = auth.currentUser?.uid;
  if (!libraryId || !uid || activeBatchPromise) return;

  activeBatchPromise = (async () => {
    let synced = 0;
    try {
      const legacyIds = await listLegacyUidBookIds(uid);
      for (const legacyId of legacyIds) {
        if (existingCloudIds.has(legacyId)) continue;
        const legacySnap = await withTimeout(getDoc(doc(db, 'users', uid, 'books', legacyId)), 20000);
        if (!legacySnap.exists()) continue;
        const meta = legacySnap.data() as any;
        const pages = await downloadBookPagesFromCloud(uid, legacyId, 'users');
        const audioTracks = await downloadBookAudioFromCloud(uid, legacyId, 'users');
        await syncBookToCloud({
          id: meta.id || legacyId,
          title: meta.title || 'Sách 3D',
          category: meta.category || 'textbook',
          color: meta.color || 'emerald',
          totalPages: pages.length || meta.totalPages || 0,
          coverImage: meta.coverImage || pages[0] || '',
          pages,
          audioTracks,
          videoUrl: meta.videoUrl || '',
          createdAt: meta.bookCreatedAt || new Date().toISOString(),
          lastModified: meta.lastModified || Date.now()
        });
        existingCloudIds.add(legacyId);
        synced++;
      }

      const localMetas = await loadAllBooksFromDB(false);
      for (const meta of localMetas) {
        const safeId = sanitizeFirestoreId(meta.id);
        if (existingCloudIds.has(safeId)) continue;
        const fullBook = await loadBookById(meta.id);
        if (!fullBook || !fullBook.pages || fullBook.pages.length === 0) continue;
        await syncBookToCloud(fullBook, { includePages: true, includeAudio: true });
        synced++;
      }
    } catch (err: any) {
      updateCloudSyncStatus({ isSyncing: false, syncingLabel: '', progressPercent: 0 });
      showToast(`⚠️ Đồng bộ tự động gặp sự cố: ${err?.message || 'Vui lòng thử lại'}`);
    } finally {
      activeBatchPromise = null;
    }
    return synced;
  })();

  await activeBatchPromise;
}

export async function syncAllLocalBooksToCloud(): Promise<number> {
  if (!getVerifiedEmailLibraryId()) return 0;
  if (activeBatchPromise) return activeBatchPromise;

  activeBatchPromise = (async () => {
    try {
      const localMetas = await loadAllBooksFromDB(false);
      let synced = 0;
      for (const meta of localMetas) {
        const fullBook = await loadBookById(meta.id);
        if (!fullBook || !fullBook.pages || fullBook.pages.length === 0) continue;
        await syncBookToCloud(fullBook, { includePages: true, includeAudio: true });
        synced++;
      }
      return synced;
    } finally {
      updateCloudSyncStatus({ isSyncing: false });
      activeBatchPromise = null;
    }
  })();

  return activeBatchPromise;
}
