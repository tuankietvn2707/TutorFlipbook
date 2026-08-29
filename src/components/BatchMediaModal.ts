import { AudioTrack, Book } from '../types';
import { appState } from '../state/appState';
import { saveBookToDB } from '../services/dbService';
import { naturalSortAudioTracks } from '../utils/sorting';
import { showToast } from '../utils/toast';

let batchAudioQueue: { file: File; name: string; size: number }[] = [];

export function renderBatchMediaModalHtml(): string {
  return `
  <!-- MODAL: TẢI HÀNG LOẠT FILE MEDIA / AUDIO (BATCH MEDIA UPLOADER) -->
  <div id="modal-batch-media" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div class="card-3d w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 bg-white">
      
      <div class="flex items-center justify-between pb-3 border-b-2 border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-duoPurple/20 text-duoPurpleDark flex items-center justify-center">
            <i data-lucide="layers" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-black text-lg text-slate-800">Tải Nhanh Hàng Loạt File Media (Batch Audio)</h3>
            <p class="text-[11px] font-bold text-slate-500">Upload cùng lúc nhiều tệp MP3, WAV, M4A cho sách hoặc tạo Album Audio</p>
          </div>
        </div>
        <button id="btn-close-batch-modal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Batch Drop Area -->
      <div 
        id="batch-dropzone" 
        class="border-4 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
      >
        <div class="w-14 h-14 rounded-2xl bg-purple-100 text-duoPurpleDark flex items-center justify-center">
          <i data-lucide="upload-cloud" class="w-8 h-8"></i>
        </div>
        <p class="font-black text-sm text-slate-800">Kéo & Thả Hàng Loạt File Âm Thanh Vào Đây</p>
        <p class="text-xs text-slate-500 font-bold">Hỗ trợ chọn cùng lúc nhiều file: .mp3, .wav, .m4a, .aac, .ogg, .flac</p>
        <input type="file" id="batch-media-input" multiple accept="audio/*" class="hidden" />
      </div>

      <!-- Target Selection: Gán vào sách nào? -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
        <div>
          <label class="block font-black text-[11px] text-slate-700 uppercase tracking-wider mb-1">Gán vào Sách / Bài học:</label>
          <select id="batch-target-book-select" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 focus:outline-none focus:border-duoPurple">
            <!-- Populated via JS -->
          </select>
        </div>
        <div>
          <label class="block font-black text-[11px] text-slate-700 uppercase tracking-wider mb-1">Tự động đánh số Track:</label>
          <div class="flex items-center gap-2 pt-1">
            <button type="button" id="btn-sort-batch-asc" class="btn-3d btn-white text-xs font-bold px-2.5 py-1 rounded-lg">Sắp xếp A-Z / Số</button>
            <button type="button" id="btn-clear-batch-queue" class="btn-3d btn-white text-xs font-bold px-2.5 py-1 rounded-lg text-red-500">Xóa danh sách</button>
          </div>
        </div>
      </div>

      <!-- Batch File List Table -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-black text-slate-600 px-1">
          <span>Danh sách tệp chuẩn bị tải lên (<span id="batch-queue-count">0</span> tệp):</span>
          <span id="batch-queue-size" class="text-slate-400 font-bold">0 MB</span>
        </div>
        <div id="batch-queue-list" class="space-y-1.5 max-h-52 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
          <div class="text-center py-6 text-xs text-slate-400 font-bold">
            Chưa có tệp âm thanh nào. Hãy chọn hoặc kéo thả nhiều file vào khung ở trên.
          </div>
        </div>
      </div>

      <!-- Batch Actions -->
      <div class="flex items-center justify-between pt-3 border-t-2 border-slate-100">
        <span class="text-xs font-bold text-emerald-600 flex items-center gap-1">
          <i data-lucide="hard-drive" class="w-4 h-4"></i> Lưu trữ Google Drive & Offline
        </span>
        <div class="flex items-center gap-2">
          <button id="btn-cancel-batch" class="btn-3d btn-white font-extrabold px-4 py-2 rounded-xl text-xs">Đóng</button>
          <button id="btn-submit-batch" class="btn-3d btn-purple font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Bắt Đầu Tải Lên Hàng Loạt</span>
          </button>
        </div>
      </div>

    </div>
  </div>
  `;
}

