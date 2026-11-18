import { renderTimerWidgetHtml } from './timerWidget';
import { renderNotesBoardHtml } from './notesBoardWidget';
import { renderScoreboardWidgetHtml } from './scoreboardWidget';
import { renderCurtainOverlayHtml } from './curtainOverlay';

export function renderTeachingToolsOverlaysHtml(): string {
  return `
    ${renderCurtainOverlayHtml()}
    ${renderTimerWidgetHtml()}
    ${renderNotesBoardHtml()}
    ${renderScoreboardWidgetHtml()}
  `;
}
