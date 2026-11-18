import { showToast } from '../../utils/toast';
import { refreshLucideIcons } from '../../utils/icons';

interface StudentScore {
  id: string;
  name: string;
  score: number;
}

let students: StudentScore[] = [
  { id: 'st-1', name: 'Nhóm A', score: 0 },
  { id: 'st-2', name: 'Nhóm B', score: 0 }
];
let highlightedId: string | null = null;

function renderScoreList(): void {
  const list = document.getElementById('teaching-scoreboard-list');
  if (!list) return;

  list.innerHTML = students.map(s => `
    <div class="flex items-center justify-between gap-2 p-2 rounded-xl border ${
      highlightedId === s.id
        ? 'bg-sky-50 border-sky-400'
        : 'bg-slate-50/70 border-slate-200/80'
    }">
      <span class="text-xs font-semibold text-slate-800 truncate flex-1">${s.name}</span>
      <div class="flex items-center gap-1 shrink-0">
        <button type="button" data-score-dec="${s.id}" class="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer">-</button>
        <span class="w-7 text-center font-mono text-xs font-bold text-slate-900 tabular-nums">${s.score}</span>
        <button type="button" data-score-inc="${s.id}" class="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white cursor-pointer">+</button>
        <button type="button" data-score-del="${s.id}" class="w-6 h-6 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer" title="Xóa">
          <i data-lucide="x" class="w-3 h-3"></i>
        </button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-score-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-score-inc');
      const target = students.find(x => x.id === id);
      if (target) { target.score += 1; renderScoreList(); }
    });
  });

  list.querySelectorAll('[data-score-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-score-dec');
      const target = students.find(x => x.id === id);
      if (target) { target.score = Math.max(0, target.score - 1); renderScoreList(); }
    });
  });

  list.querySelectorAll('[data-score-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-score-del');
      students = students.filter(x => x.id !== id);
      renderScoreList();
    });
  });

  refreshLucideIcons();
}

export function toggleScoreboardWidget(): void {
  const panel = document.getElementById('widget-teaching-scoreboard');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderScoreList();
}

export function renderScoreboardWidgetHtml(): string {
  return `
  <div id="widget-teaching-scoreboard" class="hidden teaching-floating-widget absolute top-16 right-4 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3.5 space-y-3 select-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
        <i data-lucide="trophy" class="w-4 h-4 text-amber-500"></i>
        <span>Bảng điểm & Gọi tên</span>
      </div>
      <button type="button" id="btn-scoreboard-close" class="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer" title="Đóng">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>

    <div class="flex items-center gap-1.5">
      <input id="input-scoreboard-name" type="text" placeholder="Tên học sinh hoặc nhóm..." class="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 select-text" />
      <button type="button" id="btn-scoreboard-add" class="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap">Thêm</button>
    </div>

    <div id="teaching-scoreboard-list" class="max-h-48 overflow-y-auto space-y-1.5 pr-0.5"></div>

    <div class="flex items-center gap-1.5 pt-1 border-t border-slate-100">
      <button type="button" id="btn-scoreboard-random" class="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
        <i data-lucide="shuffle" class="w-3.5 h-3.5"></i>
        <span>Gọi ngẫu nhiên</span>
      </button>
      <button type="button" id="btn-scoreboard-reset" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer">Về 0</button>
    </div>
  </div>
  `;
}

export function setupScoreboardListeners(): void {
  const input = document.getElementById('input-scoreboard-name') as HTMLInputElement;
  const addStudent = () => {
    const name = input?.value.trim();
    if (!name) return;
    students.push({ id: `st-${Date.now()}`, name, score: 0 });
    input.value = '';
    renderScoreList();
  };

  document.getElementById('btn-scoreboard-close')?.addEventListener('click', () => {
    document.getElementById('widget-teaching-scoreboard')?.classList.add('hidden');
  });
  document.getElementById('btn-scoreboard-add')?.addEventListener('click', addStudent);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addStudent(); }
  });
  document.getElementById('btn-scoreboard-reset')?.addEventListener('click', () => {
    students.forEach(s => { s.score = 0; });
    highlightedId = null;
    renderScoreList();
  });
  document.getElementById('btn-scoreboard-random')?.addEventListener('click', () => {
    if (students.length === 0) {
      showToast('⚠️ Hãy thêm ít nhất 1 học sinh hoặc nhóm');
      return;
    }
    const chosen = students[Math.floor(Math.random() * students.length)];
    highlightedId = chosen.id;
    renderScoreList();
    showToast(`🎯 Mời "${chosen.name}" trả lời câu hỏi!`);
  });
}
