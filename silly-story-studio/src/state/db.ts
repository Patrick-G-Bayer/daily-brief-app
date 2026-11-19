/** Local-only storage for saved shows and photos (IndexedDB). Nothing is uploaded. */
import type { PhotoRec, SavedShow } from '../types';

const DB_NAME = 'silly-story-studio';
const DB_VERSION = 2;
const SHOWS = 'shows';
const PHOTOS = 'photos';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        // Version 1 stored per-character voice clips; shows replace them.
        if (db.objectStoreNames.contains('voices')) db.deleteObjectStore('voices');
        if (!db.objectStoreNames.contains(SHOWS)) db.createObjectStore(SHOWS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(PHOTOS)) db.createObjectStore(PHOTOS, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

/** Ask the browser to keep our data even when storage runs low (best effort). */
function persist(): void {
  void navigator.storage?.persist?.().catch(() => {});
}

export async function listShows(): Promise<SavedShow[]> {
  try {
    const all = await run<SavedShow[]>(SHOWS, 'readonly', (s) => s.getAll());
    return all.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveShow(show: SavedShow): Promise<boolean> {
  try {
    await run(SHOWS, 'readwrite', (s) => s.put(show));
    persist();
    return true;
  } catch {
    return false;
  }
}

export async function deleteShow(id: string): Promise<void> {
  try {
    await run(SHOWS, 'readwrite', (s) => s.delete(id));
  } catch {
    // ignore
  }
}

export async function listPhotos(): Promise<PhotoRec[]> {
  try {
    const all = await run<PhotoRec[]>(PHOTOS, 'readonly', (s) => s.getAll());
    return all.sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function savePhoto(p: PhotoRec): Promise<boolean> {
  try {
    await run(PHOTOS, 'readwrite', (s) => s.put(p));
    persist();
    return true;
  } catch {
    return false;
  }
}

export async function deletePhoto(id: string): Promise<void> {
  try {
    await run(PHOTOS, 'readwrite', (s) => s.delete(id));
  } catch {
    // ignore
  }
}
