import { AudioTrack, Book } from '../types';
import { appState } from '../state/appState';
import { naturalSortAudioTracks } from '../utils/sorting';
import { showToast } from '../utils/toast';
import { refreshLucideIcons } from '../utils/icons';
import { saveBookToDB } from '../services/dbService';

let audioElement: HTMLAudioElement | null = null;
let currentTrackIndex = 0;
let isLoopSingle = false;

export function renderMediaDockHtml(): string {
  return `
  <!-- FLOATING AUDIO STUDIO DOCK (ALWAYS VISIBLE & ACCESSIBLE IN ALL MODES) -->
  <div 
    id="media-player-dock" 
    class="hidden fixed bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[94%] sm:max-w-4xl z-50 bg-slate-900/95 backdrop-blur-2xl border-2 border-purple-500/50 rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)] text-white space-y-2.5 select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
  >
    <!-- Header Row: Title, Quick Actions & Close -->
    <div class="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5">
      
      <!-- Left: Audio Title & Live Visualizer Badge -->
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-purple-500/30 text-purple-300 border border-purple-400/40 flex items-center justify-center shrink-0">
          <i data-lucide="headphones" class="w-4 h-4 text-purple-300"></i>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="font-black text-xs sm:text-sm text-white truncate tracking-wide">STUDIO BÀI NGHE AUDIO</h4>
            <span id="media-track-count-badge" class="text-[10px] font-black bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
              0 bài nghe
            </span>
          </div>
          <p id="media-current-book-label" class="text-[11px] font-bold text-slate-400 truncate">Sách đang mở</p>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Natural Sort Button -->
        <button 
          type="button"
          id="btn-sort-audio-tracks" 
          class="btn-3d bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition active:scale-95" 
          title="Sắp xếp tự nhiên theo thứ tự số (Track 1, 2... 10)"
        >
          <i data-lucide="arrow-down-1-0" class="w-3.5 h-3.5 text-purple-300"></i>
          <span class="hidden sm:inline">Xếp 1-9</span>
        </button>

        <!-- Direct Add Audio Files -->
        <label 
          class="btn-3d btn-purple text-white text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition" 
          title="Thêm file Audio (MP3, WAV, M4A) vào sách này"
        >
          <i data-lucide="folder-plus" class="w-3.5 h-3.5"></i>
          <span>+ Thêm Audio</span>
          <input type="file" id="input-add-audio-files" multiple accept="audio/*" class="hidden" />
        </label>

        <!-- Batch Media Modal Trigger -->
        <button 
          type="button"
          id="btn-open-batch-media-from-dock" 
          class="btn-3d bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] font-bold px-2 py-1 rounded-xl hidden md:flex items-center gap-1 cursor-pointer"
          title="Mở trình quản lý media hàng loạt"
        >
          <i data-lucide="layers" class="w-3.5 h-3.5 text-sky-400"></i>
          <span>Quản lý</span>
        </button>

        <div class="h-4 w-px bg-white/20 mx-0.5"></div>

        <!-- Minimize Button -->
        <button 
          type="button"
          id="btn-minimize-media-dock" 
          class="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer" 
          title="Thu nhỏ thành Remote nổi gọn gàng"
        >
          <i data-lucide="minimize-2" class="w-4 h-4"></i>
        </button>

        <!-- Close Button -->
        <button 
          type="button"
          id="btn-close-media-dock" 
          class="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition cursor-pointer" 
          title="Đóng thanh điều khiển bài nghe"
        >
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

    </div>

    <!-- Main Content Area: Player & Track List -->
    <div id="media-dock-player-content" class="space-y-2.5">
      
      <!-- Track Selection & Quick Jump Row -->
      <div class="flex items-center gap-2">
        <button 
          type="button"
          id="btn-track-prev" 
          class="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition active:scale-95 shrink-0 cursor-pointer" 
          title="Bài trước"
        >
          <i data-lucide="skip-back" class="w-4 h-4"></i>
        </button>

        <div class="flex-1 min-w-0 relative">
          <select 
            id="media-track-select" 
            class="w-full px-3 py-1.5 bg-slate-800/90 border border-purple-500/40 rounded-xl font-bold text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer truncate"
          >
            <option value="">-- Không có bài nghe --</option>
          </select>
        </div>

        <button 
          type="button"
          id="btn-track-next" 
          class="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition active:scale-95 shrink-0 cursor-pointer" 
          title="Bài kế tiếp"
        >
          <i data-lucide="skip-forward" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Controls & Progress Timeline -->
      <div class="flex items-center gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-2xl border border-white/10">
        
        <!-- Left: Rewind, Play/Pause, Forward, Loop -->
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Rewind 5s -->
          <button 
            type="button"
            id="btn-audio-rewind" 
            class="btn-3d bg-slate-800 hover:bg-slate-700 text-slate-200 w-9 h-9 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-600 flex items-center justify-center shrink-0" 
            title="Tua lại 5 giây"
          >
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
          </button>

          <!-- Main Play / Pause (Fixed Size Icon-Only Button) -->
          <button 
            type="button"
            id="btn-audio-play" 
            class="btn-3d btn-purple text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer shrink-0"
            title="Phát / Tạm dừng [Space]"
          >
            <i data-lucide="play" id="icon-audio-play" class="w-5 h-5"></i>
          </button>

          <!-- Forward 5s -->
          <button 
            type="button"
            id="btn-audio-forward" 
            class="btn-3d bg-slate-800 hover:bg-slate-700 text-slate-200 w-9 h-9 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-600 flex items-center justify-center shrink-0" 
            title="Tua tới 5 giây"
          >
            <i data-lucide="rotate-cw" class="w-4 h-4"></i>
          </button>

          <!-- Loop Track Toggle -->
          <button 
            type="button"
            id="btn-audio-loop" 
            class="w-9 h-9 rounded-xl text-slate-400 hover:text-purple-300 hover:bg-white/10 transition cursor-pointer flex items-center justify-center shrink-0" 
            title="Lặp lại bài này"
          >
            <i data-lucide="repeat" id="icon-audio-loop" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Center: Interactive Progress Bar & Time (Fixed & Stable Grid/Flex) -->
        <div class="flex-1 min-w-0 flex items-center gap-2 sm:gap-2.5">
          <span id="audio-time-current" class="text-xs font-mono font-bold text-purple-300 shrink-0 w-11 text-center select-none tabular-nums">00:00</span>
          
          <div class="flex-1 relative flex items-center min-w-0">
            <input 
              type="range" 
              id="audio-progress-bar" 
              value="0" 
              min="0" 
              max="100" 
              step="0.1" 
              class="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400 focus:outline-none"
            />
          </div>

          <span id="audio-time-total" class="text-xs font-mono font-bold text-slate-400 shrink-0 w-11 text-center select-none tabular-nums">00:00</span>
        </div>

        <!-- Right: Playback Speed -->
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[11px] font-bold text-slate-400 hidden md:inline">Tốc độ:</span>
          <select 
            id="audio-playback-rate" 
            class="px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-xl font-black text-xs text-purple-200 focus:outline-none focus:border-purple-400 cursor-pointer shrink-0"
            title="Tốc độ phát âm thanh"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>
        </div>

      </div>

    </div>

    <!-- Empty State (Shown when current book has NO audio tracks) -->
    <div id="media-dock-empty-state" class="hidden p-4 text-center bg-white/5 rounded-2xl border border-dashed border-purple-400/40 space-y-2">
      <div class="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
        <i data-lucide="music" class="w-5 h-5"></i>
      </div>
      <div>
        <p class="font-extrabold text-xs text-slate-200">Sách này chưa có bài nghe nào</p>
        <p class="text-[11px] font-bold text-slate-400">Bạn có thể thêm file bài nghe MP3/WAV để học sinh luyện nghe ngay trong bài học.</p>
      </div>
      <label class="btn-3d btn-purple text-white font-extrabold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110">
        <i data-lucide="upload" class="w-4 h-4"></i>
        <span>Chọn File Audio Từ Máy Tính</span>
        <input type="file" id="input-add-audio-files-empty" multiple accept="audio/*" class="hidden" />
      </label>
    </div>

  </div>

  <!-- MINI FLOATING AUDIO PILL (DISCREET REMOTE WHEN MINIMIZED) -->
  <div 
    id="media-mini-pill" 
    class="hidden fixed bottom-16 right-4 sm:right-6 z-50 bg-slate-900/95 backdrop-blur-xl text-white border-2 border-purple-500/60 rounded-full px-3.5 py-1.5 shadow-2xl flex items-center gap-2.5 select-none animate-in fade-in"
  >
    <div class="flex items-center gap-1.5 cursor-pointer" id="mini-pill-expand-trigger">
      <span class="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
      <span id="mini-pill-track-name" class="text-[11px] font-extrabold max-w-[110px] sm:max-w-[160px] truncate text-slate-100">Track 1</span>
      <span id="mini-pill-time" class="text-[10px] font-mono font-bold text-purple-300">00:00</span>
    </div>

    <div class="flex items-center gap-1 border-l border-white/20 pl-2">
      <button type="button" id="btn-mini-rewind" class="p-1 hover:text-purple-300 text-slate-300 transition cursor-pointer" title="Tua -5s">
        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-play" class="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow transition active:scale-95 cursor-pointer" title="Phát/Dừng">
        <i data-lucide="play" id="mini-pill-play-icon" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-forward" class="p-1 hover:text-purple-300 text-slate-300 transition cursor-pointer" title="Tua +5s">
        <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-expand" class="p-1 hover:text-purple-300 text-slate-300 transition cursor-pointer" title="Mở rộng Hộp điều khiển">
        <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
      </button>
      <button type="button" id="btn-mini-close" class="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer" title="Đóng">
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    </div>
  </div>

  <!-- Hidden Global Audio Element -->
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
    return;
  }

  // Has tracks
  if (emptyState) emptyState.classList.add('hidden');
  if (playerContent) playerContent.classList.remove('hidden');

  const sortedTracks = naturalSortAudioTracks(tracks);
  sortedTracks.forEach((track, idx) => {
    const opt = document.createElement('option');
    opt.value = track.url;
    opt.innerText = `${idx + 1}. ${track.name}`;
    opt.dataset.index = String(idx);
    select.appendChild(opt);
  });

  currentTrackIndex = 0;
  loadTrack(sortedTracks[0]);
  refreshLucideIcons();
}

export function loadTrack(track: AudioTrack): void {
  if (!audioElement) {
    audioElement = document.getElementById('global-audio-player') as HTMLAudioElement;
  }
  if (!audioElement || !track) return;

  audioElement.src = track.url;
  audioElement.load();

  const select = document.getElementById('media-track-select') as HTMLSelectElement;
  const miniTrackName = document.getElementById('mini-pill-track-name');
  
  if (select && track.url) {
    select.value = track.url;
  }
  if (miniTrackName) {
    miniTrackName.innerText = track.name;
  }

  appState.set('currentAudioTrack', track);
}

export function togglePlayAudio(): void {
  if (!audioElement) {
    audioElement = document.getElementById('global-audio-player') as HTMLAudioElement;
  }
  if (!audioElement) return;

  if (!audioElement.src || audioElement.src === '' || audioElement.src.endsWith('undefined')) {
    const book = appState.get('currentBook');
    if (book && book.audioTracks && book.audioTracks.length > 0) {
      loadTrack(book.audioTracks[0]);
    } else {
      showToast('⚠️ Sách chưa có bài nghe nào. Hãy nhấn "+ Thêm Audio"');
      return;
    }
  }

  if (audioElement.paused) {
    audioElement.play().then(() => {
      updatePlayButtonUI(true);
      appState.set('isPlayingAudio', true);
    }).catch(e => {
      console.warn('Audio play error:', e);
      showToast('⚠️ Vui lòng chọn file audio hợp lệ');
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
  audioElement.currentTime = Math.max(0, Math.min(audioElement.duration || 0, audioElement.currentTime + seconds));
}

export function seekAudio(value: number): void {
  if (!audioElement || !audioElement.duration) return;
  audioElement.currentTime = (value / 100) * audioElement.duration;
}

export function setPlaybackRate(rate: number): void {
  if (!audioElement) return;
  audioElement.playbackRate = rate;
}

function updatePlayButtonUI(playing: boolean): void {
  const icon = document.getElementById('icon-audio-play');
  const miniIcon = document.getElementById('mini-pill-play-icon');
  const playBtn = document.getElementById('btn-audio-play');

  if (icon) {
    icon.setAttribute('data-lucide', playing ? 'pause' : 'play');
  }
  if (playBtn) {
    playBtn.setAttribute('title', playing ? 'Tạm dừng [Space]' : 'Phát bài nghe [Space]');
  }
  if (miniIcon) {
    miniIcon.setAttribute('data-lucide', playing ? 'pause' : 'play');
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
      if (timeTot) timeTot.innerText = formatTime(dur);
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

  // Rewind / Forward
  document.getElementById('btn-audio-rewind')?.addEventListener('click', () => seekAudioRelative(-5));
  document.getElementById('btn-audio-forward')?.addEventListener('click', () => seekAudioRelative(5));
  document.getElementById('btn-mini-rewind')?.addEventListener('click', () => seekAudioRelative(-5));
  document.getElementById('btn-mini-forward')?.addEventListener('click', () => seekAudioRelative(5));

  // Next / Prev Track
  document.getElementById('btn-track-prev')?.addEventListener('click', playPrevTrack);
  document.getElementById('btn-track-next')?.addEventListener('click', playNextTrack);

  // Loop toggle
  document.getElementById('btn-audio-loop')?.addEventListener('click', () => {
    isLoopSingle = !isLoopSingle;
    const btn = document.getElementById('btn-audio-loop');
    if (btn) {
      if (isLoopSingle) {
        btn.classList.add('text-purple-400', 'bg-white/20');
        showToast('🔁 Đã bật lặp lại 1 bài nghe');
      } else {
        btn.classList.remove('text-purple-400', 'bg-white/20');
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
    showToast('🔢 Đã sắp xếp lại danh sách bài nghe theo thứ tự số tự nhiên (1-9)!');
  });

  // Minimize / Expand / Close
  document.getElementById('btn-minimize-media-dock')?.addEventListener('click', minimizeMediaDock);
  document.getElementById('btn-mini-expand')?.addEventListener('click', expandMediaDock);
  document.getElementById('mini-pill-expand-trigger')?.addEventListener('click', expandMediaDock);
  
  document.getElementById('btn-close-media-dock')?.addEventListener('click', () => {
    appState.set('isMediaDockOpen', false);
  });
  document.getElementById('btn-mini-close')?.addEventListener('click', () => {
    document.getElementById('media-mini-pill')?.classList.add('hidden');
    appState.set('isMediaDockOpen', false);
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

  // Playback Rate
  const speedSelect = document.getElementById('audio-playback-rate') as HTMLSelectElement;
  speedSelect?.addEventListener('change', (e: any) => {
    setPlaybackRate(parseFloat(e.target.value));
  });

  // Track Select Dropdown
  const trackSelect = document.getElementById('media-track-select') as HTMLSelectElement;
  trackSelect?.addEventListener('change', (e: any) => {
    const book = appState.get('currentBook');
    if (!book || !book.audioTracks) return;
    const found = book.audioTracks.find(t => t.url === e.target.value);
    if (found) {
      loadTrack(found);
      togglePlayAudio();
    }
  });

  // Direct Audio File Inputs (Both in Header and Empty State)
  const handleAddFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const curBook = appState.get('currentBook');
    if (!curBook) {
      showToast('⚠️ Vui lòng mở một cuốn sách trước khi thêm bài nghe');
      return;
    }

    showToast(`⏳ Đang xử lý ${files.length} tệp âm thanh...`);

    const newTracks: AudioTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await readFileAsDataURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      newTracks.push({
        id: `track-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        url: dataUrl
      });
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
    showToast(`🎉 Đã thêm thành công ${newTracks.length} bài nghe vào sách!`);
  };

  document.getElementById('input-add-audio-files')?.addEventListener('change', (e: any) => {
    handleAddFiles(e.target.files);
    e.target.value = '';
  });

  document.getElementById('input-add-audio-files-empty')?.addEventListener('change', (e: any) => {
    handleAddFiles(e.target.files);
    e.target.value = '';
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

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
