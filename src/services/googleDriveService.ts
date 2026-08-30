import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Book } from '../types';
import { showToast, showLoader, updateLoaderProgress, getIsOperationCancelled } from '../utils/toast';

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleDriveUserProfile {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

const GDRIVE_FOLDER_NAME = 'Biblio3D_TutorFlow_Books';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

const STORAGE_TOKEN_KEY = 'biblio3d_gdrive_access_token';
const STORAGE_USER_KEY = 'biblio3d_gdrive_user';
const STORAGE_EXPIRES_KEY = 'biblio3d_gdrive_expires_at';
const STORAGE_CLIENT_ID_KEY = 'biblio3d_custom_client_id';

// Firebase initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((s) => provider.addScope(s));

// In-memory & Persistent state
let cachedAccessToken: string | null = null;
let currentUser: GoogleDriveUserProfile | null = null;
let isSigningIn = false;

// Initialize state from storage on module load
try {
  const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
  const storedExpires = localStorage.getItem(STORAGE_EXPIRES_KEY);
  const storedUser = localStorage.getItem(STORAGE_USER_KEY);

  if (storedToken && storedExpires && Date.now() < parseInt(storedExpires, 10)) {
    cachedAccessToken = storedToken;
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_EXPIRES_KEY);
  }
} catch (e) {
  console.warn('Could not read cached Google auth:', e);
}

export function getOAuthClientId(): string {
  const custom = localStorage.getItem(STORAGE_CLIENT_ID_KEY);
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  return firebaseConfig.oAuthClientId || '';
}

export function setCustomOAuthClientId(clientId: string): void {
  if (clientId && clientId.trim().length > 0) {
    localStorage.setItem(STORAGE_CLIENT_ID_KEY, clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
  }
}

export function setGoogleDriveAccessToken(token: string | null, expiresInSeconds = 3500, profile?: GoogleDriveUserProfile): void {
  cachedAccessToken = token;
  if (token) {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_EXPIRES_KEY, expiresAt.toString());
    if (profile) {
      currentUser = profile;
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    }
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_EXPIRES_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    currentUser = null;
  }
}

export function getGoogleDriveAccessToken(): string | null {
  // Check expiration
  const storedExpires = localStorage.getItem(STORAGE_EXPIRES_KEY);
  if (storedExpires && Date.now() >= parseInt(storedExpires, 10)) {
    setGoogleDriveAccessToken(null);
    return null;
  }
  return cachedAccessToken;
}

export function getCurrentGoogleUser(): GoogleDriveUserProfile | null {
  return currentUser;
}

// Auth State Listener
export function initAuthListener(
  onSuccess?: (user: GoogleDriveUserProfile, token: string) => void,
  onSignedOut?: () => void
): () => void {
  // Check if we have cached token from localStorage
  const currentToken = getGoogleDriveAccessToken();
  if (currentToken && currentUser) {
    updateDriveUIStatus(true);
    if (onSuccess) onSuccess(currentUser, currentToken);
  } else {
    updateDriveUIStatus(false);
  }

  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userProfile: GoogleDriveUserProfile = {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL
      };
      currentUser = userProfile;
      if (cachedAccessToken) {
        setGoogleDriveAccessToken(cachedAccessToken, 3500, userProfile);
        updateDriveUIStatus(true);
        if (onSuccess) onSuccess(userProfile, cachedAccessToken);
      }
    } else if (!cachedAccessToken) {
      updateDriveUIStatus(false);
      if (onSignedOut) onSignedOut();
    }
  });
}

// Request Auth via Google Identity Services (GSI)
function requestGsiToken(): Promise<{ token: string; profile: GoogleDriveUserProfile } | null> {
  return new Promise((resolve) => {
    const clientId = getOAuthClientId();
    if (!clientId) {
      resolve(null);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      console.warn('Google Identity Services (GSI) not loaded on window');
      resolve(null);
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES.join(' '),
        prompt: '',
        callback: async (response: any) => {
          if (response && response.access_token) {
            const token = response.access_token;
            const expiresIn = response.expires_in ? parseInt(response.expires_in, 10) : 3500;
            
            // Fetch User Profile
            let profile: GoogleDriveUserProfile = {
              displayName: 'Tài khoản Google',
              email: '',
              photoURL: ''
            };

            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (userRes.ok) {
                const data = await userRes.json();
                profile = {
                  displayName: data.name || data.given_name || 'Tài khoản Google',
                  email: data.email || '',
                  photoURL: data.picture || ''
                };
              }
            } catch (e) {
              console.warn('Could not fetch user profile info:', e);
            }

            resolve({ token, profile });
          } else if (response && response.error) {
            console.error('GSI Token error:', response);
            resolve(null);
          } else {
            resolve(null);
          }
        },
        error_callback: (err: any) => {
          console.error('GSI init error:', err);
          resolve(null);
        }
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error('GSI Execution error:', err);
      resolve(null);
    }
  });
}

