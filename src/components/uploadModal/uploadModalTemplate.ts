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
                <i data-lucide="folder-plus" class="w-3.5 h-3.5"></i> ⚡ Chọn Audio (WAV / MP3)
                <input type="file" id="input-modal-batch-audio" multiple accept="audio/*,.mp3,.wav,.wave,.m4a,.aac,.ogg,.flac" class="hidden" />
              </label>
            </div>
          </div>

          <div id="upload-audio-tracks-list" class="space-y-2 max-h-48 overflow-y-auto pr-1"></div>
          <p class="text-[10px] text-slate-500 font-bold italic">Hỗ trợ đầy đủ file .wav, .mp3, .m4a... Bạn có thể chọn cùng lúc 10-50 file từ máy tính.</p>
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
