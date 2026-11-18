import { renderMediaDockHeaderHtml } from './mediaDockHeaderHtml';
import { renderMediaDockBodyHtml } from './mediaDockBodyHtml';
import { renderMediaDockDrawerHtml, renderMediaMiniPillHtml } from './mediaDockDrawerHtml';

export function renderMediaDockHtml(): string {
  return `
  <!-- APPLE-STYLE AUDIO STUDIO DOCK -->
  <div 
    id="media-player-dock" 
    class="hidden fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[95%] sm:max-w-4xl z-50 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-[26px] p-3 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-white select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
  >
    ${renderMediaDockHeaderHtml()}
    ${renderMediaDockBodyHtml()}
    ${renderMediaDockDrawerHtml()}
  </div>

  ${renderMediaMiniPillHtml()}

  <!-- Global Audio Element -->
  <audio id="global-audio-player" preload="auto"></audio>
  `;
}
