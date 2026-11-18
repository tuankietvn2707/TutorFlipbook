import { renderBrandLogoSvg } from '../utils/logo';

export function renderHeaderHtml(): string {
  return `
  <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 select-none shrink-0">
    
    <!-- Mobile-Only Brand -->
    <div class="flex md:hidden items-center gap-2 cursor-pointer shrink-0" id="header-mobile-brand-btn" title="Thư viện sách 3D">
      ${renderBrandLogoSvg(32)}
      <h1 class="font-extrabold text-sm leading-none text-slate-900 whitespace-nowrap">BIBLIO 3D</h1>
    </div>

    <!-- Search Box -->
    <div class="flex-1 max-w-md">
      <div class="relative flex items-center">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"></i>
        <input 
          type="text" 
          id="header-search-input" 
          placeholder="Tìm giáo trình, tên sách..." 
          class="w-full pl-9 pr-8 py-2 bg-slate-100/80 border border-slate-200/80 focus:border-sky-500 focus:bg-white rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all select-text"
        />
        <button
          type="button"
          id="btn-clear-search"
          class="hidden absolute right-2.5 w-5 h-5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
          title="Xóa từ khóa tìm kiếm"
        >
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-2.5 shrink-0">
      <button 
        id="btn-header-install-pwa" 
        type="button"
        class="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
        title="Cài đặt ứng dụng về máy"
      >
        <i data-lucide="smartphone" class="w-3.5 h-3.5 text-slate-500"></i>
        <span>Cài App</span>
      </button>

      <button 
        id="btn-header-gdrive-sync" 
        type="button"
        class="p-2 sm:px-3 sm:py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 relative"
        title="Đồng bộ tài khoản Firebase Cloud"
      >
        <i data-lucide="cloud" class="w-4 h-4 text-sky-600"></i>
        <span id="header-cloud-btn-label" class="hidden md:inline">Cloud Sync</span>
        <span id="header-cloud-dot" class="w-2 h-2 rounded-full bg-slate-300"></span>
      </button>

      <button 
        id="btn-header-add-book" 
        type="button"
        class="btn-3d btn-green text-white font-semibold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        title="Thêm Sách PDF"
      >
        <i data-lucide="plus" class="w-4 h-4"></i>
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
  const clearBtn = document.getElementById('btn-clear-search');

  searchInput?.addEventListener('input', (e: any) => {
    const val = e.target.value || '';
    clearBtn?.classList.toggle('hidden', !val.trim());
    callbacks.onSearch(val);
  });

  clearBtn?.addEventListener('click', () => {
    if (!searchInput) return;
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    callbacks.onSearch('');
    searchInput.focus();
  });

  document.getElementById('header-mobile-brand-btn')?.addEventListener('click', () => {
    callbacks.onShowLibrary?.();
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
