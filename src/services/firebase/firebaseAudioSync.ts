import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { AudioTrack } from '../../types';
import { db } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import {
  sanitizeFirestoreId,
  serializeAudioTrackPayload,
  splitStringIntoChunks
} from './firebaseMediaHelpers';

const AUDIO_CHUNK_BATCH_LIMIT = 8;

export async function deleteTrackChunksFromCloud(
  uid: string,
  bookId: string,
  trackId: string
): Promise<void> {
  const chunksPath = `users/${uid}/books/${bookId}/audioTracks/${trackId}/chunks`;
  const colRef = collection(db, 'users', uid, 'books', bookId, 'audioTracks', trackId, 'chunks');
  try {
    const snap = await getDocs(
      query(
        colRef,
        where('ownerId', '==', uid),
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

export async function deleteBookAudioFromCloud(uid: string, bookId: string): Promise<void> {
  const tracksPath = `users/${uid}/books/${bookId}/audioTracks`;
  const tracksCol = collection(db, 'users', uid, 'books', bookId, 'audioTracks');
  try {
    const snap = await getDocs(
      query(tracksCol, where('ownerId', '==', uid), where('bookId', '==', bookId))
    );
    for (const trackDoc of snap.docs) {
      await deleteTrackChunksFromCloud(uid, bookId, trackDoc.id);
      await deleteDoc(trackDoc.ref);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, tracksPath);
  }
}

export async function uploadBookAudioToCloud(
  uid: string,
  bookId: string,
  tracks: AudioTrack[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const tracksPath = `users/${uid}/books/${bookId}/audioTracks`;
  const tracksCol = collection(db, 'users', uid, 'books', bookId, 'audioTracks');

  let existingTrackIds = new Set<string>();
  try {
    const snap = await getDocs(
      query(tracksCol, where('ownerId', '==', uid), where('bookId', '==', bookId))
    );
    existingTrackIds = new Set(snap.docs.map((d) => d.id));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, tracksPath);
  }

  const normalized = tracks.map((t, index) => ({
    track: t,
    trackId: sanitizeFirestoreId(t.id),
    sortOrder: index
  }));
  const desiredIds = new Set(normalized.map((item) => item.trackId));

  for (const staleId of existingTrackIds) {
    if (!desiredIds.has(staleId)) {
      await deleteTrackChunksFromCloud(uid, bookId, staleId);
      try {
        await deleteDoc(doc(tracksCol, staleId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${tracksPath}/${staleId}`);
      }
    }
  }

  for (let idx = 0; idx < normalized.length; idx++) {
    const { track, trackId, sortOrder } = normalized[idx];
    const trackPath = `${tracksPath}/${trackId}`;
    const trackRef = doc(tracksCol, trackId);
    const payload = await serializeAudioTrackPayload(track);
    const chunks = payload.dataString ? splitStringIntoChunks(payload.dataString) : [];

    const metaFields = {
      name: (track.name || 'Audio').slice(0, 300),
      folder: (track.folder || '').slice(0, 200),
      fileType: (track.fileType || 'MP3').slice(0, 32),
      mimeType: payload.mimeType.slice(0, 128),
      size: Math.max(0, Math.round(payload.size || 0)),
      totalChunks: chunks.length,
      externalUrl: payload.externalUrl,
      sortOrder,
      updatedAt: serverTimestamp()
    };

    try {
      if (existingTrackIds.has(trackId)) {
        await updateDoc(trackRef, metaFields);
      } else {
        await setDoc(trackRef, {
          id: trackId,
          ownerId: uid,
          bookId,
          ...metaFields,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, trackPath);
    }

    await uploadSingleTrackChunks(uid, bookId, trackId, chunks);
    onProgress?.(idx + 1, normalized.length);
  }
}

async function uploadSingleTrackChunks(
  uid: string,
  bookId: string,
  trackId: string,
  chunks: string[]
): Promise<void> {
  const chunksPath = `users/${uid}/books/${bookId}/audioTracks/${trackId}/chunks`;
  const chunksCol = collection(db, 'users', uid, 'books', bookId, 'audioTracks', trackId, 'chunks');

  const existingChunkSnap = await getDocs(
    query(
      chunksCol,
      where('ownerId', '==', uid),
      where('bookId', '==', bookId),
      where('trackId', '==', trackId)
    )
  );
  const existingChunkIds = new Set(existingChunkSnap.docs.map((d) => d.id));
  const desiredChunkIds = new Set(chunks.map((_, ci) => `chunk_${ci}`));

  const staleDocs = existingChunkSnap.docs.filter((d) => !desiredChunkIds.has(d.id));
  for (let s = 0; s < staleDocs.length; s += 50) {
    const batch = writeBatch(db);
    staleDocs.slice(s, s + 50).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  for (let c = 0; c < chunks.length; c += AUDIO_CHUNK_BATCH_LIMIT) {
    const slice = chunks.slice(c, c + AUDIO_CHUNK_BATCH_LIMIT);
    const batch = writeBatch(db);
    slice.forEach((chunkData, offset) => {
      const chunkIndex = c + offset;
      const chunkId = `chunk_${chunkIndex}`;
      const chunkRef = doc(chunksCol, chunkId);
      if (existingChunkIds.has(chunkId)) {
        batch.update(chunkRef, { chunkIndex, data: chunkData, updatedAt: serverTimestamp() });
      } else {
        batch.set(chunkRef, {
          ownerId: uid,
          bookId,
          trackId,
          chunkIndex,
          data: chunkData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, chunksPath);
    }
  }
}
