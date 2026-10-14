/**
 * IndexedDB storage helper for large PDF files and recipe books in Si Bunda.
 * Overcomes localStorage 5MB quota limit, allowing multiple uploaded PDF books (up to 100MB+).
 */

const DB_NAME = 'si_bunda_db';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_books';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfBookToIndexedDB(book: any): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(book);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save error, falling back:', err);
  }
}

export async function getAllPdfBooksFromIndexedDB(): Promise<any[] | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result && req.result.length > 0 ? req.result : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read error:', err);
    return null;
  }
}

export async function deletePdfBookFromIndexedDB(bookId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(bookId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }
}

/**
 * Converts a base64 data URL to a Blob URL for reliable PDF rendering in iframes / objects.
 */
export function base64ToBlobUrl(base64Data: string): string {
  if (!base64Data) return '';
  if (base64Data.startsWith('blob:') || base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].replace('data:', '') || 'application/pdf';
    const raw = window.atob(parts[1] || parts[0]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Error converting base64 to blob URL:', e);
    return base64Data;
  }
}
