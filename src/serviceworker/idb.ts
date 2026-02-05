
const DB_NAME = 'pgen-db';
const STORE_NAME = 'settings';
const KEY_OFFLINE_MODE = 'offline-mode';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function setOfflineMode(enabled: boolean): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(enabled, KEY_OFFLINE_MODE);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getOfflineMode(): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(KEY_OFFLINE_MODE);
        request.onsuccess = () => resolve(request.result === true); // Default false if undefined
        request.onerror = () => reject(request.error);
    });
}
