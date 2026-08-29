import { AudioTrack, Book } from '../types';
import { extractPagesFromPdfFile } from '../services/pdfService';
import { saveBookToDB } from '../services/dbService';
import { showToast, showLoader, cancelLoadingOperation, setAbortHandler } from '../utils/toast';

let selectedPdfFile: File | null = null;
let uploadedAudioTracks: AudioTrack[] = [];

export function renderUploadModalHtml(): string {
  return `
  <!-- MODAL: TẢI LÊN SÁCH PDF & MEDIA ATTACHMENTS (UPLOAD MODAL) -->
  <div id="modal-upload" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div class="card-3d w-full max-w-xl p-6 shadow-2xl space-y-4 my-8 bg-white">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b-2 border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-duoGreen/20 text-duoGreenDark flex items-center justify-center">
            <i data-lucide="file-up" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-black text-lg text-slate-800">Thêm Sách PDF & Đính Kèm Media</h3>
            <p class="text-[11px] font-bold text-slate-500">Render 100% trang PDF + Đính kèm hàng loạt bài nghe Audio / Video</p>
          </div>
        </div>
        <button id="btn-close-upload-modal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Upload Form Content -->
      <div class="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
        
        <!-- Combined Multi-File Dropzone (PDF + MP3s) -->
        <div 
          id="dropzone" 
          class="border-4 border-dashed border-duoBlue/40 bg-duoBlue/5 hover:bg-duoBlue/10 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 group"
        >
          <div class="w-12 h-12 rounded-2xl bg-duoBlue/20 text-duoBlueDark flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <i data-lucide="file-text" class="w-6 h-6"></i>
          </div>
          <p class="font-black text-xs sm:text-sm text-slate-800">Kéo & Thả file PDF vào đây</p>
          <p class="text-[11px] text-slate-500 font-bold">Mẹo: Kéo thả cùng lúc cả file PDF và các file Audio (.mp3) để tự động nhận diện!</p>
          <input type="file" id="file-pdf-input" accept="application/pdf" class="hidden" />
        </div>

        <!-- Selected File Status Badge -->
        <div id="selected-file-info" class="hidden bg-emerald-50 border-2 border-duoGreen p-2.5 rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-2 truncate">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-duoGreen flex-shrink-0"></i>
            <span id="selected-file-name" class="font-black text-xs text-slate-800 truncate">tailieu.pdf</span>
          </div>
          <span id="selected-file-size" class="text-[11px] font-bold text-slate-500 flex-shrink-0">2.4 MB</span>
        </div>

        <!-- Book Title Input -->
        <div>
          <label class="block font-black text-[11px] text-slate-700 uppercase tracking-wider mb-1">Tên Sách / Giáo Trình *</label>
          <input 
            type="text" 
            id="input-book-title" 
            placeholder="Ví dụ: Navigate B1+ Coursebook / Oxford English" 
            class="w-full px-3.5 py-2 bg-[#F0F0F0] border-2 border-b-4 border-[#E5E5E5] rounded-xl font-bold text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-duoBlue focus:bg-white transition"
          />
        </div>

        <!-- 3D Book Theme Color Selection -->
        <div>
          <label class="block font-black text-[11px] text-slate-700 uppercase tracking-wider mb-1">Màu Bìa 3D Chủ Đạo</label>
          <select id="select-book-color" class="w-full px-3.5 py-2 bg-[#F0F0F0] border-2 border-b-4 border-[#E5E5E5] rounded-xl font-bold text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-duoBlue focus:bg-white">
            <option value="emerald">🟢 Xanh Lá Học Tập (Emerald)</option>
            <option value="sky">🔵 Xanh Dương Năng Động (Sky)</option>
            <option value="purple">🟣 Tím Tri Thức (Purple)</option>
            <option value="amber">🟡 Vàng Tươi Sáng (Amber)</option>
            <option value="red">🔴 Đỏ Nổi Bật (Red)</option>
          </select>
        </div>

        <!-- SECTION: ATTACH AUDIO TRACKS -->
        <div class="p-3.5 bg-purple-50/70 border-2 border-purple-200 rounded-2xl space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <i data-lucide="headphones" class="w-4 h-4 text-duoPurpleDark"></i>
              <label class="font-black text-xs text-duoPurpleDark">Bài Nghe Audio (<span id="upload-tracks-count">0</span> bài)</label>
            </div>
            
            <div class="flex items-center gap-1.5">
              <label class="btn-3d btn-purple text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                <i data-lucide="folder-plus" class="w-3.5 h-3.5"></i> ⚡ Chọn Hàng Loạt MP3
                <input type="file" id="input-modal-batch-audio" multiple accept="audio/*" class="hidden" />
              </label>
            </div>
          </div>

          <div id="upload-audio-tracks-list" class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <!-- Dynamic Audio Track Rows -->
          </div>
          <p class="text-[10px] text-slate-500 font-bold italic">Bạn có thể chọn cùng lúc 10-50 file MP3 từ máy tính, hệ thống sẽ tự động phân loại tên bài.</p>
        </div>

        <!-- SECTION: ATTACH VIDEO LINK -->
        <div class="p-3.5 bg-rose-50/60 border-2 border-rose-200 rounded-2xl space-y-2">
          <div class="flex items-center gap-2">
            <i data-lucide="video" class="w-4 h-4 text-duoRed"></i>
            <label class="font-black text-xs text-duoRedDark">Đính Kèm Link Video Giảng Dạy (YouTube / MP4)</label>
          </div>
          <input 
            type="text" 
            id="input-book-video" 
            placeholder="Dán link YouTube (VD: https://www.youtube.com/watch?v=...) hoặc link MP4" 
            class="w-full px-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-duoRed"
          />
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-3 border-t-2 border-slate-100">
        <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
          <i data-lucide="hard-drive" class="w-4 h-4 text-emerald-500"></i>
          <span>Lưu trữ cục bộ & Google Drive</span>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-cancel-upload" class="btn-3d btn-white font-extrabold px-4 py-2 rounded-xl text-xs">Hủy</button>
          <button id="btn-submit-book" class="btn-3d btn-green font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Lưu & Mở Sách 3D</span>
          </button>
        </div>
      </div>

    </div>
  </div>
  `;
}