// User Action Triggered Sign-In with Dual Fallback & Smart Diagnostics
export async function requestDriveAuth(): Promise<string | null> {
  const existing = getGoogleDriveAccessToken();
  if (existing) {
    return existing;
  }

  if (isSigningIn) return null;
  isSigningIn = true;

  try {
    showToast('🔑 Đang mở kết nối Google Drive...', 2000);

    // 1. Try Google Identity Services first
    if (window.google?.accounts?.oauth2) {
      const gsiResult = await requestGsiToken();
      if (gsiResult) {
        setGoogleDriveAccessToken(gsiResult.token, 3500, gsiResult.profile);
        updateDriveUIStatus(true);
        showToast(`🎉 Đã kết nối Google Drive (${gsiResult.profile.displayName || gsiResult.profile.email})!`);
        return gsiResult.token;
      }
    }

    // 2. Fallback to Firebase Popup
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential && credential.accessToken) {
      const profile: GoogleDriveUserProfile = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      };
      setGoogleDriveAccessToken(credential.accessToken, 3500, profile);
      updateDriveUIStatus(true);
      showToast(`🎉 Đã kết nối Google Drive (${result.user.displayName || result.user.email})!`);
      return credential.accessToken;
    } else {
      throw new Error('Không nhận được mã ủy quyền Google');
    }
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    const currentHost = window.location.host;

    if (error.code === 'auth/unauthorized-domain') {
      showToast(`⚠️ Domain [${currentHost}] chưa được cấp quyền trên Firebase Auth. Vui lòng xem mục Hướng dẫn Vercel trong bảng cài đặt!`, 6000);
      notifyDomainUnauthorized(currentHost);
    } else if (error.code === 'auth/popup-closed-by-user') {
      showToast('ℹ️ Cửa sổ Google đóng lại do domain chưa được kích hoạt hoặc người dùng hủy', 4000);
      notifyDomainUnauthorized(currentHost);
    } else if (error.code === 'auth/cancelled-popup-request') {
      // Ignored
    } else {
      showToast(`⚠️ Lỗi kết nối Google: ${error.message || 'Chưa hoàn tất xác thực'}`);
    }
    return null;
  } finally {
    isSigningIn = false;
  }
}

function notifyDomainUnauthorized(domain: string): void {
  const guideCard = document.getElementById('gdrive-domain-guide-card');
  if (guideCard) {
    guideCard.classList.remove('hidden');
    guideCard.scrollIntoView({ behavior: 'smooth' });
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    await signOut(auth);
  } catch (_) {}
  setGoogleDriveAccessToken(null);
  updateDriveUIStatus(false);
  showToast('👋 Đã ngắt kết nối Google Drive');
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
  if (dot) {
    dot.className = connected 
      ? 'w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse' 
      : 'w-2.5 h-2.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 ring-2 ring-white';
  }
  if (mobDot) {
    mobDot.className = connected 
      ? 'w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 border border-white' 
      : 'w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 border border-white';
  }
}

export async function getOrCreateDriveFolder(): Promise<string | null> {
  const token = getGoogleDriveAccessToken();
  if (!token) return null;

  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${GDRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        setGoogleDriveAccessToken(null);
        showToast('⚠️ Phiên đăng nhập Google Drive đã hết hạn. Vui lòng bấm Đăng nhập lại!');
      }
      return null;
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
  const token = getGoogleDriveAccessToken();
  if (!token) return false;

  try {
    const fileName = `book_${book.id}.json`;

    // Check if file already exists in folder to update or create
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    let existingFileId: string | null = null;
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.files && checkData.files.length > 0) {
        existingFileId = checkData.files[0].id;
      }
    }

    const metadata = {
      name: fileName,
      parents: existingFileId ? undefined : [folderId],
      mimeType: 'application/json'
    };

    const bookContent = JSON.stringify(book);
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([bookContent], { type: 'application/json' }));

    const url = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const res = await fetch(url, {
      method: existingFileId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    return res.ok;
  } catch (e) {
    console.error('Error uploading book to drive:', e);
    return false;
  }
}

export async function fetchBooksFromDrive(): Promise<Book[]> {
  const token = getGoogleDriveAccessToken();
  if (!token) return [];

  const folderId = await getOrCreateDriveFolder();
  if (!folderId) return [];

  try {
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false and name contains 'book_'`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!listRes.ok) return [];

    const listData = await listRes.json();
    const files = listData.files || [];
    const downloadedBooks: Book[] = [];

    for (const f of files) {
      try {
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (fileRes.ok) {
          const bookData = await fileRes.json();
          if (bookData && bookData.id && bookData.title) {
            downloadedBooks.push(bookData);
          }
        }
      } catch (err) {
        console.warn('Could not read book file from drive:', f.name, err);
      }
    }

    return downloadedBooks;
  } catch (e) {
    console.error('Error fetching books from drive:', e);
    return [];
  }
}

export async function syncBooksToDrive(books: Book[]): Promise<void> {
  let token = getGoogleDriveAccessToken();
  if (!token) {
    token = await requestDriveAuth();
    if (!token) return;
  }

  showLoader(true, 'Đang đồng bộ sách lên Google Drive...');
  try {
    const folderId = await getOrCreateDriveFolder();
    if (!folderId) {
      showToast('⚠️ Không thể tạo thư mục trên Google Drive. Vui lòng thử đăng nhập lại!');
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
      const success = await uploadBookFileToDrive(b, folderId);
      if (success) syncedCount++;
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
