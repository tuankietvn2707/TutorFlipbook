import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import { splitStringIntoChunks } from './firebaseMediaHelpers';

const BATCH_DOC_LIMIT = 8;

export async function uploadBookPagesToCloud(
  libraryId: string,
  uid: string,
  bookId: string,
  pages: string[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const pagesPath = `libraries/${libraryId}/books/${bookId}/pages`;
  const colRef = collection(db, 'libraries', libraryId, 'books', bookId, 'pages');

  let existingIds = new Set<string>();
  try {
    const snap = await getDocs(
      query(colRef, where('ownerEmail', '==', libraryId), where('bookId', '==', bookId))
    );
    existingIds = new Set(snap.docs.map((d) => d.id));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, pagesPath);
  }

  const desiredDocs: Array<{
    id: string;
    pageIndex: number;
    partIndex: number;
    totalParts: number;
    chunk: string;
  }> = [];

  pages.forEach((pageDataUrl, pageIndex) => {
    const parts = splitStringIntoChunks(pageDataUrl);
    parts.forEach((chunk, partIndex) => {
      desiredDocs.push({
        id: `page_${pageIndex}_p${partIndex}`,
        pageIndex,
        partIndex,
        totalParts: parts.length,
        chunk
      });
    });
  });

  const desiredIdSet = new Set(desiredDocs.map((d) => d.id));
  const staleIds = Array.from(existingIds).filter((id) => !desiredIdSet.has(id));

  for (let i = 0; i < staleIds.length; i += 50) {
    const batch = writeBatch(db);
    staleIds.slice(i, i + 50).forEach((id) => batch.delete(doc(colRef, id)));
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, pagesPath);
    }
  }

  for (let i = 0; i < desiredDocs.length; i += BATCH_DOC_LIMIT) {
    const slice = desiredDocs.slice(i, i + BATCH_DOC_LIMIT);
    const batch = writeBatch(db);
    slice.forEach((item) => {
      const ref = doc(colRef, item.id);
      if (existingIds.has(item.id)) {
        batch.update(ref, {
          ownerId: uid,
          pageIndex: item.pageIndex,
          partIndex: item.partIndex,
          totalParts: item.totalParts,
          chunk: item.chunk,
          updatedAt: serverTimestamp()
        });
      } else {
        batch.set(ref, {
          ownerId: uid,
          ownerEmail: libraryId,
          bookId,
          pageIndex: item.pageIndex,
          partIndex: item.partIndex,
          totalParts: item.totalParts,
          chunk: item.chunk,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, pagesPath);
    }
    onProgress?.(Math.min(i + slice.length, desiredDocs.length), desiredDocs.length);
  }
}

export async function downloadBookPagesFromCloud(
  libraryId: string,
  bookId: string,
  collectionRoot: 'libraries' | 'users' = 'libraries'
): Promise<string[]> {
  const pagesPath = `${collectionRoot}/${libraryId}/books/${bookId}/pages`;
  const colRef = collection(db, collectionRoot, libraryId, 'books', bookId, 'pages');
  const ownerField = collectionRoot === 'libraries' ? 'ownerEmail' : 'ownerId';

  try {
    const snap = await getDocs(
      query(colRef, where(ownerField, '==', libraryId), where('bookId', '==', bookId))
    );
    const byPage = new Map<number, Array<{ partIndex: number; chunk: string }>>();

    snap.forEach((d) => {
      const data = d.data() as {
        pageIndex?: number;
        partIndex?: number;
        chunk?: string;
      };
      if (typeof data.pageIndex !== 'number' || typeof data.chunk !== 'string') return;
      const list = byPage.get(data.pageIndex) || [];
      list.push({ partIndex: data.partIndex ?? 0, chunk: data.chunk });
      byPage.set(data.pageIndex, list);
    });

    const sortedPageIndices = Array.from(byPage.keys()).sort((a, b) => a - b);
    return sortedPageIndices.map((idx) => {
      const parts = byPage.get(idx) || [];
      parts.sort((a, b) => a.partIndex - b.partIndex);
      return parts.map((p) => p.chunk).join('');
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, pagesPath);
  }
}

export async function deleteAllBookPagesFromCloud(
  libraryId: string,
  bookId: string
): Promise<void> {
  const pagesPath = `libraries/${libraryId}/books/${bookId}/pages`;
  const colRef = collection(db, 'libraries', libraryId, 'books', bookId, 'pages');

  try {
    const snap = await getDocs(
      query(colRef, where('ownerEmail', '==', libraryId), where('bookId', '==', bookId))
    );
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 100) {
      const batch = writeBatch(db);
      docs.slice(i, i + 100).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, pagesPath);
  }
}
