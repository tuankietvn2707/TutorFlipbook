import { showToast } from '../../utils/toast';
import { refreshLucideIcons } from '../../utils/icons';

let durationSecs = 300;
let remainingSecs = 300;
let timerIntervalId: number | null = null;
let isRunning = false;

function playBellChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [587.33, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + idx * 0.18;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  } catch {
    // ignore audio fallback
  }
}

function formatMMSS(secs: number): string {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateTimerUI(): void {
  const display = document.getElementById('teaching-timer-display');
  const bar = document.getElementById('teaching-timer-bar');
  const toggleBtn = document.getElementById('btn-timer-toggle');

  if (display) {
    display.innerText = formatMMSS(remainingSecs);
    display.classList.toggle('text-rose-600', remainingSecs <= 10 && remainingSecs > 0);
    display.classList.toggle('text-slate-900', remainingSecs > 10 || remainingSecs === 0);
  }
  if (bar) {
    const pct = durationSecs > 0 ? Math.max(0, Math.min(100, (remainingSecs / durationSecs) * 100)) : 0;
    bar.style.width = `${pct}%`;
  }
  if (toggleBtn) {
    toggleBtn.innerHTML = isRunning
      ? '<i data-lucide="pause" class="w-3.5 h-3.5"></i><span>Tạm dừng</span>'
      : '<i data-lucide="play" class="w-3.5 h-3.5"></i><span>Bắt đầu</span>';
    refreshLucideIcons();
  }
}

function stopInterval(): void {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  isRunning = false;
  updateTimerUI();
}

function startInterval(): void {
  if (isRunning) return;
  if (remainingSecs <= 0) remainingSecs = durationSecs;
  isRunning = true;
  updateTimerUI();

  timerIntervalId = window.setInterval(() => {
    if (remainingSecs > 0) {
      remainingSecs -= 1;
      updateTimerUI();
    }
    if (remainingSecs <= 0) {
      stopInterval();
      playBellChime();
      showToast('⏰ Hết giờ làm bài!', 4000);
    }
  }, 1000);
}

export function openAndStartTimer(minutes: number): void {
  const panel = document.getElementById('widget-teaching-timer');
  panel?.classList.remove('hidden');
  stopInterval();
  durationSecs = Math.max(30, Math.round(minutes * 60));
  remainingSecs = durationSecs;
  updateTimerUI();
  startInterval();
}

export function toggleTimerWidget(): void {
  const panel = document.getElementById('widget-teaching-timer');
  if (!panel) return;
  panel.classList.toggle('hidden');
  updateTimerUI();
}

export function renderTimerWidgetHtml(): string {
  return `
  <div id="widget-teaching-timer" class="hidden teaching-floating-widget absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3.5 space-y-3 select-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
        <i data-lucide="clock" class="w-4 h-4 text-sky-600"></i>
        <span>Đồng hồ lớp học</span>
      </div>
      <button type="button" id="btn-timer-close" class="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer" title="Đóng đồng hồ">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>

    <div class="text-center py-1">
      <div id="teaching-timer-display" class="text-3xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">05:00</div>
      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
        <div id="teaching-timer-bar" class="h-full bg-sky-600 transition-all duration-300" style="width: 100%"></div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-1.5">
      <button type="button" data-timer-min="1" class="btn-timer-preset py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer">1p</button>
      <button type="button" data-timer-min="3" class="btn-timer-preset py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer">3p</button>
      <button type="button" data-timer-min="5" class="btn-timer-preset py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer">5p</button>
      <button type="button" data-timer-min="10" class="btn-timer-preset py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer">10p</button>
    </div>

    <div class="flex items-center gap-1.5">
      <button type="button" id="btn-timer-minus" class="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-mono font-semibold text-slate-700 cursor-pointer">-30s</button>
      <button type="button" id="btn-timer-toggle" class="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
        <i data-lucide="play" class="w-3.5 h-3.5"></i>
        <span>Bắt đầu</span>
      </button>
      <button type="button" id="btn-timer-plus" class="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-mono font-semibold text-slate-700 cursor-pointer">+30s</button>
      <button type="button" id="btn-timer-reset" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer" title="Đặt lại">
        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  </div>
  `;
}

export function setupTimerWidgetListeners(): void {
  document.getElementById('btn-timer-close')?.addEventListener('click', () => {
    document.getElementById('widget-teaching-timer')?.classList.add('hidden');
  });
  document.getElementById('btn-timer-toggle')?.addEventListener('click', () => {
    if (isRunning) stopInterval();
    else startInterval();
  });
  document.getElementById('btn-timer-reset')?.addEventListener('click', () => {
    stopInterval();
    remainingSecs = durationSecs;
    updateTimerUI();
  });
  document.getElementById('btn-timer-plus')?.addEventListener('click', () => {
    durationSecs += 30;
    remainingSecs += 30;
    updateTimerUI();
  });
  document.getElementById('btn-timer-minus')?.addEventListener('click', () => {
    remainingSecs = Math.max(0, remainingSecs - 30);
    if (remainingSecs > durationSecs) durationSecs = remainingSecs;
    updateTimerUI();
  });
  document.querySelectorAll('.btn-timer-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = Number(btn.getAttribute('data-timer-min')) || 5;
      stopInterval();
      durationSecs = mins * 60;
      remainingSecs = durationSecs;
      updateTimerUI();
    });
  });
}
