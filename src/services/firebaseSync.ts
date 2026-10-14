import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
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

export const dbSavePdfBook = async (book: any) => {
  if (!db) return;
  try {
    if (authPromise) await authPromise;
    const bookId = book.id ? String(book.id) : `pdf-${Date.now()}`;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pdf_books', bookId);

    const firestoreData = { ...book, id: bookId };
    if (firestoreData.pdfFileUrl && firestoreData.pdfFileUrl.length > 500000) {
      delete firestoreData.pdfFileUrl;
    }
    await setDoc(docRef, firestoreData, { merge: true });
  } catch (e) {
    console.warn('Save PDF book error in firestore:', e);
  }
};

export const dbDeletePdfBook = async (bookId: string) => {
  if (!db) return;
  try {
    if (authPromise) await authPromise;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pdf_books', String(bookId));
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Delete PDF book error in firestore:', e);
  }
};

export const subscribeToPdfBooks = (callback: (books: any[]) => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'pdf_books');
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
      (err) => console.warn('Firestore PDF books listener error:', err)
    );
  } catch {
    return () => {};
  }
};
