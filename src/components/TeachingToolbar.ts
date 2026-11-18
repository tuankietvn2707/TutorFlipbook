import { setupTopToolbarListeners, ToolbarCallbacks } from './toolbar/topToolbarListeners';
import { setupBottomToolbarListeners } from './toolbar/bottomToolbarListeners';

export { renderTopToolbarHtml } from './toolbar/topToolbarHtml';
export { renderBottomToolbarHtml } from './toolbar/bottomToolbarHtml';

export function renderTeachingToolbarHtml(): string {
  return '';
}

export function setupToolbarListeners(callbacks: ToolbarCallbacks): void {
  setupTopToolbarListeners(callbacks);
  setupBottomToolbarListeners(callbacks);
}

export function setupTeachingToolbarListeners(callbacks: ToolbarCallbacks): void {
  setupToolbarListeners(callbacks);
}
