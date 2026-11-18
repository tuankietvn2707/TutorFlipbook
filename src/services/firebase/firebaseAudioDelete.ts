import { collection, deleteDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';

export async function deleteTrackChunksFromCloud(
  libraryId: string,
  bookId: string,
  trackId: string
): Promise<void> {
  const chunksPath = `libraries/${libraryId}/books/${bookId}/audioTracks/${trackId}/chunks`;
  const colRef = collection(
    db,
    'libraries',
    libraryId,
    'books',
    bookId,
    'audioTracks',
    trackId,
    'chunks'
  );
  try {
    const snap = await getDocs(
      query(
        colRef,
        where('ownerEmail', '==', libraryId),
        where('bookId', '==', bookId),
        where('trackId', '==', trackId)
      )
    );
    for (let i = 0; i < snap.docs.length; i += 100) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 100).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, chunksPath);
  }
}

export async function deleteBookAudioFromCloud(
  libraryId: string,
  bookId: string
): Promise<void> {
  const tracksPath = `libraries/${libraryId}/books/${bookId}/audioTracks`;
  const tracksCol = collection(db, 'libraries', libraryId, 'books', bookId, 'audioTracks');
  try {
    const snap = await getDocs(
      query(tracksCol, where('ownerEmail', '==', libraryId), where('bookId', '==', bookId))
    );
    for (const trackDoc of snap.docs) {
      await deleteTrackChunksFromCloud(libraryId, bookId, trackDoc.id);
      await deleteDoc(trackDoc.ref);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, tracksPath);
  }
}
