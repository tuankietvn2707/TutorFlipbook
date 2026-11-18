export { auth, db } from './firebase/firebaseClient';
export {
  activateVerifiedUserSync,
  getFirebaseUser,
  initFirebaseAuthListener,
  onFirebaseUserChange,
  registerLibrarySyncCallback,
  signInWithFirebaseGoogle,
  signOutFirebase
} from './firebase/firebaseAuth';
export {
  formatFirebaseAuthError,
  hasPasswordProviderLinked,
  linkPasswordToCurrentAccount,
  refreshCurrentUserVerification,
  registerWithEmail,
  sendResetPasswordEmail,
  sendVerificationToCurrentUser,
  signInWithEmail
} from './firebase/firebaseEmailAuth';
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
