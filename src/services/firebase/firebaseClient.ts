import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import {
  Firestore,
  doc,
  getDocFromServer,
  getFirestore,
  initializeFirestore
} from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;

function createFirestoreClient(): Firestore {
  try {
    return initializeFirestore(
      app,
      { experimentalAutoDetectLongPolling: true },
      databaseId
    );
  } catch {
    return getFirestore(app, databaseId);
  }
}

export const db: Firestore = createFirestoreClient();

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 25000,
  errorMessage: string = 'Kết nối Firebase quá thời gian chờ. Vui lòng kiểm tra mạng và thử lại.'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
    promise.then(
      (val) => {
        window.clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      }
    );
  });
}

let connectionTested = false;

export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testFirestoreConnection();
