import { AudioTrack, Book } from '../types';
import { appState } from '../state/appState';
import { naturalSortAudioTracks } from '../utils/sorting';
import { showToast } from '../utils/toast';
import { refreshLucideIcons } from '../utils/icons';
import { saveBookToDB } from '../services/dbService';
import {
  instantiateAudioPlayer,
  configureAudioSource,
  playAudioPipeline,
  cleanupAudioPipeline,
  isWavFormat,
  fileToWavBlob
} from '../services/audioService';
import {
  readFileAsAudioDataURL,
  detectAudioFormatLabel,
  isAudioFile
} from '../utils/audioHelper';

let audioElement: HTMLAudioElement | null = null;
let currentTrackIndex = 0;
let isLoopSingle = false;
let isMuted = false;
let previousVolume = 1;
let showRemainingTime = false;
let isPlaylistDrawerOpen = false;
let currentSearchQuery = '';

export function renderMediaDockHtml(): string {
  return `
  <!-- APPLE-STYLE AUDIO STUDIO DOCK -->
  <div 
    id="media-player-dock" 
    class="hidden fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[95%] sm:max-w-4xl z-50 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-[26px] p-3 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-white select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
  >
    <!-- Top Bar: Apple Header, Book Info & Top Actions -->
    <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-2.5">
      
      <!-- Left: Apple Music Icon, Title, & Badges -->
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/40 text-purple-300 border border-white/15 flex items-center justify-center shrink-0 shadow-xs">
          <i data-lucide="music-2" class="w-4 h-4 text-purple-300"></i>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-bold text-xs sm:text-sm text-white tracking-tight truncate">AUDIO STUDIO</h4>
            <span id="media-track-count-badge" class="text-[10px] font-semibold bg-white/10 text-purple-200 px-2 py-0.5 rounded-full border border-white/10">
              0 bài nghe
            </span>
            <span id="media-track-format-badge" class="hidden text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              WAV
            </span>
          </div>
          <p id="media-current-book-label" class="text-[11px] text-white/50 truncate font-medium">Chưa chọn sách</p>
        </div>
      </div>

      <!-- Right: Apple Action Pill Buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Playlist Drawer Toggle Button -->
        <button 
          type="button"
          id="btn-toggle-playlist-drawer" 
          class="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/10 shadow-xs"
          title="Mở danh sách tất cả bài nghe kèm tìm kiếm nhanh"
        >
          <i data-lucide="list-music" class="w-3.5 h-3.5 text-purple-300"></i>
          <span class="hidden sm:inline">Danh sách</span>
        </button>

        <!-- Natural Sort Button -->
        <button 
          type="button"
          id="btn-sort-audio-tracks" 
          class="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer border border-white/10" 
          title="Sắp xếp tự nhiên theo thứ tự số (Track 1, 2... 10)"
        >
          <i data-lucide="arrow-down-1-0" class="w-3.5 h-3.5 text-purple-300"></i>
          <span class="hidden md:inline">Xếp 1-9</span>
        </button>

        <!-- Direct Add Audio Files (.WAV, .MP3, etc.) -->
        <label 
          class="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 transition" 
          title="Thêm file bài nghe .WAV, .MP3 vào sách này"
        >
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>+ Audio</span>
          <input type="file" id="input-add-audio-files" multiple accept="audio/*,audio/wav,audio/x-wav,audio/wave,.wav,.wave,.mp3,.m4a,.aac,.ogg,.flac" class="hidden" />
        </label>

        <!-- Batch Media Modal Trigger -->
        <button 
          type="button"
          id="btn-open-batch-media-from-dock" 
          class="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition active:scale-95 hidden lg:flex items-center justify-center cursor-pointer border border-white/10"
          title="Quản lý media hàng loạt"
        >
          <i data-lucide="layers" class="w-3.5 h-3.5 text-sky-300"></i>
        </button>

        <div class="h-4 w-px bg-white/15 mx-0.5"></div>

        <!-- Minimize Button -->
        <button 
          type="button"
          id="btn-minimize-media-dock" 
          class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition flex items-center justify-center cursor-pointer" 
          title="Thu nhỏ thành Apple Dynamic Island Remote"
        >
          <i data-lucide="minus" class="w-3.5 h-3.5"></i>
        </button>

        <!-- Close Button -->
        <button 
          type="button"
          id="btn-close-media-dock" 
          class="w-7 h-7 rounded-full bg-white/10 hover:bg-rose-500/30 text-white/70 hover:text-rose-300 transition flex items-center justify-center cursor-pointer" 
          title="Đóng bảng điều khiển âm thanh"
        >
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>

    </div>

    <!-- Main Player Body -->
    <div id="media-dock-player-content" class="space-y-3">
      
      <!-- Apple 3-Column Layout: Left (Now Playing) | Center (Controls & Timeline) | Right (Volume & Jump) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        <!-- Column 1: Now Playing Artwork & Meta (md:col-span-4) -->
        <div class="md:col-span-4 flex items-center gap-3 min-w-0 bg-white/5 p-2 rounded-2xl border border-white/5">
          
          <!-- Apple Artwork Squircle with Live Equalizer Animation -->
          <div 
            id="apple-artwork-container"
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-700/80 via-indigo-700/80 to-slate-900 border border-white/15 shadow-md flex items-center justify-center relative overflow-hidden shrink-0"
          >
            <!-- 4-bar Apple Live Equalizer Waves -->
            <div id="apple-equalizer-bars" class="flex items-end gap-0.5 h-5">
              <span class="eq-bar w-1 bg-white/90 rounded-full h-1.5 transition-all"></span>
              <span class="eq-bar w-1 bg-white/90 rounded-full h-3 transition-all"></span>
              <span class="eq-bar w-1 bg-white/90 rounded-full h-2 transition-all"></span>
              <span class="eq-bar w-1 bg-white/90 rounded-full h-3.5 transition-all"></span>
            </div>
          </div>

          <!-- Track Name & Unit/Folder Details -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span id="player-track-format-tag" class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                WAV
              </span>
              <h5 id="player-track-name" class="font-bold text-xs sm:text-sm text-white truncate tracking-tight">
                Chọn bài nghe
              </h5>
            </div>
            <p id="player-track-folder" class="text-[11px] text-white/50 truncate font-medium mt-0.5">
              📁 Thư mục chung
            </p>
          </div>

          <!-- Quick Delete Track Button -->
          <button 
            type="button"
            id="btn-track-delete" 
            class="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95 shrink-0 cursor-pointer" 
            title="Xóa bài nghe này khỏi sách"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Column 2: Centered Transport Controls & Scrubber (md:col-span-5) -->
        <div class="md:col-span-5 flex flex-col items-center gap-1.5">
          
          <!-- Transport Buttons Row -->
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Loop Track Button -->
            <button 
              type="button"
              id="btn-audio-loop" 
              class="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center justify-center shrink-0" 
              title="Lặp lại bài này [L]"
            >
              <i data-lucide="repeat" id="icon-audio-loop" class="w-4 h-4"></i>
            </button>

            <!-- Rewind 5s -->
            <button 
              type="button"
              id="btn-audio-rewind" 
              class="w-8 h-8 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0" 
              title="Tua lùi 5 giây [←]"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>

            <!-- Prev Track -->
            <button 
              type="button"
              id="btn-track-prev" 
              class="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95 shrink-0 cursor-pointer flex items-center justify-center" 
              title="Bài trước [Shift + ←]"
            >
              <i data-lucide="skip-back" class="w-4 h-4"></i>
            </button>

            <!-- Iconic Apple Circular Play / Pause Button -->
            <button 
              type="button"
              id="btn-audio-play" 
              class="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Phát / Tạm dừng [Space]"
            >
              <i data-lucide="play" id="icon-audio-play" class="w-5 h-5 fill-current ml-0.5"></i>
            </button>

            <!-- Next Track -->
            <button 
              type="button"
              id="btn-track-next" 
              class="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95 shrink-0 cursor-pointer flex items-center justify-center" 
              title="Bài kế tiếp [Shift + →]"
            >
              <i data-lucide="skip-forward" class="w-4 h-4"></i>
            </button>

            <!-- Forward 5s -->
            <button 
              type="button"
              id="btn-audio-forward" 
              class="w-8 h-8 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0" 
              title="Tua tới 5 giây [→]"
            >
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>

            <!-- Apple Playback Speed Cycle Pill -->
            <button 
              type="button"
              id="btn-speed-cycle" 
              class="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 text-[11px] font-bold transition active:scale-95 cursor-pointer shrink-0 border border-white/10"
              title="Chạm để đổi tốc độ phát (0.75x, 1.0x, 1.25x, 1.5x, 2.0x)"
            >
              1.0×
            </button>
          </div>

          <!-- Apple Scrubber Timeline & Times -->
          <div class="w-full flex items-center gap-2">
            <span id="audio-time-current" class="text-[11px] font-mono font-medium text-white/60 shrink-0 w-10 text-right select-none tabular-nums">
              00:00
            </span>
            
            <div class="flex-1 relative flex items-center min-w-0 group py-1">
              <input 
                type="range" 
                id="audio-progress-bar" 
                value="0" 
                min="0" 
                max="100" 
                step="0.1" 
                class="apple-slider w-full h-1.5 group-hover:h-2 bg-white/15 rounded-full appearance-none cursor-pointer accent-white transition-all focus:outline-none"
              />
            </div>

            <button 
              type="button"
              id="btn-toggle-time-mode" 
              class="text-[11px] font-mono font-medium text-white/60 hover:text-white shrink-0 w-11 text-left select-none tabular-nums cursor-pointer"
              title="Nhấn để đổi giữa Thời gian tổng và Thời gian còn lại"
            >
              <span id="audio-time-total">00:00</span>
            </button>
          </div>

        </div>

        <!-- Column 3: Volume & Quick Track Select (md:col-span-3) -->
        <div class="md:col-span-3 flex items-center justify-end gap-2.5">
          
          <!-- Volume Control -->
          <div class="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-2xl border border-white/5">
            <button 
              type="button" 
              id="btn-volume-toggle" 
              class="text-white/60 hover:text-white transition cursor-pointer" 
              title="Bật/Tắt âm lượng [M]"
            >
              <i data-lucide="volume-2" id="icon-volume-speaker" class="w-4 h-4"></i>
            </button>
            <input 
              type="range" 
              id="audio-volume-slider" 
              min="0" 
              max="1" 
              step="0.05" 
              value="1" 
              class="apple-slider w-16 sm:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
              title="Thanh chỉnh âm lượng"
            />
          </div>

          <!-- Quick Dropdown Selector for direct jumping -->
          <div class="relative w-28 sm:w-36">
            <select 
              id="media-track-select" 
              class="w-full px-2 py-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl font-medium text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer truncate"
              title="Chọn bài nghe nhanh"
            >
              <option value="">-- Bài nghe --</option>
            </select>
          </div>

        </div>

      </div>

    </div>

    <!-- APPLE-STYLE TRACK PLAYLIST DRAWER / QUICK SHEET -->
    <div 
      id="apple-audio-playlist-drawer" 
      class="hidden mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="relative flex-1 max-w-sm">
          <i data-lucide="search" class="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2"></i>
          <input 
            type="text" 
            id="input-search-playlist-tracks" 
            placeholder="Tìm nhanh bài nghe theo tên hoặc số (VD: 15, Unit 1)..." 
            class="w-full pl-8 pr-3 py-1.5 bg-white/10 focus:bg-white/15 border border-white/10 focus:border-purple-400 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none transition"
          />
        </div>
        <div class="flex items-center gap-1.5">
          <span id="playlist-drawer-count" class="text-[11px] text-white/50 font-medium">0 bài</span>
          <button 
            type="button" 
            id="btn-close-playlist-drawer" 
            class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Đóng danh sách"
          >
            <i data-lucide="chevron-up" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Scrollable Playlist Container -->
      <div 
        id="playlist-drawer-tracks-list" 
        class="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-white/20"
      >
        <!-- Populated via JavaScript with Apple Music-style track items -->
      </div>
    </div>

    <!-- Empty State (Shown when current book has NO audio tracks) -->
    <div id="media-dock-empty-state" class="hidden p-5 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 space-y-2.5">
      <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-300 flex items-center justify-center mx-auto border border-white/10">
        <i data-lucide="music" class="w-5 h-5"></i>
      </div>
      <div>
        <p class="font-bold text-xs sm:text-sm text-white">Sách này chưa có bài nghe nào</p>
        <p class="text-[11px] text-white/50 max-w-md mx-auto mt-0.5">
          Hỗ trợ đầy đủ định dạng chuẩn .WAV, .MP3, .M4A... để học sinh và giáo viên luyện nghe ngay trong bài học.
        </p>
      </div>
      <label class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95">
        <i data-lucide="upload" class="w-4 h-4"></i>
        <span>Chọn File Audio (.WAV / .MP3) Từ Máy Tính</span>
        <input type="file" id="input-add-audio-files-empty" multiple accept="audio/*,audio/wav,audio/x-wav,audio/wave,.wav,.wave,.mp3,.m4a,.aac,.ogg,.flac" class="hidden" />
      </label>
    </div>

  </div>

  <!-- APPLE DYNAMIC ISLAND MINI PILL (DISCREET SLEEK REMOTE WHEN MINIMIZED) -->
  <div 
    id="media-mini-pill" 
    class="hidden fixed bottom-14 right-4 sm:right-6 z-50 bg-black/90 backdrop-blur-2xl text-white border border-white/20 rounded-full px-4 py-2 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 select-none animate-in fade-in"
  >
    <div class="flex items-center gap-2 cursor-pointer" id="mini-pill-expand-trigger" title="Nhấn để mở rộng toàn bộ Audio Studio">
      <!-- Mini animated equalizer bars -->
      <div id="mini-pill-eq" class="flex items-end gap-0.5 h-3">
        <span class="w-0.5 bg-purple-400 rounded-full h-1"></span>
        <span class="w-0.5 bg-purple-400 rounded-full h-2.5"></span>
        <span class="w-0.5 bg-purple-400 rounded-full h-1.5"></span>
      </div>
      <span id="mini-pill-track-name" class="text-xs font-semibold max-w-[120px] sm:max-w-[180px] truncate text-white">Track 1</span>
      <span id="mini-pill-time" class="text-[10px] font-mono text-purple-300/80">00:00</span>
    </div>

    <div class="flex items-center gap-1 border-l border-white/20 pl-2">
      <button type="button" id="btn-mini-rewind" class="p-1 hover:text-purple-300 text-white/70 transition cursor-pointer" title="Tua -5s">
        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-play" class="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center shadow transition active:scale-95 cursor-pointer" title="Phát/Dừng">
        <i data-lucide="play" id="mini-pill-play-icon" class="w-3.5 h-3.5 fill-current ml-0.5"></i>
      </button>
      <button type="button" id="btn-mini-forward" class="p-1 hover:text-purple-300 text-white/70 transition cursor-pointer" title="Tua +5s">
        <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-expand" class="p-1 hover:text-purple-300 text-white/70 transition cursor-pointer" title="Mở rộng Hộp điều khiển">
        <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-close" class="p-1 hover:text-rose-400 text-white/50 transition cursor-pointer" title="Đóng">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  </div>

  <!-- Global Audio Element -->
  <audio id="global-audio-player" preload="auto"></audio>
  `;
}

