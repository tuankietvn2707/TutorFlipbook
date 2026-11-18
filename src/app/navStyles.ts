export function updateNavStyles(activeTab: 'library' | 'reader'): void {
  const navLib = document.getElementById('nav-btn-library');
  const navReader = document.getElementById('nav-btn-reader');
  const mobLib = document.getElementById('mob-nav-library');
  const mobReader = document.getElementById('mob-nav-reader');

  if (navLib) {
    const badge = navLib.querySelector('.nav-icon-badge');
    const text = navLib.querySelector('.nav-text');
    if (activeTab === 'library') {
      navLib.className = 'btn-nav-library-active w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap';
      if (badge) badge.className = 'nav-icon-badge w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0';
      if (text) text.className = 'nav-text font-bold';
    } else {
      navLib.className = 'btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap';
      if (badge) badge.className = 'nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0';
      if (text) text.className = 'nav-text font-semibold';
    }
  }

  if (navReader) {
    const badge = navReader.querySelector('.nav-icon-badge');
    const text = navReader.querySelector('.nav-text');
    if (activeTab === 'reader') {
      navReader.className = 'btn-nav-reader-active w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap';
      if (badge) badge.className = 'nav-icon-badge w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0';
      if (text) text.className = 'nav-text font-bold';
    } else {
      navReader.className = 'btn-nav-inactive w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-3 text-left transition-all cursor-pointer whitespace-nowrap';
      if (badge) badge.className = 'nav-icon-badge w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0';
      if (text) text.className = 'nav-text font-semibold';
    }
  }

  if (mobLib) {
    const iconBox = mobLib.querySelector('.mob-icon-box');
    if (activeTab === 'library') {
      mobLib.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-sky-600 font-bold text-[10px] gap-1 active:scale-95 transition-all';
      if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm';
    } else {
      mobLib.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-semibold text-[10px] gap-1 active:scale-95 transition-all';
      if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center';
    }
  }

  if (mobReader) {
    const iconBox = mobReader.querySelector('.mob-icon-box');
    if (activeTab === 'reader') {
      mobReader.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-emerald-600 font-bold text-[10px] gap-1 active:scale-95 transition-all';
      if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm';
    } else {
      mobReader.className = 'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 font-semibold text-[10px] gap-1 active:scale-95 transition-all';
      if (iconBox) iconBox.className = 'mob-icon-box w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center';
    }
  }
}
