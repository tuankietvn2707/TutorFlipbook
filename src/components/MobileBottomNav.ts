export function renderMobileBottomNavHtml(): string {
  return `
  <!-- MOBILE BOTTOM FLOATING NAVIGATION BAR (Appears only on mobile md:hidden) -->
  <nav id="mobile-bottom-nav" class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb select-none">
    <button id="mob-nav-library" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-sky-600 font-black text-[10px] gap-1 active:scale-95 transition-all">
      <div class="mob-icon-box w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-sm">
        <i data-lucide="layout-grid" class="w-4 h-4"></i>
      </div>
      <span class="leading-none font-black">Thư Viện</span>
    </button>
    
    <button id="mob-nav-reader" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-extrabold text-[10px] gap-1 active:scale-95 transition-all">
      <div class="mob-icon-box w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
        <i data-lucide="book-open" class="w-4 h-4"></i>
      </div>
      <span class="leading-none">Đọc 3D</span>
    </button>
    
    <button id="mob-nav-upload" class="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-[#58CC02] to-[#46A302] text-white font-black text-[9px] shadow-lg border-b-4 border-[#399300] active:scale-90 active:border-b-0 transition-all -mt-5 mx-1" title="Tải Sách PDF">
      <i data-lucide="plus" class="w-5 h-5"></i>
      <span class="leading-none mt-0.5">Tải PDF</span>
    </button>
    
    <button id="mob-nav-audio" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-extrabold text-[10px] gap-1 active:scale-95 transition-all">
      <div class="mob-icon-box w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
        <i data-lucide="headphones" class="w-4 h-4"></i>
      </div>
      <span class="leading-none">Audio</span>
    </button>
    
    <button id="mob-nav-gdrive" class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-extrabold text-[10px] gap-1 active:scale-95 transition-all relative" title="Đồng bộ Google Drive">
      <div class="relative mob-icon-box w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
        <i data-lucide="cloud" class="w-4 h-4"></i>
        <span id="mob-gdrive-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-1 -right-1 ring-2 ring-white"></span>
      </div>
      <span class="leading-none" id="mob-nav-gdrive-text">Đồng Bộ</span>
    </button>
  </nav>
  `;
}

export function setupMobileNavListeners(callbacks: {
  onShowLibrary: () => void;
  onResumeReader: () => void;
  onOpenUpload: () => void;
  onToggleAudio: () => void;
  onOpenDrive: () => void;
}): void {
  document.getElementById('mob-nav-library')?.addEventListener('click', callbacks.onShowLibrary);
  document.getElementById('mob-nav-reader')?.addEventListener('click', callbacks.onResumeReader);
  document.getElementById('mob-nav-upload')?.addEventListener('click', callbacks.onOpenUpload);
  document.getElementById('mob-nav-audio')?.addEventListener('click', callbacks.onToggleAudio);
  document.getElementById('mob-nav-gdrive')?.addEventListener('click', callbacks.onOpenDrive);
}
