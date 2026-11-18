import { appState } from '../../state/appState';
import { showToast } from '../../utils/toast';

const NOTES_STORAGE_PREFIX = 'biblio_lesson_notes_';
let noteFontSize = 14;

function getNotesKey(): string {
  const bookId = appState.get('currentBook')?.id || 'default';
  return `${NOTES_STORAGE_PREFIX}${bookId}`;
}

export function syncNotesBoardForCurrentBook(): void {
  const textarea = document.getElementById('teaching-notes-textarea') as HTMLTextAreaElement;
  if (!textarea) return;
  try {
    textarea.value = localStorage.getItem(getNotesKey()) || '';
  } catch {
    textarea.value = '';
  }
}

export function toggleNotesWidget(): void {
  const panel = document.getElementById('widget-teaching-notes');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    syncNotesBoardForCurrentBook();
  }
}

export function renderNotesBoardHtml(): string {
  return `
  <aside id="widget-teaching-notes" class="hidden teaching-floating-widget absolute top-4 left-4 bottom-20 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden select-none">
    <div class="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
        <i data-lucide="notebook-pen" class="w-4 h-4 text-emerald-600"></i>
        <span>Bảng từ vựng & Ghi chú</span>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" id="btn-notes-font-dec" class="px-1.5 py-0.5 rounded hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer" title="Thu nhỏ chữ">A-</button>
        <button type="button" id="btn-notes-font-inc" class="px-1.5 py-0.5 rounded hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer" title="Phóng to chữ">A+</button>
        <button type="button" id="btn-notes-close" class="w-6 h-6 rounded-md hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" title="Đóng bảng ghi chú">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>

    <div class="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <button type="button" data-snippet="• Từ mới:  /  / — " class="btn-note-snippet px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap cursor-pointer">+ Từ vựng</button>
      <button type="button" data-snippet="★ Cấu trúc: S + V + ..." class="btn-note-snippet px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap cursor-pointer">+ Cấu trúc</button>
      <button type="button" data-snippet="📝 BTVN: Trang  - Bài " class="btn-note-snippet px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap cursor-pointer">+ BTVN</button>
    </div>

    <textarea
      id="teaching-notes-textarea"
      placeholder="Gõ từ vựng, phiên âm IPA, cấu trúc ngữ pháp hoặc bài tập về nhà ngay trên màn hình chia sẻ..."
      class="flex-1 w-full p-3.5 bg-transparent text-slate-800 placeholder-slate-400 resize-none focus:outline-none leading-relaxed font-medium select-text"
      style="font-size: 14px;"
    ></textarea>

    <div class="px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/60">
      <button type="button" id="btn-notes-clear" class="text-[11px] font-semibold text-slate-500 hover:text-rose-600 cursor-pointer">Xóa ghi chú</button>
      <button type="button" id="btn-notes-copy" class="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer">
        <i data-lucide="copy" class="w-3 h-3"></i>
        <span>Sao chép</span>
      </button>
    </div>
  </aside>
  `;
}

export function setupNotesBoardListeners(): void {
  const textarea = document.getElementById('teaching-notes-textarea') as HTMLTextAreaElement;

  textarea?.addEventListener('input', () => {
    try {
      localStorage.setItem(getNotesKey(), textarea.value);
    } catch {
      // ignore storage quota
    }
  });

  document.getElementById('btn-notes-close')?.addEventListener('click', () => {
    document.getElementById('widget-teaching-notes')?.classList.add('hidden');
  });

  document.getElementById('btn-notes-font-inc')?.addEventListener('click', () => {
    noteFontSize = Math.min(24, noteFontSize + 2);
    if (textarea) textarea.style.fontSize = `${noteFontSize}px`;
  });

  document.getElementById('btn-notes-font-dec')?.addEventListener('click', () => {
    noteFontSize = Math.max(12, noteFontSize - 2);
    if (textarea) textarea.style.fontSize = `${noteFontSize}px`;
  });

  document.getElementById('btn-notes-clear')?.addEventListener('click', () => {
    if (!textarea) return;
    textarea.value = '';
    try { localStorage.removeItem(getNotesKey()); } catch {}
    showToast('Đã xóa ghi chú bài học');
  });

  document.getElementById('btn-notes-copy')?.addEventListener('click', () => {
    if (!textarea || !textarea.value.trim()) {
      showToast('⚠️ Chưa có nội dung để sao chép');
      return;
    }
    navigator.clipboard?.writeText(textarea.value);
    showToast('📋 Đã sao chép ghi chú bài giảng!');
  });

  document.querySelectorAll('.btn-note-snippet').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!textarea) return;
      const snippet = btn.getAttribute('data-snippet') || '';
      const prefix = textarea.value && !textarea.value.endsWith('\n') ? '\n' : '';
      textarea.value += `${prefix}${snippet}`;
      textarea.focus();
      textarea.dispatchEvent(new Event('input'));
    });
  });

  appState.subscribe('currentBook', () => syncNotesBoardForCurrentBook());
}
