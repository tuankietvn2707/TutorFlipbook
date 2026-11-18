import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Book } from '../../types';
import { loadBookById } from '../dbService';
import { auth, db, withTimeout } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import { getVerifiedEmailLibraryId } from './firebaseLibraryPath';
import { compressCoverImageForCloud, sanitizeFirestoreId } from './firebaseMediaHelpers';
import { uploadBookPagesToCloud } from './firebasePageSync';
import { uploadBookAudioToCloud } from './firebaseAudioSync';
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
    syncingLabel: `Đang kiểm tra "${book.title}" trên Cloud...`,
    progressPercent: 5
  });

  try {
    const existingSnap = await withTimeout(getDoc(bookRef), 25000, 'Kiểm tra sách trên Cloud quá thời gian chờ.');
    const isNewBook = !existingSnap.exists();

    updateCloudSyncStatus({
      syncingLabel: `Đang chuẩn bị bìa sách "${book.title}"...`,
      progressPercent: 10
    });
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

    updateCloudSyncStatus({
      syncingLabel: `Đang ghi thông tin "${book.title}" lên Cloud...`,
      progressPercent: 12
    });

    if (!isNewBook) {
      await withTimeout(updateDoc(bookRef, baseFields), 25000);
    } else {
      await withTimeout(
        setDoc(bookRef, {
          id: bookId,
          ownerEmail: libraryId,
          ...baseFields,
          bookCreatedAt: (book.createdAt || new Date().toISOString()).slice(0, 64),
          createdAt: serverTimestamp()
        }),
        25000,
        'Lưu thông tin sách lên Cloud quá thời gian chờ.'
      );
    }

    const fullLocal =
      book.pages && book.pages.length > 1 ? book : (await loadBookById(book.id)) || book;

    if ((includePages || isNewBook) && fullLocal.pages?.length) {
      updateCloudSyncStatus({
        syncingLabel: `Đang nén & tải ${fullLocal.pages.length} trang "${book.title}"...`,
        progressPercent: 15
      });
      await uploadBookPagesToCloud(
        libraryId,
        uid,
        bookId,
        fullLocal.pages,
        (done, total) => {
          const pct = Math.min(75, 16 + Math.round((done / Math.max(1, total)) * 59));
          updateCloudSyncStatus({
            progressPercent: pct,
            syncingLabel: `Đang tải trang "${book.title}" (${done}/${total} gói)...`
          });
        },
        isNewBook
      );
    }

    if (includeAudio && (fullLocal.audioTracks?.length || !isNewBook)) {
      const tracks = fullLocal.audioTracks || [];
      await uploadBookAudioToCloud(
        libraryId,
        uid,
        bookId,
        tracks,
        (done, total) => {
          const pct = Math.min(95, 75 + Math.round((done / Math.max(1, total)) * 20));
          updateCloudSyncStatus({
            progressPercent: pct,
            syncingLabel: `Đang tải Audio "${book.title}" (${done}/${total})...`
          });
        },
        isNewBook
      );
    }

    await withTimeout(updateDoc(bookRef, { syncStatus: 'synced', updatedAt: serverTimestamp() }), 20000);
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
