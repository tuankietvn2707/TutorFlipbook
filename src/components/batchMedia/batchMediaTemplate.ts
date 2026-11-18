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
        
        <div class="flex gap-2 mt-2">
          <label class="btn-3d btn-purple px-4 py-2 rounded-xl text-white font-black text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md">
            <i data-lucide="file-audio" class="w-4 h-4"></i>
            Chọn nhiều File
            <input type="file" id="batch-media-input" multiple accept="audio/*,.mp3,.wav,.wave,.m4a,.aac,.ogg,.flac" class="hidden" />
          </label>
          <label class="btn-3d btn-white border-2 border-purple-200 px-4 py-2 rounded-xl text-purple-700 font-black text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md">
            <i data-lucide="folder-plus" class="w-4 h-4"></i>
            Chọn cả Thư mục
            <input type="file" id="batch-media-folder-input" webkitdirectory directory multiple class="hidden" />
          </label>
        </div>
      </div>

      <!-- Target Selection -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
        <div>
          <label class="block font-black text-[11px] text-slate-700 uppercase tracking-wider mb-1">Gán vào Sách / Bài học:</label>
          <select id="batch-target-book-select" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 focus:outline-none focus:border-duoPurple"></select>
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