export function initMediaDock(book: Book | null): void {
  audioElement = document.getElementById('global-audio-player') as HTMLAudioElement;
  const select = document.getElementById('media-track-select') as HTMLSelectElement;
  const trackCountBadge = document.getElementById('media-track-count-badge');
  const bookLabel = document.getElementById('media-current-book-label');
  const emptyState = document.getElementById('media-dock-empty-state');
  const playerContent = document.getElementById('media-dock-player-content');
  const miniTrackName = document.getElementById('mini-pill-track-name');

  if (bookLabel) {
    bookLabel.innerText = book ? `Sách: ${book.title}` : 'Chưa chọn sách';
  }

  if (!select) return;
  select.innerHTML = '';

  const tracks = book?.audioTracks || [];
  const trackCount = tracks.length;

  if (trackCountBadge) {
    trackCountBadge.innerText = `${trackCount} bài nghe`;
  }

  if (trackCount === 0) {
    select.innerHTML = `<option value="">-- Chưa có file bài nghe nào --</option>`;
    if (emptyState) emptyState.classList.remove('hidden');
    if (playerContent) playerContent.classList.add('hidden');
    if (miniTrackName) miniTrackName.innerText = 'Không có audio';
    renderPlaylistDrawer([]);
    return;
  }

  // Has audio tracks
  if (emptyState) emptyState.classList.add('hidden');
  if (playerContent) playerContent.classList.remove('hidden');

  const sortedTracks = naturalSortAudioTracks(tracks);
  
  // Group tracks by folder for the dropdown
  const folders: Record<string, typeof sortedTracks> = {};
  sortedTracks.forEach(t => {
    const f = t.folder || 'Khác';
    if (!folders[f]) folders[f] = [];
    folders[f].push(t);
  });

  // Render grouped options in select
  Object.keys(folders).sort().forEach(folderName => {
    const group = document.createElement('optgroup');
    group.label = folderName === 'Khác' ? 'Thư mục chung' : `📁 ${folderName}`;
    
    folders[folderName].forEach(track => {
      const absIdx = sortedTracks.findIndex(t => t.id === track.id);
      const opt = document.createElement('option');
      opt.value = track.id;
      opt.innerText = `${absIdx + 1}. ${track.name}`;
      opt.dataset.index = String(absIdx);
      group.appendChild(opt);
    });
    
    select.appendChild(group);
  });

  renderPlaylistDrawer(sortedTracks);

  currentTrackIndex = 0;
  loadTrack(sortedTracks[0]);
  refreshLucideIcons();
}

