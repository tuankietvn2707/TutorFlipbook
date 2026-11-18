import { renderUploadModalHtml } from '../components/UploadModal';
import { renderBatchMediaModalHtml } from '../components/BatchMediaModal';
import { renderCloudSyncModalHtml } from '../components/CloudSyncModal';
import { renderThumbnailsModalHtml } from '../components/ThumbnailsModal';
import { renderShortcutsModalHtml } from '../components/ShortcutsModal';
import { renderVideoModalHtml } from '../components/VideoModal';
import { renderDeleteConfirmModalHtml } from '../components/DeleteConfirmModal';
import { renderPwaInstallModalHtml } from '../components/PwaInstallModal';

export function renderAppModalsAndOverlaysHtml(): string {
  return `
    ${renderUploadModalHtml()}
    ${renderBatchMediaModalHtml()}
    ${renderCloudSyncModalHtml()}
    ${renderThumbnailsModalHtml()}
    ${renderShortcutsModalHtml()}
    ${renderVideoModalHtml()}
    ${renderDeleteConfirmModalHtml()}
    ${renderPwaInstallModalHtml()}

    <!-- Global Toast Notification -->
    <div 
      id="toast" 
      class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white font-extrabold px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border-2 border-slate-700 max-w-sm text-xs sm:text-sm text-center opacity-0 -translate-y-24 backdrop-blur-md"
    >
      <span id="toast-message">Thông báo</span>
    </div>

    <!-- Global Loading Progress Overlay with Cancel Button -->
    <div 
      id="flipbook-loader" 
      class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-4"
    >
      <div class="relative w-20 h-20">
        <div class="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center font-black text-xs text-emerald-400" id="loader-percent">
          0%
        </div>
      </div>
      <div class="space-y-1">
        <p id="loader-status" class="font-black text-lg text-white">Đang nạp dữ liệu...</p>
        <p id="loader-substatus" class="text-xs font-bold text-slate-400">Vui lòng chờ trong giây lát</p>
      </div>
      <div class="w-64 max-w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div id="loader-progress-bar" class="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full w-0 transition-all duration-200"></div>
      </div>
      <button 
        type="button"
        id="btn-cancel-loading-op"
        onclick="window.cancelLoaderOp && window.cancelLoaderOp()"
        class="btn-3d btn-white text-xs font-black px-4 py-1.5 rounded-xl text-slate-700 mt-2"
      >
        Hủy Thao Tác
      </button>
    </div>
  `;
}
