import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { Book } from '../../types';
import { appState } from '../../state/appState';
import {
  deleteBookFromDB,
  loadAllBooksFromDB,
  loadBookById,
  saveBookToDB
} from '../dbService';
import { auth, db } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import { sanitizeFirestoreId } from './firebaseMediaHelpers';
import { deleteAllBookPagesFromCloud, downloadBookPagesFromCloud } from './firebasePageSync';
import { deleteBookAudioFromCloud } from './firebaseAudioSync';
import { downloadBookAudioFromCloud } from './firebaseAudioDownload';
import { updateCloudSyncStatus } from './firebaseSyncState';

let activeBooksUnsubscribe: (() => void) | null = null;
const knownCloudIds = new Set<string>();

export function isVerifiedSignedIn(): boolean {
  return Boolean(auth.currentUser?.uid && auth.currentUser.emailVerified);
}

export function markBookAsKnownInCloud(bookId: string): void {
  knownCloudIds.add(sanitizeFirestoreId(bookId));
}

export function stopCloudBooksSubscription(): void {
  activeBooksUnsubscribe?.();
  activeBooksUnsubscribe = null;
  knownCloudIds.clear();
}

export async function hydrateBookFromCloud(bookId: string): Promise<Book | null> {
  if (!isVerifiedSignedIn()) return null;
  const uid = auth.currentUser!.uid;
  const safeId = sanitizeFirestoreId(bookId);
  const bookRef = doc(db, 'users', uid, 'books', safeId);

  try {
    const metaSnap = await getDoc(bookRef);
    if (!metaSnap.exists()) return null;
    const meta = metaSnap.data() as any;

    const pages = await downloadBookPagesFromCloud(uid, safeId);
    const audioTracks = await downloadBookAudioFromCloud(uid, safeId);
    const hydrated: Book = {
      id: meta.id || bookId,
      title: meta.title || 'Sách Cloud',
      category: meta.category || 'textbook',
      color: meta.color || 'emerald',
      totalPages: pages.length || meta.totalPages || 0,
      coverImage: meta.coverImage || pages[0] || '',
      pages,
      audioTracks,
      videoUrl: meta.videoUrl || '',
      createdAt: meta.bookCreatedAt || new Date().toISOString(),
      lastModified: meta.lastModified || Date.now()
    };

    await saveBookToDB(hydrated);
    const all = appState.get('allBooks');
    const idx = all.findIndex((b) => b.id === hydrated.id);
    if (idx !== -1) {
      all[idx] = hydrated;
      appState.set('allBooks', [...all]);
    }
    return hydrated;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}/books/${safeId}`);
  }
}

export async function deleteBookFromCloud(bookId: string): Promise<void> {
  if (!isVerifiedSignedIn()) return;
  const uid = auth.currentUser!.uid;
  const safeId = sanitizeFirestoreId(bookId);
  const bookPath = `users/${uid}/books/${safeId}`;

  try {
    await deleteAllBookPagesFromCloud(uid, safeId);
    await deleteBookAudioFromCloud(uid, safeId);
    await deleteDoc(doc(db, 'users', uid, 'books', safeId));
    knownCloudIds.delete(safeId);
    updateCloudSyncStatus({
      cloudBookCount: knownCloudIds.size,
      lastSyncedAt: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, bookPath);
  }
}

export function subscribeToCloudBooks(
  uid: string,
  onSyncedChange: () => void,
  onInitialCloudIds?: (cloudIds: Set<string>) => void
): () => void {
  stopCloudBooksSubscription();
  const booksPath = `users/${uid}/books`;
  const q = query(collection(db, 'users', uid, 'books'), where('ownerId', '==', uid));
  let isFirstSnapshot = true;

  activeBooksUnsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const currentCloudIds = new Set<string>();
      for (const d of snapshot.docs) {
        const meta = d.data() as any;
        currentCloudIds.add(d.id);
        const existingLocal = await loadBookById(meta.id || d.id);
        const cloudAudioCount = meta.audioCount ?? 0;
        const audioOutdated =
          existingLocal &&
          (existingLocal.audioTracks?.length || 0) !== cloudAudioCount &&
          (meta.lastModified || 0) >= (existingLocal.lastModified || 0);

        const mergedBook: Book = {
          id: meta.id || d.id,
          title: meta.title || 'Sách 3D',
          category: meta.category || 'textbook',
          color: meta.color || 'emerald',
          totalPages: meta.totalPages || 0,
          coverImage: meta.coverImage || '',
          pages: existingLocal?.pages?.length ? existingLocal.pages : meta.coverImage ? [meta.coverImage] : [],
          audioTracks: audioOutdated
            ? new Array(cloudAudioCount).fill({ id: '', name: '', url: '' })
            : existingLocal?.audioTracks?.length
            ? existingLocal.audioTracks
            : new Array(cloudAudioCount).fill({ id: '', name: '', url: '' }),
          videoUrl: meta.videoUrl || '',
          createdAt: meta.bookCreatedAt || new Date().toISOString(),
          lastModified: meta.lastModified || Date.now()
        };
        await saveBookToDB(mergedBook);
      }

      for (const prevId of Array.from(knownCloudIds)) {
        if (!currentCloudIds.has(prevId)) {
          await deleteBookFromDB(prevId);
        }
      }
      knownCloudIds.clear();
      currentCloudIds.forEach((id) => knownCloudIds.add(id));

      const refreshed = await loadAllBooksFromDB(false);
      appState.set('allBooks', refreshed);
      updateCloudSyncStatus({
        cloudBookCount: currentCloudIds.size,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN')
      });
      onSyncedChange();

      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        onInitialCloudIds?.(currentCloudIds);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, booksPath);
    }
  );

  return activeBooksUnsubscribe;
}
