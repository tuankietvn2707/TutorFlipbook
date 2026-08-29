import { Book } from '../types';
import { appState } from '../state/appState';
import { requestDriveAuth, signOutGoogle, syncBooksToDrive, exportLibraryToJSON, getCurrentGoogleUser, getGoogleDriveAccessToken } from '../services/googleDriveService';
import { saveBookToDB } from '../services/dbService';
import { showToast } from '../utils/toast';
import { refreshLucideIcons } from '../utils/icons';

export function renderGoogleDriveModalHtml(): string {
  return `
  <!-- MODAL: GOOGLE DRIVE CLOUD SYNC & STORAGE MANAGER -->
  <div id="modal-gdrive" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="card-3d w-full max-w-lg p-6 shadow-2xl space-y-4 bg-white">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-2 border-b-2 border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <i data-lucide="hard-drive" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-black text-base text-slate-800">Google Drive Cloud Storage</h3>
            <p class="text-[11px] font-bold text-slate-500">Lưu trữ toàn bộ Sách PDF & Audio an toàn trên Google Drive</p>
          </div>
        </div>
        <button id="btn-close-gdrive-modal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Account Connection Status Card -->
      <div class="p-4 bg-slate-50 border-2 border-b-4 border-slate-200 rounded-2xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div id="gdrive-avatar-container" class="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
              <i data-lucide="user" class="w-4 h-4 text-slate-700"></i>
            </div>
            <div>
              <p id="gdrive-user-email" class="font-black text-xs text-slate-800">Chưa đăng nhập</p>
              <p id="gdrive-status-badge" class="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Chưa kết nối
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button id="btn-gdrive-connect" class="btn-3d btn-blue text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1">
              <i data-lucide="log-in" class="w-3.5 h-3.5"></i> <span id="btn-gdrive-connect-text">Đăng nhập</span>
            </button>
            <button id="btn-gdrive-disconnect" class="hidden btn-3d btn-white text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-rose-600 hover:bg-rose-50 border-rose-200">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span>Thư mục Drive:</span>
          <span class="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-duoBlue">📁 Biblio3D_TutorFlow_Books</span>
        </div>
      </div>

      <!-- Action Buttons Grid -->
      <div class="space-y-2.5">
        <button id="btn-sync-all-drive" class="btn-3d btn-green w-full p-3 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2">
          <i data-lucide="cloud-upload" class="w-5 h-5"></i>
          <span>Sao Lưu & Đồng Bộ Toàn Bộ Sách Lên Drive</span>
        </button>

        <div class="grid grid-cols-2 gap-2">
          <button id="btn-export-json-backup" class="btn-3d btn-white p-2.5 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 hover:border-duoPurple">
            <i data-lucide="download" class="w-4 h-4 text-duoPurple"></i>
            <span>Xuất file (.JSON)</span>
          </button>

          <button id="btn-import-json-trigger" class="btn-3d btn-white p-2.5 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 hover:border-duoGreen">
            <i data-lucide="upload" class="w-4 h-4 text-duoGreen"></i>
            <span>Nhập file (.JSON)</span>
          </button>
          <input type="file" id="input-import-json-backup" accept=".json,application/json" class="hidden" />
        </div>
      </div>

      <!-- Info Note -->
      <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900 flex items-start gap-2">
        <i data-lucide="shield-check" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"></i>
        <span>Dữ liệu của bạn được lưu trực tiếp trên Google Drive cá nhân, hoàn toàn bảo mật và không bị giới hạn dung lượng trình duyệt.</span>
      </div>

      <div class="flex items-center justify-end pt-2 border-t border-slate-100">
        <button id="btn-close-gdrive-footer" class="btn-3d btn-white font-extrabold px-4 py-1.5 rounded-xl text-xs">Đóng</button>
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
    await syncBooksToDrive(books);
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
}
