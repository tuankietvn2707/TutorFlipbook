import { appState } from '../state/appState';
import { renderBrandLogoSvg } from '../utils/logo';

export function renderSidebarHtml(): string {
  return `
  <!-- DESKTOP LEFT NAVIGATION SIDEBAR -->
  <aside id="main-sidebar" class="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white border-r-2 border-slate-200 p-4 select-none shrink-0 h-full">
    
    <!-- Top Branding & Navigation Links -->
    <div class="space-y-6">
      
      <!-- Brand Logo Capsule (Colorful 3D Studio Identity) -->
      <div class="flex items-center gap-3 px-2 py-1.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer group" id="brand-logo-btn" title="Về trang chủ thư viện">
        <div class="group-hover:scale-105 transition-transform duration-200">
          ${renderBrandLogoSvg(46)}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <h1 class="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-sky-600 to-purple-600 bg-clip-text text-transparent leading-none">
              BIBLIO 3D
            </h1>
          </div>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-[10px] font-black bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              TUTOR STUDIO
            </span>
            <span class="text-[10px] font-extrabold text-amber-500">★</span>
          </div>
        </div>
      </div>

      <!-- Main Navigation Menu -->
      <nav class="space-y-2">
        <button id="nav-btn-library" class="btn-3d btn-nav-library-active w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="nav-icon-badge w-9 h-9 rounded-xl bg-sky-500 text-white shadow-sm flex items-center justify-center transition-all group-hover:scale-105">
              <i data-lucide="layout-grid" class="w-5 h-5"></i>
            </div>
            <span class="nav-text text-sky-800">Thư Viện Sách</span>
          </div>
          <span class="nav-pill text-[10px] font-black bg-sky-100 text-sky-700 px-2 py-0.5 rounded-lg">Chính</span>
        </button>

        <button id="nav-btn-reader" class="btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="nav-icon-badge w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white">
              <i data-lucide="book-open" class="w-5 h-5"></i>
            </div>
            <span class="nav-text text-slate-700 group-hover:text-emerald-700">Đọc Sách 3D</span>
          </div>
          <span class="text-[10px] font-black bg-emerald-100/70 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200/50">3D</span>
        </button>

        <button id="nav-btn-meet" class="btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="nav-icon-badge w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-indigo-500 group-hover:text-white">
              <i data-lucide="presentation" class="w-5 h-5"></i>
            </div>
            <span class="nav-text text-slate-700 group-hover:text-indigo-700">Phòng Học Meet 3D</span>
          </div>
          <span class="text-[10px] font-black bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200/50">Lớp Học</span>
        </button>

        <button id="nav-btn-gdrive" class="btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="nav-icon-badge w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-white">
              <i data-lucide="cloud" class="w-5 h-5"></i>
            </div>
            <span class="nav-text text-slate-700 group-hover:text-amber-700">Google Drive Sync</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Đang đồng bộ"></span>
        </button>

        <button id="nav-btn-batch-media" class="btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="nav-icon-badge w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-purple-500 group-hover:text-white">
              <i data-lucide="music" class="w-5 h-5"></i>
            </div>
            <span class="nav-text text-slate-700 group-hover:text-purple-700">Tải Audio Hàng Loạt</span>
          </div>
          <span class="text-[10px] font-black bg-purple-100/70 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200/50">MP3s</span>
        </button>

        <button id="nav-btn-pwa" class="btn-3d btn-nav-inactive w-full p-2.5 rounded-2xl font-black text-sm flex items-center justify-between text-left group transition-all duration-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="nav-icon-badge w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-rose-500 group-hover:text-white">
              <i data-lucide="smartphone" class="w-5 h-5"></i>
            </div>
            <span class="nav-text text-slate-700 group-hover:text-rose-700">Ghim Vào Màn Hình</span>
          </div>
          <span class="text-[10px] font-black bg-rose-100/70 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200/50">App</span>
        </button>
      </nav>
    </div>

    <!-- Bottom Storage Status Card -->
    <div class="p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/30 border-2 border-slate-200 rounded-2xl space-y-2.5 shadow-xs">
      <div class="flex items-center justify-between text-xs font-black text-slate-800">
        <span class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <i data-lucide="database" class="w-3.5 h-3.5"></i>
          </div>
          <span>Bộ Nhớ Sách</span>
        </span>
        <span id="sidebar-book-count" class="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">0 cuốn</span>
      </div>
      <p class="text-[10px] text-slate-500 font-bold leading-tight">
        Lưu trữ không giới hạn trang sách & file Audio offline.
      </p>
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
  
  if (callbacks.onOpenTeachingMeet) {
    document.getElementById('nav-btn-meet')?.addEventListener('click', callbacks.onOpenTeachingMeet);
  } else {
    document.getElementById('nav-btn-meet')?.addEventListener('click', callbacks.onResumeReader);
  }

  document.getElementById('nav-btn-gdrive')?.addEventListener('click', callbacks.onOpenDriveModal);
  document.getElementById('nav-btn-batch-media')?.addEventListener('click', callbacks.onOpenBatchMediaModal);
  document.getElementById('nav-btn-pwa')?.addEventListener('click', callbacks.onOpenPwaModal);
  document.getElementById('brand-logo-btn')?.addEventListener('click', callbacks.onShowLibrary);
}