export function openBatchMediaModal(targetBookId?: string): void {
  const modal = document.getElementById('modal-batch-media');
  modal?.classList.remove('hidden');
  populateBooksDropdown(targetBookId);
  updateQueueListUI();
}

export function closeBatchMediaModal(): void {
  const modal = document.getElementById('modal-batch-media');
  modal?.classList.add('hidden');
}

function populateBooksDropdown(selectedBookId?: string): void {
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
    if (b.id === targetId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

function updateQueueListUI(): void {
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
        <span class="truncate text-slate-800">${item.name}</span>
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

export function setupBatchMediaListeners(onBatchAddedToBook: (book: Book) => void): void {
  const dropzone = document.getElementById('batch-dropzone');
  const input = document.getElementById('batch-media-input') as HTMLInputElement;

  dropzone?.addEventListener('click', () => input?.click());

  input?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-purple-500', 'bg-purple-100/50');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-purple-500', 'bg-purple-100/50');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-purple-500', 'bg-purple-100/50');
    if (e.dataTransfer && e.dataTransfer.files) {
      const audioFiles = Array.from(e.dataTransfer.files).filter(
        f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i)
      );
      if (audioFiles.length > 0) {
        addFilesToQueue(audioFiles);
      }
    }
  });

  (window as any).removeBatchItem = (idx: number) => {
    batchAudioQueue.splice(idx, 1);
    updateQueueListUI();
  };

  document.getElementById('btn-sort-batch-asc')?.addEventListener('click', () => {
    batchAudioQueue = naturalSortAudioTracks(batchAudioQueue);
    updateQueueListUI();
    showToast('✨ Đã sắp xếp danh sách audio theo số tự nhiên (1..10)');
  });

  document.getElementById('btn-clear-batch-queue')?.addEventListener('click', () => {
    batchAudioQueue = [];
    updateQueueListUI();
  });

  document.getElementById('btn-close-batch-modal')?.addEventListener('click', closeBatchMediaModal);
  document.getElementById('btn-cancel-batch')?.addEventListener('click', closeBatchMediaModal);

  document.getElementById('btn-submit-batch')?.addEventListener('click', async () => {
    if (batchAudioQueue.length === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất 1 file âm thanh!');
      return;
    }

    const select = document.getElementById('batch-target-book-select') as HTMLSelectElement;
    const targetBookId = select.value;
    const books = appState.get('allBooks');
    const targetBook = books.find(b => b.id === targetBookId);

    if (!targetBook) {
      showToast('⚠️ Vui lòng chọn sách để gán file audio');
      return;
    }

    if (!targetBook.audioTracks) {
      targetBook.audioTracks = [];
    }

    showToast(`⏳ Đang lưu trữ ${batchAudioQueue.length} file audio vào sách...`);

    const newTracks: AudioTrack[] = [];
    for (let i = 0; i < batchAudioQueue.length; i++) {
      const item = batchAudioQueue[i];
      try {
        const dataUrl = await readFileAsDataURL(item.file);
        newTracks.push({
          id: 'track_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
          name: item.name,
          url: dataUrl,
          size: item.size
        });
      } catch {
        const url = URL.createObjectURL(item.file);
        newTracks.push({
          id: 'track_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
          name: item.name,
          url,
          size: item.size
        });
      }
    }

    targetBook.audioTracks = naturalSortAudioTracks([...targetBook.audioTracks, ...newTracks]);
    await saveBookToDB(targetBook);

    batchAudioQueue = [];
    closeBatchMediaModal();
    showToast(`🎉 Đã thêm ${newTracks.length} bài nghe Audio vào sách "${targetBook.title}"! Tổng: ${targetBook.audioTracks.length} bài`);
    onBatchAddedToBook(targetBook);
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function addFilesToQueue(files: File[]): void {
  for (const f of files) {
    batchAudioQueue.push({
      file: f,
      name: f.name.replace(/\.[^/.]+$/, ''),
      size: f.size
    });
  }
  batchAudioQueue = naturalSortAudioTracks(batchAudioQueue);
  updateQueueListUI();
}
