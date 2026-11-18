import { Book, CategoryFilter } from '../../types';
import { appState } from '../../state/appState';
import { openBatchMediaModal } from '../BatchMediaModal';
import { renderLibraryGrid } from '../LibraryView';

let onlyWithAudio = false;
let sortBy: 'recent' | 'title' | 'audio' | 'pages' = 'recent';

export function getLibraryFilterState() {
  return { onlyWithAudio, sortBy };
}

export function setupLibraryListeners(callbacks: {
  onOpenBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onOpenUpload?: () => void;
  onOpenBatchMedia?: (bookId?: string) => void;
}): void {
  (window as any).onBookCardClick = (id: string, e?: Event) => {
    if (e) e.preventDefault();
    const books = appState.get('allBooks');
    const book = books.find(b => b.id === id || b.id === decodeURIComponent(id));
    callbacks.onOpenBook(book || ({ id } as Book));
  };

  document.querySelectorAll('.btn-lib-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = (btn.getAttribute('data-category') || 'all') as CategoryFilter;
      appState.set('currentCategory', cat);
      document.querySelectorAll('.btn-lib-cat').forEach(el => {
        const active = el.getAttribute('data-category') === cat;
        el.className = active
          ? 'btn-lib-cat px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0'
          : 'btn-lib-cat px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer whitespace-nowrap shrink-0';
      });
      renderLibraryGrid();
    });
  });

  const audioOnlyBtn = document.getElementById('btn-filter-audio-only');
  audioOnlyBtn?.addEventListener('click', () => {
    onlyWithAudio = !onlyWithAudio;
    audioOnlyBtn.className = onlyWithAudio
      ? 'px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0'
      : 'px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0';
    renderLibraryGrid();
  });

  document.getElementById('select-library-sort')?.addEventListener('change', (e: any) => {
    sortBy = e.target.value;
    renderLibraryGrid();
  });

  const libContainer = document.getElementById('view-library-container');
  if (libContainer) {
    libContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') && !target.closest('.book-open-trigger')) return;

      const trigger = target.closest('.book-open-trigger') as HTMLElement;
      if (trigger) {
        const mouseEvent = e as MouseEvent;
        if (!mouseEvent.ctrlKey && !mouseEvent.metaKey && mouseEvent.button === 0) {
          e.preventDefault();
          const id = trigger.getAttribute('data-book-id');
          if (id) {
            const books = appState.get('allBooks');
            const book = books.find(b => b.id === id || b.id === decodeURIComponent(id));
            callbacks.onOpenBook(book || ({ id } as Book));
          }
        }
      }
    });
  }

  (window as any).onBookDeleteClick = (id: string) => {
    const book = appState.get('allBooks').find(b => b.id === id);
    if (book) callbacks.onDeleteBook(book);
  };

  (window as any).onBookVideoClick = (id: string) => {
    const book = appState.get('allBooks').find(b => b.id === id);
    if (book && book.videoUrl && (window as any).openVideoModalGlobal) {
      (window as any).openVideoModalGlobal(book.videoUrl, book.title);
    }
  };

  (window as any).onBookAddAudioClick = (id: string) => {
    if (callbacks.onOpenBatchMedia) callbacks.onOpenBatchMedia(id);
    else openBatchMediaModal(id);
  };

  if (callbacks.onOpenUpload) {
    document.getElementById('btn-empty-upload')?.addEventListener('click', callbacks.onOpenUpload);
  }
}
