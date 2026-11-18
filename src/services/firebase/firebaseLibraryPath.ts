import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db, withTimeout } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';

export function getVerifiedEmailLibraryId(): string | null {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !user.email) return null;
  return user.email.trim().toLowerCase();
}

export function isVerifiedEmailSignedIn(): boolean {
  return Boolean(auth.currentUser?.uid && getVerifiedEmailLibraryId());
}

export async function ensureEmailLibraryDoc(
  uid: string,
  libraryId: string
): Promise<void> {
  const libPath = `libraries/${libraryId}`;
  const libRef = doc(db, 'libraries', libraryId);
  try {
    const snap = await withTimeout(getDoc(libRef), 20000);
    if (snap.exists()) {
      await withTimeout(
        updateDoc(libRef, {
          lastUpdatedByUid: uid,
          updatedAt: serverTimestamp()
        }),
        20000
      );
    } else {
      await withTimeout(
        setDoc(libRef, {
          libraryId,
          ownerEmail: libraryId,
          lastUpdatedByUid: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }),
        20000
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, libPath);
  }
}

export async function listLegacyUidBookIds(uid: string): Promise<string[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'users', uid, 'books'), where('ownerId', '==', uid))
    );
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}
