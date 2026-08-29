import { Book } from '../types';
import { appState } from '../state/appState';
import { refreshLucideIcons } from '../utils/icons';
import { openBatchMediaModal } from './BatchMediaModal';

export function renderLibraryViewHtml(): string {
  return `
  <section id="view-library" class="space-y-6">
    
    <!-- Book Grid Container (Realistic 3D Book Shelf) -->
    <div id="books-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Dynamic 3D Book Cards -->
    </div>

    <!-- Empty State Container -->
    <div id="empty-state" class="hidden text-center py-16 px-4 space-y-4">
      <div class="w-20 h-20 mx-auto rounded-3xl bg-duoBlue/10 text-duoBlue flex items-center justify-center border-2 border-duoBlue/20 shadow-inner">
        <i data-lucide="book-open" class="w-10 h-10"></i>
      </div>
      <div class="space-y-1">
        <h3 class="font-black text-lg text-slate-800">Thư viện chưa có tài liệu nào</h3>
        <p class="text-xs text-slate-500 font-bold max-w-sm mx-auto">
          Hãy tải lên file PDF giáo trình hoặc sách ngoại ngữ đầu tiên của bạn để mở chế độ lật sách 3D sống động!
        </p>
      </div>
      <button id="btn-empty-upload" class="btn-3d btn-green text-white font-black px-6 py-2.5 rounded-2xl text-xs inline-flex items-center gap-2 shadow-md cursor-pointer">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>Tải Sách PDF Ngay</span>
      </button>
    </div>

  </section>
  `;
}

