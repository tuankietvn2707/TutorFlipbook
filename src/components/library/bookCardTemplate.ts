import { Book } from '../../types';

const CATEGORY_LABEL: Record<string, string> = {
  textbook: 'Giáo trình',
  exercise: 'Bài tập',
  reference: 'Tham khảo'
};

export function renderBookCardHtml(b: Book): string {
  const audioCount = b.audioTracks ? b.audioTracks.length : 0;
  const coverSrc = b.coverImage || (b.pages && b.pages[0]) || '';
  const catLabel = CATEGORY_LABEL[b.category] || 'Giáo trình';
  const dateLabel = new Date(b.createdAt).toLocaleDateString('vi-VN');

  return `
      <article class="card-3d bg-white p-3.5 flex flex-col justify-between space-y-3 group">
        
        <!-- 3D Book Cover Container -->
        <a 
          href="?bookId=${encodeURIComponent(b.id)}"
          class="book-open-trigger block relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer"
          data-book-id="${b.id}"
          title="Nhấn để mở đọc 3D: ${b.title}"
        >
          ${
            coverSrc
              ? `
              <img 
                src="${coverSrc}" 
                alt="${b.title}" 
                referrerPolicy="no-referrer"
                class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] select-none"
                loading="lazy"
                onerror="this.style.display='none'"
              />
              `
              : `
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 p-4 text-white flex flex-col justify-between">
                <h4 class="font-bold text-base line-clamp-3 leading-snug">${b.title}</h4>
                <div class="text-xs font-medium text-slate-300 tabular-nums">${b.totalPages} trang</div>
              </div>
              `
          }

          <div class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none z-10"></div>

          <div class="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 flex flex-col items-center justify-center p-4 text-white text-center gap-2">
            <div class="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <i data-lucide="book-open" class="w-5 h-5"></i>
            </div>
            <span class="font-bold text-xs">Mở trình đọc 3D</span>
          </div>

          <div class="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between text-[11px] font-semibold text-white/95 tabular-nums">
            <span>${b.totalPages} trang</span>
            <span>${audioCount > 0 ? `${audioCount} Audio` : 'Chưa có Audio'}</span>
          </div>
        </a>

        <!-- Clean Unboxed Title & Metadata -->
        <div class="space-y-1 px-0.5">
          <a 
            href="?bookId=${encodeURIComponent(b.id)}"
            class="book-open-trigger font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-sky-700 transition-colors block cursor-pointer" 
            data-book-id="${b.id}"
            title="Đọc 3D: ${b.title}"
          >
            ${b.title}
          </a>
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 tabular-nums truncate">
            <span>${catLabel}</span>
            <span aria-hidden="true">·</span>
            <span>${dateLabel}</span>
            ${b.isSample ? '<span aria-hidden="true">·</span><span class="text-amber-700">Sách mẫu</span>' : ''}
          </div>
        </div>

        <!-- Card Action Footer -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <a 
            href="?bookId=${encodeURIComponent(b.id)}"
            class="book-open-trigger btn-3d btn-green flex-1 py-2 px-2.5 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            data-book-id="${b.id}"
            title="Mở sách đọc 3D"
          >
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>Đọc 3D</span>
          </a>

          <button 
            onclick="window.onBookAddAudioClick('${b.id}')" 
            class="btn-3d btn-purple py-2 px-2.5 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            title="Thêm file Audio / Bài nghe cho sách này"
          >
            <i data-lucide="headphones" class="w-3.5 h-3.5"></i>
            <span>+ Audio</span>
          </button>

          ${
            b.videoUrl
              ? `
              <button 
                onclick="window.onBookVideoClick('${b.id}')" 
                class="btn-white p-2 rounded-lg text-rose-600 hover:text-rose-700 cursor-pointer" 
                title="Xem video bài giảng đính kèm"
              >
                <i data-lucide="video" class="w-4 h-4"></i>
              </button>
              `
              : ''
          }

          <button 
            onclick="window.onBookDeleteClick('${b.id}')" 
            class="btn-white p-2 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer" 
            title="Xóa sách khỏi thư viện"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>

      </article>
      `;
}
