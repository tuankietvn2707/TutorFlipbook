import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Book } from '../../types';
import { loadAllBooksWithPagesFromDB, loadBookById } from '../dbService';
import { auth, db } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import { getVerifiedEmailLibraryId, listLegacyUidBookIds } from './firebaseLibraryPath';
import { compressCoverImageForCloud, sanitizeFirestoreId } from './firebaseMediaHelpers';
import { downloadBookPagesFromCloud, uploadBookPagesToCloud } from './firebasePageSync';
import { uploadBookAudioToCloud } from './firebaseAudioSync';
import { downloadBookAudioFromCloud } from './firebaseAudioDownload';
import { updateCloudSyncStatus } from './firebaseSyncState';
import {
  deleteBookFromCloud,
  hydrateBookFromCloud,
  markBookAsKnownInCloud,
  stopCloudBooksSubscription,
  subscribeToCloudBooks
} from './firebaseCloudBooks';

export {
  deleteBookFromCloud,
  hydrateBookFromCloud,
  stopCloudBooksSubscription,
  subscribeToCloudBooks
};

export async function syncBookToCloud(
  book: Book,
  options: { includePages?: boolean; includeAudio?: boolean } = {}
): Promise<void> {
  const libraryId = getVerifiedEmailLibraryId();
  const uid = auth.currentUser?.uid;
  if (!libraryId || !uid) return;

  const bookId = sanitizeFirestoreId(book.id);
  const bookPath = `libraries/${libraryId}/books/${bookId}`;
  const bookRef = doc(db, 'libraries', libraryId, 'books', bookId);

  const includePages = options.includePages ?? true;
  const includeAudio = options.includeAudio ?? true;

  updateCloudSyncStatus({
    isSyncing: true,
    syncingLabel: `Đang đồng bộ "${book.title}" lên Cloud...`,
    progressPercent: 10
  });

  try {
    const existingSnap = await getDoc(bookRef);
    const coverImage = await compressCoverImageForCloud(book.coverImage || book.pages?.[0] || '');
    const audioCount = book.audioTracks?.length || 0;
    const baseFields = {
      ownerId: uid,
      title: (book.title || 'Untitled Book').slice(0, 300),
      category: (book.category || 'textbook').slice(0, 64),
      color: (book.color || 'emerald').slice(0, 32),
      totalPages: Math.max(0, book.totalPages || book.pages?.length || 0),
      coverImage,
      videoUrl: (book.videoUrl || '').slice(0, 2048),
      audioCount,
      syncStatus: 'syncing',
      lastModified: book.lastModified || Date.now(),
      updatedAt: serverTimestamp()
    };

    if (existingSnap.exists()) {
      await updateDoc(bookRef, baseFields);
    } else {
      await setDoc(bookRef, {
        id: bookId,
        ownerEmail: libraryId,
        ...baseFields,
        bookCreatedAt: (book.createdAt || new Date().toISOString()).slice(0, 64),
        createdAt: serverTimestamp()
      });
    }

    const fullLocal =
      book.pages && book.pages.length > 1 ? book : (await loadBookById(book.id)) || book;

    if ((includePages || !existingSnap.exists()) && fullLocal.pages?.length) {
      await uploadBookPagesToCloud(libraryId, uid, bookId, fullLocal.pages, (done, total) => {
        const pct = Math.min(75, 15 + Math.round((done / Math.max(1, total)) * 60));
        updateCloudSyncStatus({
          progressPercent: pct,
          syncingLabel: `Đang tải trang sách "${book.title}" (${done}/${total})...`
        });
      });
    }

    if (includeAudio) {
      const tracks = fullLocal.audioTracks || [];
      await uploadBookAudioToCloud(libraryId, uid, bookId, tracks, (done, total) => {
        const pct = Math.min(95, 75 + Math.round((done / Math.max(1, total)) * 20));
        updateCloudSyncStatus({
          progressPercent: pct,
          syncingLabel: `Đang tải audio "${book.title}" (${done}/${total})...`
        });
      });
    }

    await updateDoc(bookRef, { syncStatus: 'synced', updatedAt: serverTimestamp() });
    markBookAsKnownInCloud(bookId);
    updateCloudSyncStatus({
      isSyncing: false,
      syncingLabel: 'Đã đồng bộ xong',
      progressPercent: 100,
      lastSyncedAt: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (err) {
    updateCloudSyncStatus({ isSyncing: false, syncingLabel: '', progressPercent: 0 });
    handleFirestoreError(err, OperationType.WRITE, bookPath);
  }
}

export async function migrateLegacyBooksAndSyncLocal(existingCloudIds: Set<string>): Promise<void> {
  const libraryId = getVerifiedEmailLibraryId();
  const uid = auth.currentUser?.uid;
  if (!libraryId || !uid) return;

  const legacyIds = await listLegacyUidBookIds(uid);
  for (const legacyId of legacyIds) {
    if (existingCloudIds.has(legacyId)) continue;
    try {
      const legacySnap = await getDoc(doc(db, 'users', uid, 'books', legacyId));
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
    } catch {
      // continue migrating others
    }
  }

  const allLocal = await loadAllBooksWithPagesFromDB();
  for (const book of allLocal) {
    const safeId = sanitizeFirestoreId(book.id);
    if (existingCloudIds.has(safeId)) continue;
    if (!book.pages || book.pages.length === 0) continue;
    await syncBookToCloud(book, { includePages: true, includeAudio: true });
  }
}

export async function syncAllLocalBooksToCloud(): Promise<number> {
  if (!getVerifiedEmailLibraryId()) return 0;
  const allLocal = await loadAllBooksWithPagesFromDB();
  let synced = 0;
  for (const book of allLocal) {
    if (!book.pages || book.pages.length === 0) continue;
    await syncBookToCloud(book, { includePages: true, includeAudio: true });
    synced++;
  }
  return synced;
}
