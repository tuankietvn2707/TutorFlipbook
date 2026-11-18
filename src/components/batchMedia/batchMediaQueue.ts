import { appState } from '../../state/appState';
import { naturalSortAudioTracks } from '../../utils/sorting';

export interface BatchQueueItem {
  file: File;
  name: string;
  size: number;
  folder?: string;
}

let batchAudioQueue: BatchQueueItem[] = [];

export function getBatchAudioQueue(): BatchQueueItem[] {
  return batchAudioQueue;
}

export function clearBatchAudioQueue(): void {
  batchAudioQueue = [];
  updateQueueListUI();
}

export function removeBatchAudioQueueItem(idx: number): void {
  batchAudioQueue.splice(idx, 1);
  updateQueueListUI();
}

export function sortBatchAudioQueue(): void {
  batchAudioQueue = naturalSortAudioTracks(batchAudioQueue);
  updateQueueListUI();
}

export function populateBooksDropdown(selectedBookId?: string): void {
  const select = document.getElementById('batch-target-book-select') as HTMLSelectElement;
  const books = appState.get('allBooks');
  if (!select) return;

  select.innerHTML = '';
  if (books.length === 0) {
    select.innerHTML = '<option value="">-- Chưa có cuốn sách nào trong thư viện --</option>';
    return;
  }

  const cur = appState.get('currentBook');
  const targetId = selectedBookId || (cur ? cur.id : books[0].id);

  books.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    const audioLen = b.audioTracks ? b.audioTracks.length : 0;
    opt.innerText = `${b.title} (${b.totalPages} trang - hiện có ${audioLen} audio)`;
    if (b.id === targetId) opt.selected = true;
    select.appendChild(opt);
  });
}

export function updateQueueListUI(): void {
  const list = document.getElementById('batch-queue-list');
  const count = document.getElementById('batch-queue-count');
  const sizeLabel = document.getElementById('batch-queue-size');

  if (count) count.innerText = String(batchAudioQueue.length);

  const totalBytes = batchAudioQueue.reduce((acc, cur) => acc + cur.size, 0);
  if (sizeLabel) sizeLabel.innerText = `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;

  if (!list) return;

  if (batchAudioQueue.length === 0) {
    list.innerHTML = `<div class="text-center py-6 text-xs text-slate-400 font-bold">Chưa có tệp âm thanh nào. Hãy chọn hoặc kéo thả nhiều file vào khung ở trên.</div>`;
    return;
  }

  list.innerHTML = batchAudioQueue
    .map(
      (item, idx) => `
    <div class="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold">
      <div class="flex items-center gap-2 truncate">
        <span class="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">${idx + 1}</span>
        <div class="flex flex-col truncate">
          <span class="truncate text-slate-800">${item.name}</span>
          ${item.folder ? `<span class="text-[9px] text-purple-600 font-extrabold truncate uppercase">📁 ${item.folder}</span>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-[10px] text-slate-400">${(item.size / (1024 * 1024)).toFixed(2)} MB</span>
        <button onclick="window.removeBatchItem(${idx})" class="p-1 text-slate-400 hover:text-red-500 rounded">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `
    )
    .join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function addFilesToQueue(files: File[]): void {
  const folderPrompt = prompt('Tạo thư mục cho các file audio này? (Ví dụ: Unit 1, Bài 1. Để trống nếu không cần):', '') || '';
  const baseFolder = folderPrompt.trim();

  for (const f of files) {
    let trackFolder = baseFolder;
    if (!trackFolder && f.webkitRelativePath) {
      const parts = f.webkitRelativePath.split('/');
      if (parts.length > 1) {
        trackFolder = parts[parts.length - 2];
      }
    }

    batchAudioQueue.push({
      file: f,
      name: f.name.replace(/\.[^/.]+$/, ''),
      size: f.size,
      folder: trackFolder || undefined
    });
  }
  batchAudioQueue = naturalSortAudioTracks(batchAudioQueue);
  updateQueueListUI();
}
