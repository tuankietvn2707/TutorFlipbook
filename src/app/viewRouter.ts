import { Book } from '../types';
import { appState } from '../state/appState';
import { loadAllBooksFromDB, loadBookById } from '../services/dbService';
import { hydrateBookFromCloud } from '../services/firebaseService';
import { showToast, showLoader } from '../utils/toast';
import { updateHeaderStats } from '../components/Header';
import { renderLibraryGrid } from '../components/LibraryView';
import { openBookInReader, cleanupFlipbookReader } from '../components/FlipbookReader';
import { updateNavStyles } from './navStyles';

export function showLibraryView(): void {
  cleanupFlipbookReader();
  appState.set('currentBook', null);

  document.getElementById('view-reader-container')?.classList.add('hidden');
  document.getElementById('view-library-container')?.classList.remove('hidden');

  document.getElementById('main-sidebar-container')?.classList.remove('hidden');
  document.getElementById('main-header-container')?.classList.remove('hidden');
  document.getElementById('mobile-bottom-nav-container')?.classList.remove('hidden');

  try {
    window.history.pushState({}, '', window.location.pathname);
  } catch {
    // ignore
  }

  updateNavStyles('library');
  renderLibraryGrid();
}

export function showReaderView(): void {
  const curBook = appState.get('currentBook');
  const allBooks = appState.get('allBooks');
  if (!curBook && allBooks.length > 0) {
    openBookInReader(allBooks[0]);
  } else if (!curBook) {
    showToast('⚠️ Bạn chưa chọn cuốn sách nào để đọc');
    return;
  }

  document.getElementById('view-library-container')?.classList.add('hidden');
  document.getElementById('view-reader-container')?.classList.remove('hidden');

  document.getElementById('main-sidebar-container')?.classList.add('hidden');
  document.getElementById('main-header-container')?.classList.add('hidden');
  document.getElementById('mobile-bottom-nav-container')?.classList.add('hidden');

  updateNavStyles('reader');
}

export async function handleOpenBook(bookOrId: Book | string): Promise<void> {
  let book: Book | undefined;
  const allBooks = appState.get('allBooks');

  if (typeof bookOrId === 'string') {
    const idToFind = bookOrId.trim();
    const decodedId = decodeURIComponent(idToFind);
    book = allBooks.find(b =>
      b.id === idToFind ||
      b.id === decodedId ||
      encodeURIComponent(b.id) === idToFind ||
      b.title.toLowerCase().trim() === decodedId.toLowerCase().trim()
    );
    if (!book) {
      book = (await loadBookById(idToFind)) || (await loadBookById(decodedId)) || undefined;
    }
    if (!book) {
      const query = decodedId.toLowerCase();
      book = allBooks.find(b => b.title.toLowerCase().includes(query) || query.includes(b.title.toLowerCase()));
    }
  } else {
    book = bookOrId;
  }

  if (!book) {
    showToast('⚠️ Không tìm thấy cuốn sách được yêu cầu trong thư viện');
    return;
  }

  if (!book.pages || book.pages.length <= 1) {
    try {
      const dbFull = await loadBookById(book.id);
      if (dbFull && dbFull.pages && dbFull.pages.length > 0) {
        book = { ...book, ...dbFull };
      }
    } catch (e) {
      console.warn('Error fetching full book record:', e);
    }
  }

  const needsCloudPages = !book.pages || (book.totalPages > 1 && book.pages.length <= 1);
  const needsCloudAudio =
    book.audioTracks && book.audioTracks.length > 0 && !book.audioTracks[0]?.url && !book.audioTracks[0]?.blob;

  if (needsCloudPages || needsCloudAudio) {
    showLoader(true, 'Đang tải sách & bài nghe từ Firebase Cloud...');
    try {
      const cloudBook = await hydrateBookFromCloud(book.id);
      if (cloudBook && cloudBook.pages && cloudBook.pages.length > 0) {
        book = cloudBook;
      }
    } catch (e) {
      console.warn('Could not hydrate book from Firebase Cloud:', e);
    } finally {
      showLoader(false);
    }
  }

  appState.set('currentBook', book);

  try {
    const newUrl = `${window.location.pathname}?bookId=${encodeURIComponent(book.id)}`;
    window.history.pushState({ bookId: book.id }, '', newUrl);
  } catch {
    // ignore
  }

  showReaderView();
  await openBookInReader(book);
}

export async function initAppBooks(): Promise<void> {
  try {
    const books = await loadAllBooksFromDB(false);
    appState.set('allBooks', books);
    renderLibraryGrid();
    updateHeaderStats(books.length);

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    if (bookId) {
      await handleOpenBook(bookId);
    }
  } catch (err) {
    console.error('Failed to load books:', err);
  }
}
