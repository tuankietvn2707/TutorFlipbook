import { openAndStartTimer, toggleTimerWidget, setupTimerWidgetListeners } from './timerWidget';
import { toggleNotesWidget, setupNotesBoardListeners } from './notesBoardWidget';
import { toggleScoreboardWidget, setupScoreboardListeners } from './scoreboardWidget';
import { toggleCurtainOverlay, setupCurtainListeners } from './curtainOverlay';

export {
  openAndStartTimer,
  toggleTimerWidget,
  toggleNotesWidget,
  toggleScoreboardWidget,
  toggleCurtainOverlay
};

export function setupTeachingToolsListeners(): void {
  setupTimerWidgetListeners();
  setupNotesBoardListeners();
  setupScoreboardListeners();
  setupCurtainListeners();
}
