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

export async function loadAllBooksFromDB(): Promise<Book[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const rawBooks: Book[] = req.result || [];
        const realBooks: Book[] = [];
        
        // Remove all sample books permanently from storage
        for (const b of rawBooks) {
          if (b.isSample || b.id.startsWith('sample-book-')) {
            try {
              store.delete(b.id);
            } catch (err) {
              console.warn('Failed to delete sample book id:', b.id, err);
            }
          } else {
            realBooks.push(b);
          }
        }
        resolve(realBooks);
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
    const req = store.put(book);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
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
