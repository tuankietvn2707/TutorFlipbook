export { auth, db } from './firebase/firebaseClient';
export {
  getFirebaseUser,
  initFirebaseAuthListener,
  onFirebaseUserChange,
  registerLibrarySyncCallback,
  signInWithFirebaseGoogle,
  signOutFirebase
} from './firebase/firebaseAuth';
export {
  deleteBookFromCloud,
  hydrateBookFromCloud,
  syncAllLocalBooksToCloud,
  syncBookToCloud
} from './firebase/firebaseSyncService';
export {
  getCloudSyncStatus,
  subscribeCloudSyncStatus,
  type CloudSyncStatus
} from './firebase/firebaseSyncState';