export function openUploadModal(): void {
  const modal = document.getElementById('modal-upload');
  modal?.classList.remove('hidden');
  resetUploadForm();
}

export function closeUploadModal(): void {
  const modal = document.getElementById('modal-upload');
  modal?.classList.add('hidden');
}

function resetUploadForm(): void {
  selectedPdfFile = null;
  uploadedAudioTracks = [];
  const fileInput = document.getElementById('file-pdf-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
  const titleInput = document.getElementById('input-book-title') as HTMLInputElement;
  if (titleInput) titleInput.value = '';
  const videoInput = document.getElementById('input-book-video') as HTMLInputElement;
  if (videoInput) videoInput.value = '';
  const info = document.getElementById('selected-file-info');
  info?.classList.add('hidden');
  updateUploadedTracksList();
}

function updateUploadedTracksList(): void {
  const list = document.getElementById('upload-audio-tracks-list');
  const count = document.getElementById('upload-tracks-count');
  if (count) count.innerText = String(uploadedAudioTracks.length);
  if (!list) return;

  if (uploadedAudioTracks.length === 0) {
    list.innerHTML = `<div class="text-center py-3 text-xs text-slate-400 font-bold">Chưa có bài nghe audio nào được đính kèm.</div>`;
    return;
  }

  list.innerHTML = uploadedAudioTracks
    .map(
      (t, idx) => `
    <div class="flex items-center justify-between p-2 bg-white rounded-xl border border-purple-200 text-xs font-bold">
      <div class="flex items-center gap-2 truncate">
        <i data-lucide="music" class="w-3.5 h-3.5 text-purple-600"></i>
        <span class="truncate text-slate-800">${t.name}</span>
      </div>
      <button onclick="window.removeUploadAudioTrack(${idx})" class="p-1 text-slate-400 hover:text-red-500 rounded">
        <i data-lucide="trash" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `
    )
    .join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function setupUploadModalListeners(onBookCreated: (book: Book) => void): void {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-pdf-input') as HTMLInputElement;
  const batchAudioInput = document.getElementById('input-modal-batch-audio') as HTMLInputElement;

  dropzone?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedPdf(e.target.files[0]);
    }
  });

  // Drag and Drop
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-duoGreen', 'bg-duoGreen/10');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-duoGreen', 'bg-duoGreen/10');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-duoGreen', 'bg-duoGreen/10');
    if (e.dataTransfer && e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const pdf = files.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      const audios = files.filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i));

      if (pdf) {
        handleSelectedPdf(pdf);
      }
      if (audios.length > 0) {
        handleBatchAudios(audios);
      }
    }
  });

  batchAudioInput?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      handleBatchAudios(Array.from(e.target.files));
    }
  });

  (window as any).removeUploadAudioTrack = (idx: number) => {
    uploadedAudioTracks.splice(idx, 1);
    updateUploadedTracksList();
  };

  document.getElementById('btn-close-upload-modal')?.addEventListener('click', closeUploadModal);
  document.getElementById('btn-cancel-upload')?.addEventListener('click', closeUploadModal);

  document.getElementById('btn-submit-book')?.addEventListener('click', async () => {
    if (!selectedPdfFile) {
      showToast('⚠️ Vui lòng chọn file PDF trước!');
      return;
    }

    const titleInput = document.getElementById('input-book-title') as HTMLInputElement;
    const colorSelect = document.getElementById('select-book-color') as HTMLSelectElement;
    const videoInput = document.getElementById('input-book-video') as HTMLInputElement;

    const title = titleInput?.value.trim() || selectedPdfFile.name.replace(/\.[^/.]+$/, '');
    const category = 'general';
    const color = colorSelect?.value || 'emerald';
    const videoUrl = videoInput?.value.trim() || '';

    closeUploadModal();
    showLoader(true, 'Đang phân tích và render trang sách PDF...');

    try {
      const pages = await extractPagesFromPdfFile(selectedPdfFile);
      const newBook: Book = {
        id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title,
        category,
        color,
        totalPages: pages.length,
        coverImage: pages[0],
        pages,
        audioTracks: uploadedAudioTracks,
        videoUrl,
        createdAt: new Date().toISOString()
      };

      await saveBookToDB(newBook);
      showLoader(false);
      showToast(`🎉 Đã tải lên và render thành công ${pages.length} trang sách!`);
      onBookCreated(newBook);
    } catch (e: any) {
      showLoader(false);
      showToast(e.message || '⚠️ Lỗi render file PDF');
    }
  });
}

function handleSelectedPdf(file: File): void {
  selectedPdfFile = file;
  const info = document.getElementById('selected-file-info');
  const name = document.getElementById('selected-file-name');
  const size = document.getElementById('selected-file-size');
  const titleInput = document.getElementById('input-book-title') as HTMLInputElement;

  if (info && name && size) {
    name.innerText = file.name;
    size.innerText = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    info.classList.remove('hidden');
  }

  if (titleInput && !titleInput.value) {
    titleInput.value = file.name.replace(/\.[^/.]+$/, '');
  }
}

function handleBatchAudios(files: File[]): void {
  for (const file of files) {
    const url = URL.createObjectURL(file);
    uploadedAudioTracks.push({
      id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url,
      size: file.size,
      fileType: file.type
    });
  }
  updateUploadedTracksList();
  showToast(`Đã thêm ${files.length} bài nghe Audio`);
}