export function renderLibraryGrid(): void {
  const allBooks = appState.get('allBooks') || [];
  const searchQuery = (appState.get('searchQuery') || '').toLowerCase().trim();

  let filtered = allBooks;
  if (searchQuery) {
    filtered = filtered.filter(b => b.title.toLowerCase().includes(searchQuery));
  }

  const container = document.getElementById('books-grid');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('sidebar-book-count');

  if (countEl) {
    countEl.innerText = `${allBooks.length} cuốn`;
  }

  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  container.innerHTML = filtered
    .map(b => {
      const audioCount = b.audioTracks ? b.audioTracks.length : 0;
      const coverSrc = b.coverImage || (b.pages && b.pages[0]) || '';

      return `
      <div class="card-3d bg-white rounded-3xl p-4 flex flex-col justify-between space-y-3.5 group hover:border-duoBlue/50 hover:shadow-xl transition-all duration-300">
        
        <!-- 3D REALISTIC BOOK COVER CONTAINER -->
        <div 
          class="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200/80 shadow-md group-hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          onclick="window.onBookCardClick('${b.id}')"
          title="Nhấn để mở đọc 3D: ${b.title}"
        >
          
          <!-- Realistic Cover Image or Dynamic Fallback -->
          ${
            coverSrc
              ? `
              <img 
                src="${coverSrc}" 
                alt="${b.title}" 
                class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 select-none"
                loading="lazy"
                onerror="this.style.display='none'"
              />
              `
              : `
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-4 text-white flex flex-col justify-between">
                <div class="space-y-1">
                  <span class="text-[10px] font-black uppercase text-emerald-300">BIBLIO 3D</span>
                  <h4 class="font-black text-base line-clamp-3 leading-snug">${b.title}</h4>
                </div>
                <div class="text-xs font-bold text-slate-300">${b.totalPages} trang</div>
              </div>
              `
          }

          <!-- 3D Book Spine Left Crease & Highlight Effect -->
          <div class="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none z-10"></div>
          <div class="absolute left-[3px] top-0 bottom-0 w-[1.5px] bg-white/30 pointer-events-none z-10"></div>

          <!-- Gloss Ribbon Light Sweep -->
          <div class="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/20 pointer-events-none z-10"></div>

          <!-- 3D Right Book Page Edges Effect -->
          <div class="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-l from-black/30 via-white/10 to-transparent pointer-events-none z-10"></div>

          <!-- TOP FLOATING BADGES -->
          <div class="flex items-center justify-between gap-1.5 p-2.5 z-20">
            ${
              b.isSample
                ? `<span class="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm border border-amber-200">✨ MẪU 3D</span>`
                : `<span></span>`
            }
          </div>

          <!-- HOVER QUICK-ACTION OVERLAY -->
          <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col items-center justify-center p-4 text-white text-center gap-2">
            <div class="w-12 h-12 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200 border-b-4 border-[#399300]">
              <i data-lucide="book-open" class="w-6 h-6"></i>
            </div>
            <span class="font-black text-xs sm:text-sm drop-shadow-md">Lật Sách 3D Ngay</span>
            <span class="text-[10px] text-slate-200 font-bold bg-black/40 px-2 py-0.5 rounded-md">${b.totalPages} trang</span>
          </div>

          <!-- BOTTOM METADATA BADGES ON COVER -->
          <div class="flex items-center justify-between p-2.5 z-20 text-[11px] font-black text-white">
            <span class="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 shadow-sm flex items-center gap-1">
              <i data-lucide="file-text" class="w-3 h-3 text-sky-400"></i>
              ${b.totalPages} trang
            </span>

            ${
              audioCount > 0
                ? `
                <span class="bg-purple-900/80 backdrop-blur-md text-purple-200 px-2 py-0.5 rounded-lg border border-purple-400/40 shadow-sm flex items-center gap-1">
                  <i data-lucide="headphones" class="w-3 h-3 text-purple-300"></i>
                  ${audioCount} Audio
                </span>
                `
                : `
                <span class="bg-black/40 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-lg border border-white/10 shadow-sm text-[10px]">
                  Chưa có Audio
                </span>
                `
            }
          </div>

        </div>

        <!-- Book Title & Created Date -->
        <div class="space-y-1 px-0.5">
          <h4 class="font-black text-sm text-slate-800 line-clamp-1 group-hover:text-duoBlue transition-colors" title="${b.title}">
            ${b.title}
          </h4>
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Ngày: ${new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
            <span class="text-duoGreen font-black flex items-center gap-0.5">
              <i data-lucide="sparkles" class="w-3 h-3"></i> Lật 3D Mượt
            </span>
          </div>
        </div>

        <!-- Card Action Footer -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          
          <!-- Open 3D Flipbook Button -->
          <button 
            onclick="window.onBookCardClick('${b.id}')" 
            class="btn-3d btn-green flex-1 py-2 px-2.5 rounded-xl font-black text-xs text-white flex items-center justify-center gap-1 shadow-sm hover:brightness-105 cursor-pointer"
            title="Mở sách đọc 3D"
          >
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>Đọc 3D</span>
          </button>

          <!-- Add Audio To This Book Button -->
          <button 
            onclick="window.onBookAddAudioClick('${b.id}')" 
            class="btn-3d btn-purple py-2 px-2.5 rounded-xl font-black text-xs text-white flex items-center justify-center gap-1 shadow-sm hover:brightness-105 cursor-pointer"
            title="Thêm file Audio / Bài nghe cho sách này"
          >
            <i data-lucide="headphones" class="w-3.5 h-3.5 text-purple-200"></i>
            <span>+ Audio</span>
          </button>

          <!-- Video Button if exists -->
          ${
            b.videoUrl
              ? `
              <button 
                onclick="window.onBookVideoClick('${b.id}')" 
                class="btn-3d btn-white p-2 rounded-xl text-rose-500 hover:text-rose-600 cursor-pointer" 
                title="Xem video bài giảng đính kèm"
              >
                <i data-lucide="video" class="w-4 h-4"></i>
              </button>
              `
              : ''
          }

          <!-- Delete Button -->
          <button 
            onclick="window.onBookDeleteClick('${b.id}')" 
            class="btn-3d btn-white p-2 rounded-xl text-slate-400 hover:text-rose-500 cursor-pointer" 
            title="Xóa sách khỏi thư viện"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>

        </div>

      </div>
      `;
    })
    .join('');

  refreshLucideIcons();
}

export function setupLibraryListeners(callbacks: {
  onOpenBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onOpenUpload?: () => void;
  onOpenBatchMedia?: (bookId?: string) => void;
}): void {
  // Global book click handler
  (window as any).onBookCardClick = (id: string) => {
    const books = appState.get('allBooks');
    const book = books.find(b => b.id === id);
    if (book) {
      callbacks.onOpenBook(book);
    }
  };

  (window as any).onBookDeleteClick = (id: string) => {
    const books = appState.get('allBooks');
    const book = books.find(b => b.id === id);
    if (book) {
      callbacks.onDeleteBook(book);
    }
  };

  (window as any).onBookVideoClick = (id: string) => {
    const books = appState.get('allBooks');
    const book = books.find(b => b.id === id);
    if (book && book.videoUrl) {
      if ((window as any).openVideoModalGlobal) {
        (window as any).openVideoModalGlobal(book.videoUrl, book.title);
      }
    }
  };

  // Add Audio directly to specific book
  (window as any).onBookAddAudioClick = (id: string) => {
    if (callbacks.onOpenBatchMedia) {
      callbacks.onOpenBatchMedia(id);
    } else {
      openBatchMediaModal(id);
    }
  };

  const emptyUploadBtn = document.getElementById('btn-empty-upload');
  if (callbacks.onOpenUpload) {
    emptyUploadBtn?.addEventListener('click', callbacks.onOpenUpload);
  }
}
