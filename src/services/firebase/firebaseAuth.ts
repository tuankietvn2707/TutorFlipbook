import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebaseClient';
import { OperationType, handleFirestoreError } from './firebaseErrors';
import { ensureEmailLibraryDoc, getVerifiedEmailLibraryId } from './firebaseLibraryPath';
import {
  migrateLegacyBooksAndSyncLocal,
  stopCloudBooksSubscription,
  subscribeToCloudBooks
} from './firebaseSyncService';

type AuthChangedHook = (user: User | null) => void;
const authHooks = new Set<AuthChangedHook>();
let syncLibraryUiCallback: (() => void) | null = null;
let activeLibraryId: string | null = null;

export function registerLibrarySyncCallback(fn: () => void): void {
  syncLibraryUiCallback = fn;
}

export function onFirebaseUserChange(fn: AuthChangedHook): () => void {
  authHooks.add(fn);
  fn(auth.currentUser);
  return () => authHooks.delete(fn);
}

export function getFirebaseUser(): User | null {
  return auth.currentUser;
}

async function upsertUserProfile(user: User): Promise<void> {
  if (!user.emailVerified) return;
  const userPath = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    const fields = {
      email: (user.email || '').slice(0, 320),
      displayName: (user.displayName || '').slice(0, 160),
      photoURL: (user.photoURL || '').slice(0, 1024),
      updatedAt: serverTimestamp()
    };
    if (snap.exists()) {
      await updateDoc(ref, fields);
    } else {
      await setDoc(ref, {
        uid: user.uid,
        ...fields,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
}

export async function activateVerifiedUserSync(): Promise<void> {
  const user = auth.currentUser;
  const libraryId = getVerifiedEmailLibraryId();
  if (!user || !libraryId) return;

  await upsertUserProfile(user);
  await ensureEmailLibraryDoc(user.uid, libraryId);

  if (activeLibraryId === libraryId) return;
  activeLibraryId = libraryId;

  subscribeToCloudBooks(
    libraryId,
    () => {
      syncLibraryUiCallback?.();
    },
    (cloudIds) => {
      void migrateLegacyBooksAndSyncLocal(cloudIds);
    }
  );
}

export async function signInWithFirebaseGoogle(): Promise<User | null> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user || null;
}

export async function signOutFirebase(): Promise<void> {
  activeLibraryId = null;
  stopCloudBooksSubscription();
  await signOut(auth);
}

export function initFirebaseAuthListener(): () => void {
  return onAuthStateChanged(auth, async (user) => {
    authHooks.forEach((fn) => fn(user));

    if (user && user.emailVerified && user.email) {
      await activateVerifiedUserSync();
    } else {
      activeLibraryId = null;
      stopCloudBooksSubscription();
    }
  });
}
