import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCKO6IcnY_cWGtMx6dB5abuLN_OtEOT5YM',
  authDomain: 'si-bunda.firebaseapp.com',
  projectId: 'si-bunda',
  storageBucket: 'si-bunda.firebasestorage.app',
  messagingSenderId: '1062700322561',
  appId: '1:1062700322561:web:624fcc956359d7e0ea9500',
  measurementId: 'G-MFY36D936G',
};

const appId = 'si-bunda-app';

let db: any = null;
let auth: any = null;
let authPromise: Promise<any> | null = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);

  authPromise = (async () => {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Anonymous auth failed:', e);
    }
  })();
} catch (err) {
  console.warn('Firebase init error:', err);
}

export const sendToGoogleSheet = (logData: any, webhookUrl: string) => {
  if (!webhookUrl) return;
  fetch(webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(logData),
  }).catch((e) => console.error('Google Sheet POST error:', e));
};

export const dbAddVisitorLog = async (logData: any, webhookUrl: string) => {
  // Always trigger direct Google Sheet webhook
  sendToGoogleSheet(logData, webhookUrl);

  if (!db) return;
  try {
    if (authPromise) await authPromise;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'visitor_logs');
    await addDoc(colRef, logData);
  } catch (e) {
    console.warn('Firestore log write error (fallback to local):', e);
  }
};

export const dbSaveWebhook = async (url: string) => {
  if (!db) return;
  try {
    if (authPromise) await authPromise;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    await setDoc(docRef, { googleSheetWebhook: url }, { merge: true });
  } catch (e) {
    console.warn('Save webhook error:', e);
  }
};

export const dbSaveVideo = async (video: any) => {
  if (!db) return;
  try {
    if (authPromise) await authPromise;
    const vidId = video.id ? String(video.id) : Date.now().toString();
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'videos', vidId);
    await setDoc(docRef, { ...video, id: vidId });
  } catch (e) {
    console.warn('Save video error:', e);
  }
};

export const dbDeleteVideo = async (vidId: string | number) => {
  if (!db) return;
  try {
    if (authPromise) await authPromise;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'videos', String(vidId));
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Delete video error:', e);
  }
};

export const subscribeToVisitorLogs = (callback: (logs: any[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'visitor_logs');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const logs: any[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...docSnap.data() });
        });
        logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        callback(logs);
      },
      (err) => console.warn('Firestore logs listener error:', err)
    );
  } catch {
    return () => {};
  }
};

export const subscribeToWebhookSettings = (callback: (url: string) => void) => {
  if (!db) return () => {};
  try {
    const settingsDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    return onSnapshot(
      settingsDoc,
      (snap) => {
        if (snap.exists() && snap.data().googleSheetWebhook) {
          callback(snap.data().googleSheetWebhook);
        }
      },
      (err) => console.warn('Firestore settings listener error:', err)
    );
  } catch {
    return () => {};
  }
};

export const subscribeToVideos = (callback: (videos: any[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'videos');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          callback(list);
        }
      },
      (err) => console.warn('Firestore videos listener error:', err)
    );
  } catch {
    return () => {};
  }
};

export const dbSavePdfBook = async (
  book: any,
  onProgress?: (pct: number) => void
) => {
  if (!db) {
    throw new Error('Database Firebase tidak terhubung');
  }
  try {
    const bookId = book.id ? String(book.id) : `pdf-${Date.now()}`;
    const parentRef = doc(db, 'artifacts', appId, 'public', 'data', 'pdf_books', bookId);

    const pdfDataUrl = book.pdfFileUrl || '';
    // Store up to 700KB inline for instant zero-latency loading across all devices
    const CHUNK_SIZE = 400000;
    const isLarge = pdfDataUrl.length > 700000;
    const chunkCount = isLarge ? Math.ceil(pdfDataUrl.length / CHUNK_SIZE) : 0;

    // Save parent metadata document
    const firestoreData: any = {
      id: bookId,
      title: book.title || 'Buku Resep MP-ASI',
      ageCategory: book.ageCategory || '6 - 8 Bulan',
      fileName: book.fileName || `${book.title}.pdf`,
      fileSize: book.fileSize || 'Dokumen PDF',
      uploadedAt: book.uploadedAt || new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' }),
      downloadUrl: book.downloadUrl || '#',
      pages: book.pages || [],
      hasCloudPdf: !!pdfDataUrl,
      chunkCount,
      updatedAt: Date.now(),
    };

    if (pdfDataUrl && !isLarge) {
      firestoreData.pdfFileUrl = pdfDataUrl;
    }

    // Write parent document
    await setDoc(parentRef, firestoreData, { merge: true });
    if (onProgress) onProgress(isLarge ? 30 : 100);

    // If larger than 700KB, write chunks in parallel
    if (isLarge && chunkCount > 0) {
      const chunkPromises = [];
      for (let i = 0; i < chunkCount; i++) {
        const chunk = pdfDataUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkRef = doc(db, 'artifacts', appId, 'public', 'data', 'pdf_books', bookId, 'chunks', String(i));
        chunkPromises.push(setDoc(chunkRef, { index: i, data: chunk }));
      }
      await Promise.all(chunkPromises);
      if (onProgress) onProgress(100);
    }
  } catch (e: any) {
    console.error('Save PDF book error in firestore:', e);
    throw new Error(e?.message || 'Gagal menyimpan dokumen ke cloud database');
  }
};

export const dbFetchPdfChunks = async (bookId: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const parentRef = doc(db, 'artifacts', appId, 'public', 'data', 'pdf_books', String(bookId));
    const parentSnap = await getDoc(parentRef);
    if (!parentSnap.exists()) return null;

    const data = parentSnap.data();
    if (data.pdfFileUrl && data.pdfFileUrl.startsWith('data:')) {
      return data.pdfFileUrl;
    }

    const chunksCol = collection(db, 'artifacts', appId, 'public', 'data', 'pdf_books', String(bookId), 'chunks');
    const chunksSnap = await getDocs(chunksCol);
    if (chunksSnap.empty) return null;

    const chunksList: { index: number; data: string }[] = [];
    chunksSnap.forEach((d) => {
      chunksList.push(d.data() as { index: number; data: string });
    });
    chunksList.sort((a, b) => a.index - b.index);
    return chunksList.map((c) => c.data).join('');
  } catch (e) {
    console.warn('Fetch PDF chunks error:', e);
    return null;
  }
};

export const dbDeletePdfBook = async (bookId: string) => {
  if (!db) return;
  try {
    const strId = String(bookId);
    // Delete chunks in parallel
    try {
      const chunksCol = collection(db, 'artifacts', appId, 'public', 'data', 'pdf_books', strId, 'chunks');
      const chunksSnap = await getDocs(chunksCol);
      if (!chunksSnap.empty) {
        await Promise.all(chunksSnap.docs.map((d) => deleteDoc(d.ref)));
      }
    } catch (err) {
      console.warn('Error deleting PDF chunks:', err);
    }

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pdf_books', strId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error('Delete PDF book error in firestore:', e);
    throw e;
  }
};

export const subscribeToPdfBooks = (callback: (books: any[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'pdf_books');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort newest first by updatedAt
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        callback(list);
      },
      (err) => console.error('Firestore PDF books listener error:', err)
    );
  } catch {
    return () => {};
  }
};

export const initCloudPdfCatalog = async (_defaultBooks?: any[]) => {
  // Cloud catalog is now purely dynamic based on admin uploads
  return;
};
