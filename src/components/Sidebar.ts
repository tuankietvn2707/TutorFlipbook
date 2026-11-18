import { renderBrandLogoSvg } from '../utils/logo';
import { APP_VERSION } from '../version';

export function renderSidebarHtml(): string {
  return `
  <!-- DESKTOP LEFT NAVIGATION SIDEBAR -->
  <aside id="main-sidebar" class="hidden md:flex flex-col justify-between w-64 bg-white border-r border-slate-200 p-4 select-none shrink-0 h-full">
    
    <!-- Top Branding & Navigation Links -->
    <div class="space-y-6">
      
      <!-- Brand Identity -->
      <div class="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group" id="brand-logo-btn" title="Về thư viện giáo trình">
        <div class="group-hover:scale-105 transition-transform duration-200 shrink-0">
          ${renderBrandLogoSvg(40)}
        </div>
        <div class="min-w-0">
          <h1 class="font-extrabold text-lg tracking-tight text-slate-900 leading-none whitespace-nowrap">
            BIBLIO 3D
          </h1>
          <p class="text-[11px] font-semibold text-slate-500 mt-1 whitespace-nowrap">
            Tutor Teaching Studio
          </p>
        </div>
      </div>

      <!-- Main Navigation Menu -->
      <nav class="space-y-1.5">
        <button id="nav-btn-library" class="btn-nav-library-active w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap">
          <div class="nav-icon-badge w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <i data-lucide="layout-grid" class="w-4 h-4"></i>
          </div>
          <span class="nav-text font-bold">Thư viện sách</span>
        </button>

        <button id="nav-btn-reader" class="btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap">
          <div class="nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <i data-lucide="book-open" class="w-4 h-4"></i>
          </div>
          <span class="nav-text">Đọc sách 3D</span>
        </button>

        <button id="nav-btn-meet" class="btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap">
          <div class="nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <i data-lucide="presentation" class="w-4 h-4"></i>
          </div>
          <span class="nav-text">Phòng giảng Meet</span>
        </button>

        <button id="nav-btn-batch-media" class="btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap">
          <div class="nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <i data-lucide="music" class="w-4 h-4"></i>
          </div>
          <span class="nav-text">Tải Audio hàng loạt</span>
        </button>

        <button id="nav-btn-gdrive" class="btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between gap-2 text-left transition-all cursor-pointer whitespace-nowrap">
          <span class="flex items-center gap-3 min-w-0">
            <span class="nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <i data-lucide="cloud" class="w-4 h-4"></i>
            </span>
            <span class="nav-text truncate">Đồng bộ Cloud</span>
          </span>
          <span id="sidebar-cloud-dot" class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
        </button>

        <button id="nav-btn-pwa" class="btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap">
          <div class="nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <i data-lucide="smartphone" class="w-4 h-4"></i>
          </div>
          <span class="nav-text">Cài đặt ứng dụng</span>
        </button>
      </nav>
    </div>

    <!-- Bottom Storage Summary & Version -->
    <div class="space-y-3">
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
        <div class="flex items-center justify-between text-xs font-bold text-slate-900">
          <span class="flex items-center gap-2">
            <i data-lucide="database" class="w-4 h-4 text-emerald-600"></i>
            <span>Kho giáo trình</span>
          </span>
          <span id="sidebar-book-count" class="font-mono text-xs font-bold text-emerald-700 tabular-nums">0 cuốn</span>
        </div>
        <p class="text-[11px] text-slate-500 leading-relaxed">
          Lưu trữ ngoại tuyến & đồng bộ Firebase Cloud mọi thiết bị cho sách PDF và WAV/MP3.
        </p>
      </div>

      <div class="px-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
        <span>Biblio3D Studio</span>
        <span class="font-mono tabular-nums">v${APP_VERSION}</span>
      </div>
    </div>

  </aside>
  `;
}

export function setupSidebarListeners(callbacks: {
  onShowLibrary: () => void;
  onResumeReader: () => void;
  onOpenTeachingMeet?: () => void;
  onOpenUploadModal?: () => void;
  onOpenDriveModal: () => void;
  onOpenBatchMediaModal: () => void;
  onOpenPwaModal: () => void;
}): void {
  document.getElementById('nav-btn-library')?.addEventListener('click', callbacks.onShowLibrary);
  document.getElementById('nav-btn-reader')?.addEventListener('click', callbacks.onResumeReader);
  document.getElementById('nav-btn-meet')?.addEventListener('click', callbacks.onOpenTeachingMeet || callbacks.onResumeReader);
  document.getElementById('nav-btn-gdrive')?.addEventListener('click', callbacks.onOpenDriveModal);
  document.getElementById('nav-btn-batch-media')?.addEventListener('click', callbacks.onOpenBatchMediaModal);
  document.getElementById('nav-btn-pwa')?.addEventListener('click', callbacks.onOpenPwaModal);
  document.getElementById('brand-logo-btn')?.addEventListener('click', callbacks.onShowLibrary);
}
