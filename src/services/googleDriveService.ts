import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Book } from '../types';
import { showToast, showLoader, updateLoaderProgress, getIsOperationCancelled } from '../utils/toast';

const GDRIVE_FOLDER_NAME = 'Biblio3D_TutorFlow_Books';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Firebase initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((s) => provider.addScope(s));

// In-memory token cache
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;
let isSigningIn = false;

export function setGoogleDriveAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

export function getGoogleDriveAccessToken(): string | null {
  return cachedAccessToken;
}

export function getCurrentGoogleUser(): User | null {
  return currentUser;
}

// Auth State Listener
export function initAuthListener(
  onSuccess?: (user: User, token: string) => void,
  onSignedOut?: () => void
): () => void {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        updateDriveUIStatus(true);
        if (onSuccess) onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        updateDriveUIStatus(false);
        if (onSignedOut) onSignedOut();
      }
    } else {
      cachedAccessToken = null;
      updateDriveUIStatus(false);
      if (onSignedOut) onSignedOut();
    }
  });
}

// User Action Triggered Sign-In
export async function requestDriveAuth(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  try {
    isSigningIn = true;
    showToast('🔑 Đang mở xác thực Google...', 2500);

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential && credential.accessToken) {
      cachedAccessToken = credential.accessToken;
      currentUser = result.user;
      updateDriveUIStatus(true);
      showToast(`🎉 Đã kết nối Google Drive (${result.user.displayName || result.user.email})!`);
      return cachedAccessToken;
    } else {
      throw new Error('Không nhận được mã truy cập từ Google');
    }
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      showToast('ℹ️ Đã hủy cửa sổ đăng nhập Google');
    } else if (error.code === 'auth/cancelled-popup-request') {
      // Ignored
    } else {
      showToast(`⚠️ Không thể kết nối Google: ${error.message || 'Lỗi xác thực'}`);
    }
    return null;
  } finally {
    isSigningIn = false;
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    currentUser = null;
    updateDriveUIStatus(false);
    showToast('👋 Đã ngắt kết nối Google Drive');
  } catch (e) {
    console.error('Error signing out:', e);
  }
}

export function updateDriveUIStatus(connected: boolean): void {
  const badge = document.getElementById('gdrive-status-badge');
  const dot = document.getElementById('header-gdrive-dot');
  const mobDot = document.getElementById('mob-gdrive-dot');

  if (badge) {
    badge.innerHTML = connected
      ? `<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Đã kết nối Drive (${currentUser?.email ? currentUser.email.split('@')[0] : 'OK'})`
      : `<span class="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Chưa kết nối`;
  }
  if (dot) dot.className = connected ? 'w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse' : 'w-2.5 h-2.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 ring-2 ring-white';
  if (mobDot) mobDot.className = connected ? 'w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 border border-white' : 'w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 border border-white';
}

export async function getOrCreateDriveFolder(): Promise<string | null> {
  if (!cachedAccessToken) return null;
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${GDRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive`,
      { headers: { Authorization: `Bearer ${cachedAccessToken}` } }
    );
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: GDRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    const createData = await createRes.json();
    return createData.id;
  } catch (e) {
    console.error('Error getting Drive folder:', e);
    return null;
  }
}

export async function uploadBookFileToDrive(book: Book, folderId: string): Promise<boolean> {
  if (!cachedAccessToken) return false;
  try {
    const fileName = `book_${book.id}.json`;
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json'
    };

    const bookContent = JSON.stringify(book);
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([bookContent], { type: 'application/json' }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      },
      body: form
    });
    return res.ok;
  } catch (e) {
    console.error('Error uploading book to drive:', e);
    return false;
  }
}

export async function syncBooksToDrive(books: Book[]): Promise<void> {
  let token = cachedAccessToken;
  if (!token) {
    token = await requestDriveAuth();
    if (!token) return;
  }

  showLoader(true, 'Đang đồng bộ sách lên Google Drive...');
  try {
    const folderId = await getOrCreateDriveFolder();
    if (!folderId) {
      showToast('⚠️ Không thể tạo thư mục trên Google Drive. Vui lòng kiểm tra quyền!');
      showLoader(false);
      return;
    }

    let syncedCount = 0;
    const total = books.length;

    for (let i = 0; i < total; i++) {
      if (getIsOperationCancelled()) break;
      const b = books[i];
      const percent = Math.round(((i + 1) / total) * 100);
      updateLoaderProgress(percent, `Đang sao lưu: ${b.title}`, `Đã lưu ${i + 1}/${total} sách`);
      await uploadBookFileToDrive(b, folderId);
      syncedCount++;
    }

    showLoader(false);
    showToast(`🎉 Đã đồng bộ an toàn ${syncedCount} cuốn sách lên Google Drive!`);
  } catch (e) {
    showLoader(false);
    showToast('⚠️ Đã có lỗi xảy ra trong quá trình đồng bộ!');
  }
}

export function exportLibraryToJSON(books: Book[]): void {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(books, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `Biblio3D_Library_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    showToast('📁 Đã xuất bản sao lưu thư viện (.JSON) thành công!');
  } catch (e) {
    showToast('⚠️ Không thể xuất file sao lưu');
  }
}
