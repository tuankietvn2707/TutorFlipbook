import { Book } from '../types';
import { appState } from '../state/appState';
import { 
  requestDriveAuth, 
  signOutGoogle, 
  syncBooksToDrive, 
  fetchBooksFromDrive,
  exportLibraryToJSON, 
  getCurrentGoogleUser, 
  getGoogleDriveAccessToken,
  getOAuthClientId,
  setCustomOAuthClientId,
  setManualAccessToken
} from '../services/googleDriveService';
import { saveBookToDB } from '../services/dbService';
import { showToast, showLoader } from '../utils/toast';
import { refreshLucideIcons } from '../utils/icons';

export function renderGoogleDriveModalHtml(): string {
  const currentHost = typeof window !== 'undefined' ? (window.location.host || window.location.hostname) : 'your-domain.vercel.app';
  const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const fullOrigin = `${currentProtocol}//${currentHost}`;

  return `
  <!-- MODAL: GOOGLE DRIVE CLOUD SYNC & STORAGE MANAGER -->
  <div id="modal-gdrive" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
    <div class="card-3d w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 bg-white max-h-[92vh] flex flex-col justify-between overflow-y-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-2 border-b-2 border-slate-100 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <i data-lucide="hard-drive" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-black text-base text-slate-800">Google Drive Cloud Storage</h3>
            <p class="text-[11px] font-bold text-slate-500">Lưu trữ & Đồng bộ toàn bộ Sách PDF, Audio trên Google Drive</p>
          </div>
        </div>
        <button id="btn-close-gdrive-modal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Account Connection Status Card -->
      <div class="p-4 bg-slate-50 border-2 border-b-4 border-slate-200 rounded-2xl space-y-3 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div id="gdrive-avatar-container" class="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              <i data-lucide="user" class="w-4 h-4 text-slate-700"></i>
            </div>
            <div class="min-w-0">
              <p id="gdrive-user-email" class="font-black text-xs text-slate-800 truncate max-w-[160px] sm:max-w-[220px]">Chưa đăng nhập</p>
              <p id="gdrive-status-badge" class="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Chưa kết nối
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button id="btn-gdrive-connect" class="btn-3d btn-blue text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer">
              <i data-lucide="log-in" class="w-3.5 h-3.5"></i> <span id="btn-gdrive-connect-text">Đăng nhập</span>
            </button>
            <button id="btn-gdrive-disconnect" class="hidden btn-3d btn-white text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer" title="Ngắt kết nối">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span>Thư mục lưu trữ:</span>
          <span class="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-duoBlue truncate max-w-[200px]">📁 Biblio3D_TutorFlow_Books</span>
        </div>
      </div>

      <!-- Action Buttons Grid -->
      <div class="space-y-2 shrink-0">
        <button id="btn-sync-all-drive" class="btn-3d btn-green w-full p-3 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-md">
          <i data-lucide="cloud-upload" class="w-5 h-5"></i>
          <span>Sao Lưu & Đồng Bộ Toàn Bộ Sách Lên Drive</span>
        </button>

        <button id="btn-fetch-all-drive" class="btn-3d btn-white w-full p-2.5 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-2 hover:border-duoBlue cursor-pointer">
          <i data-lucide="cloud-download" class="w-4 h-4 text-duoBlue"></i>
          <span>Tải & Phục Hồi Sách Từ Google Drive Về Máy</span>
        </button>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button id="btn-export-json-backup" class="btn-3d btn-white p-2.5 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 hover:border-duoPurple cursor-pointer">
            <i data-lucide="download" class="w-4 h-4 text-duoPurple"></i>
            <span>Xuất file (.JSON)</span>
          </button>

          <button id="btn-import-json-trigger" class="btn-3d btn-white p-2.5 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 hover:border-duoGreen cursor-pointer">
            <i data-lucide="upload" class="w-4 h-4 text-duoGreen"></i>
            <span>Nhập file (.JSON)</span>
          </button>
          <input type="file" id="input-import-json-backup" accept=".json,application/json" class="hidden" />
        </div>
      </div>

      <!-- Vercel & Domain Authorization Setup Guide (Collapsible/Help) -->
      <div id="gdrive-domain-guide-card" class="p-3.5 bg-sky-50/80 border-2 border-sky-200 rounded-2xl text-[11px] font-bold text-sky-950 space-y-2.5 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-sky-800 font-extrabold text-xs">
            <i data-lucide="globe" class="w-4 h-4 text-sky-600"></i>
            <span>Ủy quyền tên miền Vercel / Custom Domain</span>
          </div>
          <button id="btn-toggle-domain-guide" class="text-[10px] font-bold text-sky-600 hover:text-sky-800 underline cursor-pointer">
            Xem chi tiết
          </button>
        </div>

        <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-sky-200 gap-2">
          <span class="text-[10px] text-slate-500 font-semibold truncate">Domain hiện tại:</span>
          <code id="current-domain-code" class="font-mono font-bold text-sky-700 text-[11px] truncate select-all">${currentHost}</code>
          <button id="btn-copy-domain" class="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded text-[10px] font-black shrink-0 cursor-pointer transition">
            📋 Sao chép
          </button>
        </div>

        <div id="domain-guide-details" class="hidden space-y-2 pt-1 text-[11px] text-slate-700 font-semibold border-t border-sky-200">
          <p class="text-slate-800 font-black">⚡ Nếu cửa sổ Google tắt ngay lập tức, hãy thực hiện 2 bước đơn giản sau:</p>
          <ol class="list-decimal list-inside space-y-1 text-[10.5px] leading-relaxed text-slate-600 pl-1">
            <li>Mở <b>Firebase Console</b> &rarr; <b>Authentication</b> &rarr; tab <b>Settings</b> &rarr; <b>Authorized domains</b> &rarr; Bấm <b>Add domain</b> và dán <code class="text-sky-700 bg-white px-1 py-0.5 rounded">${currentHost}</code>.</li>
            <li>Mở <b>Google Cloud Console</b> &rarr; <b>Credentials</b> &rarr; <b>OAuth 2.0 Client IDs</b> &rarr; Thêm <code class="text-sky-700 bg-white px-1 py-0.5 rounded">${fullOrigin}</code> vào <b>Authorized JavaScript origins</b>.</li>
          </ol>

          <!-- Custom OAuth Client ID Form -->
          <div class="pt-2 border-t border-sky-200 space-y-1.5">
            <label class="block text-[10px] font-black text-slate-700">Tùy chỉnh Google OAuth Client ID (nếu dùng GCP riêng):</label>
            <div class="flex gap-1.5">
              <input 
                type="text" 
                id="input-custom-client-id" 
                placeholder="Dán Client ID của bạn vào đây..." 
                class="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[10px] font-mono focus:outline-none focus:border-sky-500"
              />
              <button id="btn-save-custom-client-id" class="btn-3d btn-blue text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer">
                Lưu
              </button>
            </div>
          </div>

          <!-- Direct Access Token Input (Bypass / Quick Test) -->
          <div class="pt-2 border-t border-sky-200 space-y-1.5">
            <label class="block text-[10px] font-black text-slate-700">Hoặc dán Access Token Google (Kết nối tức thì):</label>
            <div class="flex gap-1.5">
              <input 
                type="password" 
                id="input-manual-access-token" 
                placeholder="ya29.a0AfH6..." 
                class="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[10px] font-mono focus:outline-none focus:border-sky-500"
              />
              <button id="btn-save-manual-token" class="btn-3d btn-green text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer text-white">
                Dùng Token
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
        <span class="text-[10px] text-slate-400 font-bold">Biblio 3D Cloud Shield</span>
        <button id="btn-close-gdrive-footer" class="btn-3d btn-white font-extrabold px-4 py-1.5 rounded-xl text-xs cursor-pointer">Đóng</button>
      </div>
    </div>
  </div>
  `;
}