/**
 * Renders the Apple-style playlist drawer with search and folder grouping
 */
function renderPlaylistDrawer(tracks: AudioTrack[]): void {
  const container = document.getElementById('playlist-drawer-tracks-list');
  const countSpan = document.getElementById('playlist-drawer-count');
  if (!container) return;

  if (countSpan) {
    countSpan.innerText = `${tracks.length} bài nghe`;
  }

  if (tracks.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-white/40">Không tìm thấy bài nghe nào.</div>`;
    return;
  }

  const currentTrack = appState.get('currentAudioTrack');
  const query = currentSearchQuery.toLowerCase().trim();

  const filtered = query
    ? tracks.filter(t => t.name.toLowerCase().includes(query) || (t.folder && t.folder.toLowerCase().includes(query)))
    : tracks;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-white/40">Không có bài nghe khớp với "${currentSearchQuery}".</div>`;
    return;
  }

  // Render track rows with Apple aesthetics
  container.innerHTML = filtered.map((t) => {
    const absIdx = tracks.findIndex(item => item.id === t.id);
    const isPlayingThis = currentTrack && currentTrack.id === t.id;
    const format = detectAudioFormatLabel(t.name, t.url);
    const formatColor = format === 'WAV' 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
      : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

    return `
      <div 
        class="apple-track-row flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
          isPlayingThis 
            ? 'bg-purple-600/30 text-white border border-purple-400/40' 
            : 'hover:bg-white/10 text-white/80 border border-transparent'
        }"
        data-track-id="${t.id}"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="font-mono text-[10px] ${isPlayingThis ? 'text-purple-300 font-bold' : 'text-white/40'} w-6 shrink-0 text-right">
            ${isPlayingThis ? '▶' : `${absIdx + 1}`}
          </span>
          <div class="min-w-0">
            <p class="font-semibold truncate text-white">${t.name}</p>
            <p class="text-[10px] text-white/40 truncate">${t.folder ? `📁 ${t.folder}` : 'Thư mục chung'}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${formatColor}">
            ${format}
          </span>
          <button 
            type="button" 
            class="btn-delete-track-row p-1 text-white/30 hover:text-rose-400 rounded transition" 
            data-delete-id="${t.id}" 
            title="Xóa bài nghe này"
          >
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners to rows
  container.querySelectorAll('.apple-track-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Don't trigger if clicked on delete button
      if ((e.target as HTMLElement).closest('.btn-delete-track-row')) return;
      const trackId = row.getAttribute('data-track-id');
      if (!trackId) return;
      const book = appState.get('currentBook');
      if (!book || !book.audioTracks) return;
      const target = book.audioTracks.find(t => t.id === trackId);
      if (target) {
        loadTrack(target);
        if (audioElement && audioElement.paused) {
          togglePlayAudio();
        }
      }
    });
  });

  // Attach delete listeners
  container.querySelectorAll('.btn-delete-track-row').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const trackId = btn.getAttribute('data-delete-id');
      if (!trackId) return;
      const book = appState.get('currentBook');
      if (!book || !book.audioTracks) return;
      if (!confirm('Bạn có chắc chắn muốn xóa bài nghe này?')) return;
      book.audioTracks = book.audioTracks.filter(t => t.id !== trackId);
      await saveBookToDB(book);
      initMediaDock(book);
      showToast('🗑️ Đã xóa bài nghe');
    });
  });

  refreshLucideIcons();
}

export function loadTrack(track: AudioTrack): void {
  if (!audioElement) {
    audioElement = document.getElementById('global-audio-player') as HTMLAudioElement;
    if (!audioElement) {
      audioElement = instantiateAudioPlayer();
    }
  }
  if (!audioElement || !track) return;

  // Configure audio pipeline supporting 'audio/wav' MIME type & handling Blob objects
  const isWav = isWavFormat(track.name, track.blob) || track.fileType === 'WAV' || track.url?.startsWith('data:audio/wav');
  const mimeType = isWav ? 'audio/wav' : undefined;
  const sourceToConfigure: string | Blob = track.blob || track.url;
  configureAudioSource(audioElement, sourceToConfigure, mimeType);

  const select = document.getElementById('media-track-select') as HTMLSelectElement;
  const miniTrackName = document.getElementById('mini-pill-track-name');
  const playerTrackName = document.getElementById('player-track-name');
  const playerTrackFolder = document.getElementById('player-track-folder');
  const playerTrackTag = document.getElementById('player-track-format-tag');
  const topFormatBadge = document.getElementById('media-track-format-badge');
  
  const format = detectAudioFormatLabel(track.name, track.url);

  if (select && track.id) {
    select.value = track.id;
  }
  if (miniTrackName) {
    miniTrackName.innerText = track.name;
  }
  if (playerTrackName) {
    playerTrackName.innerText = track.name;
  }
  if (playerTrackFolder) {
    playerTrackFolder.innerText = track.folder ? `📁 ${track.folder}` : '📁 Thư mục chung';
  }
  if (playerTrackTag) {
    playerTrackTag.innerText = format;
    playerTrackTag.className = `text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
      format === 'WAV'
        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
        : 'bg-purple-500/30 text-purple-200 border-purple-400/40'
    }`;
  }
  if (topFormatBadge) {
    topFormatBadge.innerText = format;
    topFormatBadge.classList.remove('hidden');
  }

  appState.set('currentAudioTrack', track);

  // Update playlist drawer highlights
  const book = appState.get('currentBook');
  if (book && book.audioTracks) {
    renderPlaylistDrawer(naturalSortAudioTracks(book.audioTracks));
  }
}

export function togglePlayAudio(): void {
  if (!audioElement) {
    audioElement = document.getElementById('global-audio-player') as HTMLAudioElement;
    if (!audioElement) {
      audioElement = instantiateAudioPlayer();
    }
  }
  if (!audioElement) return;

  if (!audioElement.src || audioElement.src === '' || audioElement.src.endsWith('undefined')) {
    const book = appState.get('currentBook');
    if (book && book.audioTracks && book.audioTracks.length > 0) {
      loadTrack(book.audioTracks[0]);
    } else {
      showToast('⚠️ Sách chưa có bài nghe nào. Hãy nhấn "+ Audio"');
      return;
    }
  }

  if (audioElement.paused) {
    playAudioPipeline(audioElement).then(() => {
      updatePlayButtonUI(true);
      appState.set('isPlayingAudio', true);
    }).catch(e => {
      console.warn('Audio play error:', e);
      showToast('⚠️ Đang tải hoặc giải mã tệp âm thanh...');
    });
  } else {
    audioElement.pause();
    updatePlayButtonUI(false);
    appState.set('isPlayingAudio', false);
  }
}

export function playNextTrack(): void {
  const book = appState.get('currentBook');
  if (!book || !book.audioTracks || book.audioTracks.length === 0) return;
  const sorted = naturalSortAudioTracks(book.audioTracks);
  currentTrackIndex = (currentTrackIndex + 1) % sorted.length;
  loadTrack(sorted[currentTrackIndex]);
  togglePlayAudio();
}

export function playPrevTrack(): void {
  const book = appState.get('currentBook');
  if (!book || !book.audioTracks || book.audioTracks.length === 0) return;
  const sorted = naturalSortAudioTracks(book.audioTracks);
  currentTrackIndex = (currentTrackIndex - 1 + sorted.length) % sorted.length;
  loadTrack(sorted[currentTrackIndex]);
  togglePlayAudio();
}

export function seekAudioRelative(seconds: number): void {
  if (!audioElement) return;
  const dur = audioElement.duration || 0;
  audioElement.currentTime = Math.max(0, Math.min(dur, audioElement.currentTime + seconds));
}

export function seekAudio(value: number): void {
  if (!audioElement || !audioElement.duration) return;
  audioElement.currentTime = (value / 100) * audioElement.duration;
}

export function setPlaybackRate(rate: number): void {
  if (!audioElement) return;
  audioElement.playbackRate = rate;
  const speedBtn = document.getElementById('btn-speed-cycle');
  if (speedBtn) {
    speedBtn.innerText = `${rate}×`;
  }
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];
let currentSpeedIndex = 1; // default 1.0

function cyclePlaybackSpeed(): void {
  currentSpeedIndex = (currentSpeedIndex + 1) % SPEED_OPTIONS.length;
  const speed = SPEED_OPTIONS[currentSpeedIndex];
  setPlaybackRate(speed);
  showToast(`⚡ Tốc độ phát: ${speed}×`);
}

function updatePlayButtonUI(playing: boolean): void {
  const icon = document.getElementById('icon-audio-play');
  const miniIcon = document.getElementById('mini-pill-play-icon');
  const playBtn = document.getElementById('btn-audio-play');
  const eqBars = document.getElementById('apple-equalizer-bars');
  const miniEq = document.getElementById('mini-pill-eq');

  if (icon) {
    icon.setAttribute('data-lucide', playing ? 'pause' : 'play');
  }
  if (playBtn) {
    playBtn.setAttribute('title', playing ? 'Tạm dừng [Space]' : 'Phát bài nghe [Space]');
  }
  if (miniIcon) {
    miniIcon.setAttribute('data-lucide', playing ? 'pause' : 'play');
  }

  // Toggle Equalizer Animation
  if (eqBars) {
    if (playing) {
      eqBars.classList.add('apple-eq-playing');
    } else {
      eqBars.classList.remove('apple-eq-playing');
    }
  }
  if (miniEq) {
    if (playing) {
      miniEq.classList.add('animate-pulse');
    } else {
      miniEq.classList.remove('animate-pulse');
    }
  }

  refreshLucideIcons();
}

export function toggleMediaDockVisibility(): boolean {
  const isOpen = appState.get('isMediaDockOpen');
  const nextState = !isOpen;
  appState.set('isMediaDockOpen', nextState);
  return nextState;
}

export function minimizeMediaDock(): void {
  const dock = document.getElementById('media-player-dock');
  const mini = document.getElementById('media-mini-pill');
  dock?.classList.add('hidden');
  mini?.classList.remove('hidden');
}

export function expandMediaDock(): void {
  const dock = document.getElementById('media-player-dock');
  const mini = document.getElementById('media-mini-pill');
  mini?.classList.add('hidden');
  dock?.classList.remove('hidden');
  appState.set('isMediaDockOpen', true);
}

export function setupMediaDockListeners(callbacks: {
  onOpenBatchMedia?: () => void;
}): void {
  audioElement = document.getElementById('global-audio-player') as HTMLAudioElement;

  if (audioElement) {
    audioElement.ontimeupdate = () => {
      if (!audioElement || !audioElement.duration) return;
      const cur = audioElement.currentTime;
      const dur = audioElement.duration;
      const pct = (cur / dur) * 100;

      const progress = document.getElementById('audio-progress-bar') as HTMLInputElement;
      const timeCur = document.getElementById('audio-time-current');
      const timeTot = document.getElementById('audio-time-total');
      const miniTime = document.getElementById('mini-pill-time');

      if (progress && !progress.matches(':active')) progress.value = String(pct);
      if (timeCur) timeCur.innerText = formatTime(cur);
      
      if (timeTot) {
        if (showRemainingTime) {
          const remaining = Math.max(0, dur - cur);
          timeTot.innerText = `-${formatTime(remaining)}`;
        } else {
          timeTot.innerText = formatTime(dur);
        }
      }

      if (miniTime) miniTime.innerText = formatTime(cur);
    };

    audioElement.onended = () => {
      if (isLoopSingle) {
        audioElement?.play();
      } else {
        const book = appState.get('currentBook');
        if (book && book.audioTracks && book.audioTracks.length > 1) {
          playNextTrack();
        } else {
          updatePlayButtonUI(false);
          appState.set('isPlayingAudio', false);
        }
      }
    };
  }

  // Play / Pause Buttons
  document.getElementById('btn-audio-play')?.addEventListener('click', togglePlayAudio);
  document.getElementById('btn-mini-play')?.addEventListener('click', togglePlayAudio);

  // Rewind / Forward 5s
  document.getElementById('btn-audio-rewind')?.addEventListener('click', () => seekAudioRelative(-5));
  document.getElementById('btn-audio-forward')?.addEventListener('click', () => seekAudioRelative(5));
  document.getElementById('btn-mini-rewind')?.addEventListener('click', () => seekAudioRelative(-5));
  document.getElementById('btn-mini-forward')?.addEventListener('click', () => seekAudioRelative(5));

  // Next / Prev Track
  document.getElementById('btn-track-prev')?.addEventListener('click', playPrevTrack);
  document.getElementById('btn-track-next')?.addEventListener('click', playNextTrack);

  // Speed Cycle Button
  document.getElementById('btn-speed-cycle')?.addEventListener('click', cyclePlaybackSpeed);

  // Remaining vs Total Time toggle
  document.getElementById('btn-toggle-time-mode')?.addEventListener('click', () => {
    showRemainingTime = !showRemainingTime;
    if (audioElement && audioElement.duration) {
      const timeTot = document.getElementById('audio-time-total');
      if (timeTot) {
        if (showRemainingTime) {
          const remaining = Math.max(0, audioElement.duration - audioElement.currentTime);
          timeTot.innerText = `-${formatTime(remaining)}`;
        } else {
          timeTot.innerText = formatTime(audioElement.duration);
        }
      }
    }
  });

  // Volume Control
  const volumeSlider = document.getElementById('audio-volume-slider') as HTMLInputElement;
  const volumeBtn = document.getElementById('btn-volume-toggle');
  const volumeIcon = document.getElementById('icon-volume-speaker');

  const updateVolumeIcon = (vol: number) => {
    if (!volumeIcon) return;
    if (vol === 0) {
      volumeIcon.setAttribute('data-lucide', 'volume-x');
    } else if (vol < 0.5) {
      volumeIcon.setAttribute('data-lucide', 'volume-1');
    } else {
      volumeIcon.setAttribute('data-lucide', 'volume-2');
    }
    refreshLucideIcons();
  };

  volumeSlider?.addEventListener('input', (e: any) => {
    if (!audioElement) return;
    const val = parseFloat(e.target.value);
    audioElement.volume = val;
    isMuted = val === 0;
    updateVolumeIcon(val);
  });

  volumeBtn?.addEventListener('click', () => {
    if (!audioElement) return;
    if (isMuted) {
      audioElement.volume = previousVolume || 1;
      if (volumeSlider) volumeSlider.value = String(audioElement.volume);
      isMuted = false;
      updateVolumeIcon(audioElement.volume);
    } else {
      previousVolume = audioElement.volume;
      audioElement.volume = 0;
      if (volumeSlider) volumeSlider.value = '0';
      isMuted = true;
      updateVolumeIcon(0);
    }
  });

  // Playlist Drawer Toggle
  const playlistDrawer = document.getElementById('apple-audio-playlist-drawer');
  const toggleDrawerBtn = document.getElementById('btn-toggle-playlist-drawer');
  const closeDrawerBtn = document.getElementById('btn-close-playlist-drawer');

  const togglePlaylistDrawer = () => {
    isPlaylistDrawerOpen = !isPlaylistDrawerOpen;
    if (isPlaylistDrawerOpen) {
      playlistDrawer?.classList.remove('hidden');
      toggleDrawerBtn?.classList.add('bg-white/25', 'text-white');
      const book = appState.get('currentBook');
      if (book && book.audioTracks) {
        renderPlaylistDrawer(naturalSortAudioTracks(book.audioTracks));
      }
    } else {
      playlistDrawer?.classList.add('hidden');
      toggleDrawerBtn?.classList.remove('bg-white/25', 'text-white');
    }
  };

  toggleDrawerBtn?.addEventListener('click', togglePlaylistDrawer);
  closeDrawerBtn?.addEventListener('click', togglePlaylistDrawer);

  // Search in Playlist Drawer
  const searchInput = document.getElementById('input-search-playlist-tracks') as HTMLInputElement;
  searchInput?.addEventListener('input', (e: any) => {
    currentSearchQuery = e.target.value;
    const book = appState.get('currentBook');
    if (book && book.audioTracks) {
      renderPlaylistDrawer(naturalSortAudioTracks(book.audioTracks));
    }
  });

  // Delete Track from Left Box
  document.getElementById('btn-track-delete')?.addEventListener('click', async () => {
    const book = appState.get('currentBook');
    const currentTrack = appState.get('currentAudioTrack');
    if (!book || !book.audioTracks || !currentTrack) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa bài nghe "${currentTrack.name}" khỏi sách?`)) return;

    book.audioTracks = book.audioTracks.filter(t => t.id !== currentTrack.id);
    await saveBookToDB(book);
    
    // Update allBooks
    const allBooks = appState.get('allBooks');
    const idx = allBooks.findIndex(b => b.id === book.id);
    if (idx !== -1) {
      allBooks[idx] = { ...book };
      appState.set('allBooks', [...allBooks]);
    }

    initMediaDock(book);
    showToast('🗑️ Đã xóa bài nghe khỏi sách');
  });

  // Loop toggle
  document.getElementById('btn-audio-loop')?.addEventListener('click', () => {
    isLoopSingle = !isLoopSingle;
    const btn = document.getElementById('btn-audio-loop');
    if (btn) {
      if (isLoopSingle) {
        btn.classList.add('text-purple-300', 'bg-white/20');
        showToast('🔁 Đã bật lặp lại bài nghe hiện tại');
      } else {
        btn.classList.remove('text-purple-300', 'bg-white/20');
        showToast('Đã tắt lặp bài nghe');
      }
    }
  });

  // Natural sort button
  document.getElementById('btn-sort-audio-tracks')?.addEventListener('click', async () => {
    const book = appState.get('currentBook');
    if (!book || !book.audioTracks || book.audioTracks.length === 0) {
      showToast('⚠️ Không có bài nghe để sắp xếp');
      return;
    }
    book.audioTracks = naturalSortAudioTracks(book.audioTracks);
    await saveBookToDB(book);
    initMediaDock(book);
    showToast('🔢 Đã sắp xếp lại bài nghe theo thứ tự số tự nhiên (1..10)!');
  });

  // Minimize / Expand / Close
  document.getElementById('btn-minimize-media-dock')?.addEventListener('click', minimizeMediaDock);
  document.getElementById('btn-mini-expand')?.addEventListener('click', expandMediaDock);
  document.getElementById('mini-pill-expand-trigger')?.addEventListener('click', expandMediaDock);
  
  document.getElementById('btn-close-media-dock')?.addEventListener('click', () => {
    appState.set('isMediaDockOpen', false);
    cleanupAudioPipeline(audioElement);
  });
  document.getElementById('btn-mini-close')?.addEventListener('click', () => {
    document.getElementById('media-mini-pill')?.classList.add('hidden');
    appState.set('isMediaDockOpen', false);
    cleanupAudioPipeline(audioElement);
  });

  // Batch Media Openers
  document.getElementById('btn-open-batch-media-from-dock')?.addEventListener('click', () => {
    if (callbacks.onOpenBatchMedia) callbacks.onOpenBatchMedia();
  });

  // Range Seek
  const progressBar = document.getElementById('audio-progress-bar') as HTMLInputElement;
  progressBar?.addEventListener('input', (e: any) => {
    seekAudio(parseFloat(e.target.value));
  });

  // Track Select Dropdown
  const trackSelect = document.getElementById('media-track-select') as HTMLSelectElement;
  trackSelect?.addEventListener('change', (e: any) => {
    const book = appState.get('currentBook');
    if (!book || !book.audioTracks) return;
    const found = book.audioTracks.find(t => t.id === e.target.value);
    if (found) {
      loadTrack(found);
      togglePlayAudio();
    }
  });

  // Direct Audio File Inputs (.WAV, .MP3, etc.)
  const handleAddFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const curBook = appState.get('currentBook');
    if (!curBook) {
      showToast('⚠️ Vui lòng mở một cuốn sách trước khi thêm bài nghe');
      return;
    }

    const folderPrompt = prompt('Tạo thư mục/Unit cho các file audio này? (Ví dụ: Unit 1, Bài 1. Để trống nếu không cần):', '') || '';
    const baseFolder = folderPrompt.trim();

    showToast(`⏳ Đang xử lý ${files.length} tệp âm thanh (WAV/MP3)...`);

    const newTracks: AudioTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!isAudioFile(file)) continue;

      const isWav = isWavFormat(file.name);
      let wavBlob: Blob | undefined;
      if (isWav) {
        try {
          wavBlob = await fileToWavBlob(file);
        } catch {
          // fallback
        }
      }

      const dataUrl = await readFileAsAudioDataURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const format = detectAudioFormatLabel(file.name);
      
      let trackFolder = baseFolder;
      if (!trackFolder && file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          trackFolder = parts[parts.length - 2];
        }
      }

      newTracks.push({
        id: `track-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        url: dataUrl,
        blob: wavBlob,
        folder: trackFolder || undefined,
        fileType: format
      });
    }

    if (newTracks.length === 0) {
      showToast('⚠️ Không có file âm thanh hợp lệ (.wav, .mp3, .m4a)');
      return;
    }

    const existing = curBook.audioTracks || [];
    const merged = naturalSortAudioTracks([...existing, ...newTracks]);
    curBook.audioTracks = merged;

    // Save to DB and update state
    await saveBookToDB(curBook);
    appState.set('currentBook', { ...curBook });
    
    // Update allBooks list
    const allBooks = appState.get('allBooks');
    const idx = allBooks.findIndex(b => b.id === curBook.id);
    if (idx !== -1) {
      allBooks[idx] = { ...curBook };
      appState.set('allBooks', [...allBooks]);
    }

    initMediaDock(curBook);
    showToast(`🎉 Đã thêm thành công ${newTracks.length} bài nghe (.WAV/.MP3) vào sách!`);
  };

  document.getElementById('input-add-audio-files')?.addEventListener('change', (e: any) => {
    handleAddFiles(e.target.files);
    e.target.value = '';
  });

  document.getElementById('input-add-audio-files-empty')?.addEventListener('change', (e: any) => {
    handleAddFiles(e.target.files);
    e.target.value = '';
  });

  // Keyboard Shortcuts for Audio Player: Space, Arrow Left/Right, Shift+Arrows, L, M
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ignore if user is currently typing inside an input or textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      return;
    }

    const isOpen = appState.get('isMediaDockOpen');
    if (!isOpen) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayAudio();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (e.shiftKey) {
        playPrevTrack();
      } else {
        seekAudioRelative(-5);
      }
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (e.shiftKey) {
        playNextTrack();
      } else {
        seekAudioRelative(5);
      }
    } else if (e.key === 'l' || e.key === 'L') {
      const loopBtn = document.getElementById('btn-audio-loop');
      loopBtn?.click();
    } else if (e.key === 'm' || e.key === 'M') {
      const muteBtn = document.getElementById('btn-volume-toggle');
      muteBtn?.click();
    }
  });

  // State Subscriptions for seamless UI sync
  appState.subscribe('isMediaDockOpen', (isOpen) => {
    const dock = document.getElementById('media-player-dock');
    const mini = document.getElementById('media-mini-pill');
    if (isOpen) {
      dock?.classList.remove('hidden');
      mini?.classList.add('hidden');
      const curBook = appState.get('currentBook');
      initMediaDock(curBook);
      refreshLucideIcons();
    } else {
      dock?.classList.add('hidden');
    }
  });

  appState.subscribe('currentBook', (book) => {
    initMediaDock(book);
  });
}

function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
