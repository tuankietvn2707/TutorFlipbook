import { appState } from '../state/appState';
import { renderBrandLogoSvg } from '../utils/logo';

export function renderHeaderHtml(): string {
  return `
  <header class="bg-white border-b-2 border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-sm select-none">
    
    <!-- Mobile-Only Brand Logo -->
    <div class="flex md:hidden items-center gap-2 cursor-pointer shrink-0" id="header-mobile-brand-btn" title="Thư viện sách 3D">
      ${renderBrandLogoSvg(36)}
      <div class="hidden xs:block">
        <h1 class="font-black text-sm leading-none bg-gradient-to-r from-emerald-600 via-sky-600 to-purple-600 bg-clip-text text-transparent">BIBLIO 3D</h1>
      </div>
    </div>

    <!-- Center/Left: Search Box -->
    <div class="flex-1 max-w-md">
      <div class="relative flex items-center">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"></i>
        <input 
          type="text" 
          id="header-search-input" 
          placeholder="Tìm sách giáo trình, bài nghe audio..." 
          class="w-full pl-9 pr-4 py-2 bg-slate-100/90 border-2 border-transparent focus:border-duoBlue focus:bg-white rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
        />
      </div>
    </div>

    <!-- Right: Badges, Sync & Add Book Button -->
    <div class="flex items-center gap-2 sm:gap-3">
      
      <!-- PWA Install Pin Button (Desktop & Android) -->
      <button 
        id="btn-header-install-pwa" 
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border-2 border-b-4 border-amber-300 rounded-2xl text-xs font-black transition active:translate-y-0.5 active:border-b-2 cursor-pointer shadow-sm"
        title="Ghim ra màn hình chính"
      >
        <div class="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
          <i data-lucide="smartphone" class="w-3.5 h-3.5"></i>
        </div>
        <span>Ghim App</span>
      </button>

      <!-- Google Drive Sync Quick Button -->
      <button 
        id="btn-header-gdrive-sync" 
        class="relative p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 border-2 border-b-4 border-emerald-300 rounded-2xl text-xs font-black transition flex items-center gap-2 active:translate-y-0.5 active:border-b-2 cursor-pointer shadow-sm"
        title="Đồng bộ Google Drive"
      >
        <div class="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <i data-lucide="cloud" class="w-3.5 h-3.5"></i>
        </div>
        <span class="hidden md:inline">Drive Sync</span>
        <span id="header-gdrive-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white"></span>
      </button>

      <!-- Add PDF Button -->
      <button 
        id="btn-header-add-book" 
        class="btn-3d btn-green text-white font-black px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:brightness-105 cursor-pointer"
        title="Thêm Sách PDF"
      >
        <div class="w-5 h-5 rounded-lg bg-white/25 flex items-center justify-center">
          <i data-lucide="plus" class="w-4 h-4"></i>
        </div>
        <span class="hidden xs:inline">Thêm Sách PDF</span>
      </button>

    </div>

  </header>
  `;
}

export function updateHeaderStats(count: number): void {
  const badge = document.getElementById('sidebar-book-count');
  if (badge) {
    badge.innerText = `${count} cuốn`;
  }
}

export function setupHeaderListeners(callbacks: {
  onSearch: (q: string) => void;
  onOpenUpload: () => void;
  onShowLibrary?: () => void;
  onOpenDriveModal?: () => void;
  onOpenPwaModal?: () => void;
  onOpenDrive?: () => void;
}): void {
  const searchInput = document.getElementById('header-search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', (e: any) => {
    callbacks.onSearch(e.target.value);
  });

  document.getElementById('header-mobile-brand-btn')?.addEventListener('click', () => {
    if (callbacks.onShowLibrary) callbacks.onShowLibrary();
  });

  document.getElementById('btn-header-add-book')?.addEventListener('click', callbacks.onOpenUpload);
  
  const driveHandler = callbacks.onOpenDriveModal || callbacks.onOpenDrive;
  if (driveHandler) {
    document.getElementById('btn-header-gdrive-sync')?.addEventListener('click', driveHandler);
  }

  if (callbacks.onOpenPwaModal) {
    document.getElementById('btn-header-install-pwa')?.addEventListener('click', callbacks.onOpenPwaModal);
  }
}
