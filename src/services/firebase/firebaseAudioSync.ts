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
import { db, withTimeout } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import {
  sanitizeFirestoreId,
  serializeAudioTrackPayload,
  splitStringIntoChunks
} from './firebaseMediaHelpers';
import { deleteTrackChunksFromCloud } from './firebaseAudioDelete';

const AUDIO_CHUNK_BATCH_LIMIT = 4;

export async function uploadBookAudioToCloud(
  libraryId: string,
  uid: string,
  bookId: string,
  tracks: AudioTrack[],
  onProgress?: (done: number, total: number) => void,
  isNewBook: boolean = false
): Promise<void> {
  const tracksPath = `libraries/${libraryId}/books/${bookId}/audioTracks`;
  const tracksCol = collection(db, 'libraries', libraryId, 'books', bookId, 'audioTracks');

  let existingTrackIds = new Set<string>();
  if (!isNewBook) {
    try {
      const snap = await withTimeout(
        getDocs(query(tracksCol, where('ownerEmail', '==', libraryId), where('bookId', '==', bookId))),
        25000,
        'Kiểm tra danh sách Audio quá thời gian chờ.'
      );
      existingTrackIds = new Set(snap.docs.map((d) => d.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, tracksPath);
    }
  }

  const normalized = tracks.map((t, index) => ({
    track: t,
    trackId: sanitizeFirestoreId(t.id),
    sortOrder: index
  }));
  const desiredIds = new Set(normalized.map((item) => item.trackId));

  for (const staleId of existingTrackIds) {
    if (!desiredIds.has(staleId)) {
      await deleteTrackChunksFromCloud(libraryId, bookId, staleId);
      try {
        await withTimeout(deleteDoc(doc(tracksCol, staleId)), 20000);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${tracksPath}/${staleId}`);
      }
    }
  }

  onProgress?.(0, normalized.length);

  for (let idx = 0; idx < normalized.length; idx++) {
    const { track, trackId, sortOrder } = normalized[idx];
    const trackPath = `${tracksPath}/${trackId}`;
    const trackRef = doc(tracksCol, trackId);
    const payload = await serializeAudioTrackPayload(track);
    const chunks = payload.dataString ? splitStringIntoChunks(payload.dataString) : [];

    const metaFields = {
      ownerId: uid,
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

    const isExistingTrack = existingTrackIds.has(trackId);
    try {
      if (isExistingTrack) {
        await withTimeout(updateDoc(trackRef, metaFields), 25000);
      } else {
        await withTimeout(
          setDoc(trackRef, {
            id: trackId,
            ownerId: uid,
            ownerEmail: libraryId,
            bookId,
            ...metaFields,
            createdAt: serverTimestamp()
          }),
          25000
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, trackPath);
    }

    await uploadSingleTrackChunks(libraryId, uid, bookId, trackId, chunks, !isExistingTrack);
    onProgress?.(idx + 1, normalized.length);
  }
}

async function uploadSingleTrackChunks(
  libraryId: string,
  uid: string,
  bookId: string,
  trackId: string,
  chunks: string[],
  isNewTrack: boolean
): Promise<void> {
  if (chunks.length === 0 && isNewTrack) return;
  const chunksPath = `libraries/${libraryId}/books/${bookId}/audioTracks/${trackId}/chunks`;
  const chunksCol = collection(
    db,
    'libraries',
    libraryId,
    'books',
    bookId,
    'audioTracks',
    trackId,
    'chunks'
  );

  let existingChunkIds = new Set<string>();
  if (!isNewTrack) {
    const existingChunkSnap = await withTimeout(
      getDocs(
        query(
          chunksCol,
          where('ownerEmail', '==', libraryId),
          where('bookId', '==', bookId),
          where('trackId', '==', trackId)
        )
      ),
      25000
    );
    existingChunkIds = new Set(existingChunkSnap.docs.map((d) => d.id));
    const desiredChunkIds = new Set(chunks.map((_, ci) => `chunk_${ci}`));
    const staleDocs = existingChunkSnap.docs.filter((d) => !desiredChunkIds.has(d.id));
    for (let s = 0; s < staleDocs.length; s += 50) {
      const batch = writeBatch(db);
      staleDocs.slice(s, s + 50).forEach((d) => batch.delete(d.ref));
      await withTimeout(batch.commit(), 25000);
    }
  }

  for (let c = 0; c < chunks.length; c += AUDIO_CHUNK_BATCH_LIMIT) {
    const slice = chunks.slice(c, c + AUDIO_CHUNK_BATCH_LIMIT);
    const batch = writeBatch(db);
    slice.forEach((chunkData, offset) => {
      const chunkIndex = c + offset;
      const chunkId = `chunk_${chunkIndex}`;
      const chunkRef = doc(chunksCol, chunkId);
      if (existingChunkIds.has(chunkId)) {
        batch.update(chunkRef, { ownerId: uid, chunkIndex, data: chunkData, updatedAt: serverTimestamp() });
      } else {
        batch.set(chunkRef, {
          ownerId: uid,
          ownerEmail: libraryId,
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
      await withTimeout(batch.commit(), 30000, 'Tải dữ liệu Audio lên Cloud quá thời gian chờ.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, chunksPath);
    }
  }
}