export function refreshModalAccountUI(): void {
  const user = getCurrentGoogleUser();
  const token = getGoogleDriveAccessToken();
  const emailEl = document.getElementById('gdrive-user-email');
  const badgeEl = document.getElementById('gdrive-status-badge');
  const connectBtnText = document.getElementById('btn-gdrive-connect-text');
  const disconnectBtn = document.getElementById('btn-gdrive-disconnect');
  const avatarContainer = document.getElementById('gdrive-avatar-container');
  const clientIdInput = document.getElementById('input-custom-client-id') as HTMLInputElement;

  if (clientIdInput) {
    clientIdInput.value = getOAuthClientId();
  }

  if (user && token) {
    if (emailEl) emailEl.textContent = user.displayName || user.email || 'Tài khoản Google';
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Đã kết nối Google Drive`;
      badgeEl.className = 'text-[10px] font-bold text-emerald-600 flex items-center gap-1';
    }
    if (connectBtnText) connectBtnText.textContent = 'Đồng bộ';
    if (disconnectBtn) disconnectBtn.classList.remove('hidden');
    if (avatarContainer && user.photoURL) {
      avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="avatar" class="w-full h-full object-cover" />`;
    }
  } else {
    if (emailEl) emailEl.textContent = 'Chưa đăng nhập';
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Chưa kết nối`;
      badgeEl.className = 'text-[10px] font-bold text-slate-500 flex items-center gap-1';
    }
    if (connectBtnText) connectBtnText.textContent = 'Đăng nhập';
    if (disconnectBtn) disconnectBtn.classList.add('hidden');
    if (avatarContainer) {
      avatarContainer.innerHTML = `<i data-lucide="user" class="w-4 h-4 text-slate-700"></i>`;
    }
  }
  refreshLucideIcons();
}

export function openGoogleDriveModal(): void {
  const modal = document.getElementById('modal-gdrive');
  modal?.classList.remove('hidden');
  refreshModalAccountUI();
}

export function closeGoogleDriveModal(): void {
  const modal = document.getElementById('modal-gdrive');
  modal?.classList.add('hidden');
}

export function setupGoogleDriveListeners(onBooksImported: (books: Book[]) => void): void {
  document.getElementById('btn-close-gdrive-modal')?.addEventListener('click', closeGoogleDriveModal);
  document.getElementById('btn-close-gdrive-footer')?.addEventListener('click', closeGoogleDriveModal);
  
  document.getElementById('btn-gdrive-connect')?.addEventListener('click', async () => {
    await requestDriveAuth();
    refreshModalAccountUI();
  });

  document.getElementById('btn-gdrive-disconnect')?.addEventListener('click', async () => {
    await signOutGoogle();
    refreshModalAccountUI();
  });

  document.getElementById('btn-sync-all-drive')?.addEventListener('click', async () => {
    const books = appState.get('allBooks');
    if (!books || books.length === 0) {
      showToast('📚 Thư viện của bạn chưa có cuốn sách nào để đồng bộ!');
      return;
    }
    await syncBooksToDrive(books);
  });

  document.getElementById('btn-fetch-all-drive')?.addEventListener('click', async () => {
    showLoader(true, 'Đang chuẩn bị tải sách từ Google Drive...');
    try {
      const books = await fetchBooksFromDrive();
      if (books && books.length > 0) {
        showLoader(true, `Đang lưu ${books.length} cuốn sách vào máy...`);
        for (let i = 0; i < books.length; i++) {
          await saveBookToDB(books[i]);
        }
        showLoader(false);
        showToast(`🎉 Đã khôi phục thành công ${books.length} cuốn sách từ Google Drive!`, 4000);
        onBooksImported(books);
        closeGoogleDriveModal();
      } else {
        showLoader(false);
        showToast('ℹ️ Thư mục Google Drive chưa có sách nào. Hãy bấm "Sao Lưu & Đồng Bộ" trên thiết bị có sách trước!', 5000);
      }
    } catch (e: any) {
      console.error('Error in fetch books handler:', e);
      showLoader(false);
      showToast(`⚠️ Không thể tải sách từ Google Drive: ${e?.message || 'Lỗi mạng hoặc hết phiên'}`);
    } finally {
      showLoader(false);
    }
  });

  document.getElementById('btn-export-json-backup')?.addEventListener('click', () => {
    const books = appState.get('allBooks');
    exportLibraryToJSON(books);
  });

  const importTrigger = document.getElementById('btn-import-json-trigger');
  const importInput = document.getElementById('input-import-json-backup') as HTMLInputElement;

  importTrigger?.addEventListener('click', () => importInput?.click());

  importInput?.addEventListener('change', async (e: any) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (Array.isArray(imported)) {
        for (const b of imported) {
          await saveBookToDB(b);
        }
        showToast(`🎉 Đã nhập thành công ${imported.length} cuốn sách từ file JSON!`);
        onBooksImported(imported);
        closeGoogleDriveModal();
      } else {
        showToast('⚠️ Cấu trúc file JSON không hợp lệ');
      }
    } catch (err) {
      showToast('⚠️ Không thể đọc file backup JSON');
    }
  });

  // Domain Guide Toggle & Copy Button
  document.getElementById('btn-toggle-domain-guide')?.addEventListener('click', () => {
    const details = document.getElementById('domain-guide-details');
    const toggleBtn = document.getElementById('btn-toggle-domain-guide');
    if (details) {
      const isHidden = details.classList.toggle('hidden');
      if (toggleBtn) {
        toggleBtn.textContent = isHidden ? 'Xem chi tiết' : 'Thu gọn';
      }
    }
  });

  document.getElementById('btn-copy-domain')?.addEventListener('click', () => {
    const currentHost = window.location.host || window.location.hostname;
    navigator.clipboard.writeText(currentHost).then(() => {
      showToast(`📋 Đã sao chép domain [${currentHost}] vào bộ nhớ tạm!`);
    }).catch(() => {
      showToast(`Domain: ${currentHost}`);
    });
  });

  document.getElementById('btn-save-custom-client-id')?.addEventListener('click', () => {
    const input = document.getElementById('input-custom-client-id') as HTMLInputElement;
    if (input) {
      setCustomOAuthClientId(input.value);
      showToast('✅ Đã lưu Google OAuth Client ID tùy chỉnh!');
    }
  });

  document.getElementById('btn-save-manual-token')?.addEventListener('click', () => {
    const input = document.getElementById('input-manual-access-token') as HTMLInputElement;
    if (input && input.value.trim().length > 0) {
      setManualAccessToken(input.value.trim(), 'Google Drive User');
      refreshModalAccountUI();
      input.value = '';
    } else {
      showToast('⚠️ Vui lòng dán Access Token hợp lệ');
    }
  });
}
