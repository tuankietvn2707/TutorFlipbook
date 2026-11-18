import { appState } from '../state/appState';
import { refreshLucideIcons } from '../utils/icons';
import { renderBookCardHtml } from './library/bookCardTemplate';
import { getLibraryFilterState } from './library/libraryListeners';

export { renderLibraryViewHtml } from './library/libraryViewTemplate';
export { setupLibraryListeners } from './library/libraryListeners';

export function renderLibraryGrid(): void {
  const allBooks = appState.get('allBooks') || [];
  const searchQuery = (appState.get('searchQuery') || '').toLowerCase().trim();
  const category = appState.get('currentCategory') || 'all';
  const { onlyWithAudio, sortBy } = getLibraryFilterState();

  let filtered = [...allBooks];

  if (category !== 'all') {
    filtered = filtered.filter(b => (b.category || 'textbook') === category);
  }
  if (onlyWithAudio) {
    filtered = filtered.filter(b => b.audioTracks && b.audioTracks.length > 0);
  }
  if (searchQuery) {
    filtered = filtered.filter(b => b.title.toLowerCase().includes(searchQuery));
  }

  if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'audio') {
    filtered.sort((a, b) => (b.audioTracks?.length || 0) - (a.audioTracks?.length || 0));
  } else if (sortBy === 'pages') {
    filtered.sort((a, b) => (b.totalPages || 0) - (a.totalPages || 0));
  } else {
    filtered.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
  }

  const container = document.getElementById('books-grid');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('sidebar-book-count');
  const summaryEl = document.getElementById('library-result-summary');

  if (countEl) countEl.innerText = `${allBooks.length} cuốn`;
  if (summaryEl) summaryEl.innerText = `${filtered.length} giáo trình`;

  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  container.innerHTML = filtered.map(renderBookCardHtml).join('');
  refreshLucideIcons();
}
