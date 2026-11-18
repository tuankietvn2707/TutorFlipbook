import { renderTopToolbarHtml, renderBottomToolbarHtml } from '../TeachingToolbar';
import { renderTeachingToolsOverlaysHtml } from '../teachingTools/teachingToolsHtml';

export function renderFlipbookReaderHtml(): string {
  return `
  <section id="view-reader" class="flex-1 flex flex-col justify-between select-none relative h-full w-full bg-[#F8FAFC] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
    
    <!-- 1. TOP STUDIO TOOLBAR -->
    ${renderTopToolbarHtml()}

    <!-- 2. MAIN 3D FLIPBOOK VIEWPORT STAGE -->
    <div id="reader-stage" class="relative flex-1 w-full min-h-0 bg-[#E2E8F0]/60 overflow-hidden flex items-center justify-center p-2 sm:p-4">
      
      <!-- Annotation Canvas Layer -->
      <canvas id="annotation-canvas" class="absolute inset-0 z-30 pointer-events-none w-full h-full"></canvas>

      <!-- Classroom Support Overlays (Curtain, Timer, Vocab Notes, Scoreboard) -->
      ${renderTeachingToolsOverlaysHtml()}

      <!-- Zoom Badge Indicator -->
      <div id="zoom-badge-indicator" class="hidden absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md text-amber-300 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700 pointer-events-none">
        <span id="zoom-badge-text">Zoom: 100%</span>
      </div>

      <!-- Arrow Navigation Buttons on Stage -->
      <button 
        id="btn-stage-prev" 
        type="button"
        class="hidden sm:flex absolute left-3 z-20 w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-800 border border-slate-200 shadow-md items-center justify-center active:scale-95 transition-all cursor-pointer" 
        title="Trang trước [←]"
        aria-label="Trang trước"
      >
        <i data-lucide="chevron-left" class="w-5 h-5"></i>
      </button>

      <button 
        id="btn-stage-next" 
        type="button"
        class="hidden sm:flex absolute right-3 z-20 w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-800 border border-slate-200 shadow-md items-center justify-center active:scale-95 transition-all cursor-pointer" 
        title="Trang sau [→]"
        aria-label="Trang sau"
      >
        <i data-lucide="chevron-right" class="w-5 h-5"></i>
      </button>

      <!-- Flipbook Render Target Wrapper (Transformed with Zoom/Pan) -->
      <div id="reader-flipbook-container" class="relative z-10 origin-center flex items-center justify-center w-full h-full will-change-transform">
        <div id="flipbook-book" class="flip-book shadow-2xl"></div>
      </div>

      <!-- 3. BOTTOM FLOATING TEACHING DOCK -->
      ${renderBottomToolbarHtml()}

    </div>

  </section>
  `;
}
