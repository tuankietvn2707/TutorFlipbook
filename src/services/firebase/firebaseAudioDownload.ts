import { collection, getDocs, query, where } from 'firebase/firestore';
import { AudioTrack } from '../../types';
import { db } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import { reconstructAudioTrack } from './firebaseMediaHelpers';

export async function downloadBookAudioFromCloud(
  libraryId: string,
  bookId: string,
  collectionRoot: 'libraries' | 'users' = 'libraries'
): Promise<AudioTrack[]> {
  const tracksPath = `${collectionRoot}/${libraryId}/books/${bookId}/audioTracks`;
  const tracksCol = collection(db, collectionRoot, libraryId, 'books', bookId, 'audioTracks');
  const ownerField = collectionRoot === 'libraries' ? 'ownerEmail' : 'ownerId';

  try {
    const snap = await getDocs(
      query(tracksCol, where(ownerField, '==', libraryId), where('bookId', '==', bookId))
    );
    const trackMetas = snap.docs
      .map((d) => d.data() as any)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const results: AudioTrack[] = [];
    for (const meta of trackMetas) {
      let dataString = '';
      if ((meta.totalChunks ?? 0) > 0) {
        const chunksCol = collection(
          db,
          collectionRoot,
          libraryId,
          'books',
          bookId,
          'audioTracks',
          meta.id,
          'chunks'
        );
        const cSnap = await getDocs(
          query(
            chunksCol,
            where(ownerField, '==', libraryId),
            where('bookId', '==', bookId),
            where('trackId', '==', meta.id)
          )
        );
        const parts = cSnap.docs
          .map((d) => d.data() as { chunkIndex?: number; data?: string })
          .sort((a, b) => (a.chunkIndex ?? 0) - (b.chunkIndex ?? 0));
        dataString = parts.map((p) => p.data || '').join('');
      }
      results.push(reconstructAudioTrack(meta, dataString));
    }
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, tracksPath);
  }
}
