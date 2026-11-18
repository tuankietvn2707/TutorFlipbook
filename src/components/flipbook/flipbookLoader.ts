import { Book } from '../../types';
import { appState } from '../../state/appState';
import { loadBookById } from '../../services/dbService';
import { createSvgPageDataUrl } from '../../utils/sampleBooks';
import { EMPTY_PAGE_DATA_URL, getPageFlipInstance } from './flipbookState';
import { initPageFlip } from './flipbookInitializer';

export async function openBookInReader(book: Book, initialPage = 0): Promise<void> {
  let fullBook = { ...book };

  if (!fullBook.pages || fullBook.pages.length <= 1 || (fullBook.audioTracks && fullBook.audioTracks[0] && !fullBook.audioTracks[0].url)) {
    try {
      const loaded = await loadBookById(fullBook.id);
      if (loaded) {
        if (loaded.pages && loaded.pages.length > 0) fullBook.pages = loaded.pages;
        if (loaded.audioTracks && loaded.audioTracks.length > 0 && loaded.audioTracks[0].url) {
          fullBook.audioTracks = loaded.audioTracks;
        }
        if (loaded.totalPages) fullBook.totalPages = loaded.totalPages;
      }
    } catch (err) {
      console.warn('Could not load full book from DB:', err);
    }
  }

  if (!fullBook.pages || fullBook.pages.length === 0) {
    fullBook.pages = [fullBook.coverImage || EMPTY_PAGE_DATA_URL];
  }

  if (fullBook.totalPages && fullBook.totalPages > fullBook.pages.length) {
    const pages = [...fullBook.pages];
    for (let i = pages.length; i < fullBook.totalPages; i++) {
      pages.push(createSvgPageDataUrl(fullBook.title, 'Oxford / Cambridge', i + 1, '#059669', '#34D399'));
    }
    fullBook.pages = pages;
  }

  if (fullBook.pages.length < 4) {
    const pages = [...fullBook.pages];
    while (pages.length < 4) {
      pages.push(createSvgPageDataUrl(fullBook.title, 'Oxford / Cambridge', pages.length + 1, '#059669', '#34D399'));
    }
    fullBook.pages = pages;
  }

  appState.update({
    currentBook: fullBook,
    totalPages: fullBook.pages.length,
    currentPage: initialPage + 1
  });

  initPageFlip(fullBook, initialPage);

  requestAnimationFrame(() => {
    setTimeout(() => {
      if (!getPageFlipInstance()) {
        initPageFlip(fullBook, initialPage);
      }
    }, 60);
  });
}
