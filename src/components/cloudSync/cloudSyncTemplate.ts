export function renderCloudSyncModalHtml(): string {
  return `
  <!-- MODAL: FIREBASE ACCOUNT & CLOUD SYNC -->
  <div id="modal-cloud-sync" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="card-3d w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 bg-white max-h-[90vh] flex flex-col overflow-y-auto">

      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
            <i data-lucide="cloud" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-base text-slate-900 leading-tight">Đồng Bộ Đám Mây Firebase</h3>
            <p class="text-[11px] font-medium text-slate-500">Đăng nhập cùng tài khoản trên mọi thiết bị để xem chung sách & Audio</p>
          </div>
        </div>
        <button type="button" id="btn-close-cloud-modal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Account Connection Card -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shrink-0">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div id="cloud-avatar-container" class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              <i data-lucide="user" class="w-5 h-5 text-slate-400"></i>
            </div>
            <div class="min-w-0">
              <p id="cloud-user-name" class="font-bold text-sm text-slate-900 truncate">Chưa đăng nhập</p>
              <p id="cloud-user-email" class="text-[11px] font-medium text-slate-500 truncate">Đăng nhập để bật đồng bộ tự động</p>
              <p id="cloud-status-badge" class="text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
                <i data-lucide="wifi-off" class="w-3 h-3"></i> Chỉ lưu trên máy này
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button type="button" id="btn-cloud-signin" class="flex-1 btn-3d btn-blue text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span id="btn-cloud-signin-text">Đăng nhập bằng Google</span>
          </button>
          <button type="button" id="btn-cloud-signout" class="hidden btn-3d btn-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <!-- Real-time Sync Status Card -->
      <div id="cloud-sync-details-card" class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5 shrink-0">
        <div class="flex items-center justify-between text-xs font-bold text-emerald-950">
          <span class="flex items-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-4 h-4 text-emerald-600"></i>
            <span>Trạng thái đồng bộ</span>
          </span>
          <span id="cloud-book-count-badge" class="font-mono text-xs text-emerald-700">0 sách trên Cloud</span>
        </div>

        <p id="cloud-sync-status-text" class="text-[11px] font-medium text-emerald-800">
          Mọi sách PDF và file Audio (.WAV/.MP3) tải lên sẽ tự động đồng bộ an toàn lên tài khoản Firebase của bạn.
        </p>

        <div id="cloud-sync-progress-wrap" class="hidden space-y-1">
          <div class="w-full h-2 rounded-full bg-emerald-200/70 overflow-hidden">
            <div id="cloud-sync-progress-bar" class="h-full bg-emerald-600 w-0 transition-all duration-200"></div>
          </div>
          <p id="cloud-sync-progress-label" class="text-[11px] font-semibold text-emerald-700"></p>
        </div>

        <p id="cloud-last-synced-text" class="text-[10px] font-medium text-emerald-700/80"></p>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-1 gap-2 shrink-0">
        <button type="button" id="btn-cloud-push-all" class="btn-3d btn-green text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
          <i data-lucide="cloud-upload" class="w-4 h-4"></i>
          <span>Đồng bộ toàn bộ sách hiện có lên Firebase Cloud</span>
        </button>
      </div>

      <!-- Modal Footer -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
        <span class="text-[11px] font-medium text-slate-400">Dữ liệu riêng tư theo tài khoản Google</span>
        <button type="button" id="btn-close-cloud-footer" class="btn-3d btn-white font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer">Đóng</button>
      </div>
    </div>
  </div>
  `;
}
