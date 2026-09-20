import { Book } from '../types';

const DB_NAME = 'Biblio3D_TutorFlow_DB';
const DB_STORE = 'books';
let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }
    try {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e: any) => {
        dbInstance = e.target.result;
        resolve(dbInstance!);
      };
      req.onerror = (e) => reject(e);
    } catch (err) {
      reject(err);
    }
  });
}

export async function loadBookById(id: string): Promise<Book | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error(`Error loading book ${id} from DB:`, err);
    return null;
  }
}

export async function loadAllBooksWithPagesFromDB(): Promise<Book[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve(req.result || []);
      };
      req.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error('Error loading all full books from DB:', err);
    return [];
  }
}

export async function loadAllBooksFromDB(includeFullPages: boolean = false): Promise<Book[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.openCursor();
      const realBooks: Book[] = [];

      req.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const b = cursor.value;
          
          if (includeFullPages) {
            realBooks.push(b);
          } else {
            // Lightweight representation: keep cover for grid, drop high-res page images array
            // to prevent hundreds of megabytes in JS Heap memory
            const coverImg = b.coverImage || (b.pages && b.pages[0]) || '';
            const audioCount = b.audioTracks ? b.audioTracks.length : 0;
            
            // Clone without massive arrays to avoid mutating DB cursor value
            const { pages: _p, audioTracks: _a, ...rest } = b;
            
            realBooks.push({
              ...rest,
              coverImage: coverImg,
              pages: coverImg ? [coverImg] : [], // Only keep cover thumbnail
              audioTracks: new Array(audioCount).fill({ url: '' }) // Mock length for UI counts
            });
          }
          cursor.continue();
        } else {
          resolve(realBooks);
        }
      };
      
      req.onerror = (e) => reject(e);
    });
  } catch (e) {
    console.error('Error loading books from DB:', e);
    return [];
  }
}

export async function saveBookToDB(book: Book): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const getReq = store.get(book.id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      let bookToSave = { ...book };
      
      if (existing) {
        // If new book record has stripped pages, preserve original high-res pages array from existing record
        if ((!book.pages || book.pages.length <= 1) && existing.pages && existing.pages.length > 1) {
          bookToSave.pages = existing.pages;
        }
        // If new book record has dummy lightweight audioTracks (without URL), preserve existing real tracks
        if (existing.audioTracks && existing.audioTracks.length > 0) {
          const isDummyAudio = !book.audioTracks || (book.audioTracks.length > 0 && !book.audioTracks[0].url && !book.audioTracks[0].blob);
          if (isDummyAudio) {
            bookToSave.audioTracks = existing.audioTracks;
          }
        }
      }
      
      const putReq = store.put(bookToSave);
      putReq.onsuccess = () => resolve();
      putReq.onerror = (e) => reject(e);
    };
    getReq.onerror = () => {
      const putReq = store.put(book);
      putReq.onsuccess = () => resolve();
      putReq.onerror = (e) => reject(e);
    };
  });
}

export async function deleteBookFromDB(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

export async function clearAllBooksDB(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}
