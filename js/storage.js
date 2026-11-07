/**
 * Eng. Hafedh Ali Saif Al-Mashwali - Credentials Storage Manager
 * Uses IndexedDB with LocalStorage fallback to persistently store uploaded scans.
 */

const CredentialsStorage = (() => {
  const DB_NAME = "HafedhCredentialsDB";
  const DB_VERSION = 1;
  const STORE_NAME = "scans";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported, falling back to localStorage");
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.warn("IndexedDB open error:", event.target.error);
        resolve(null);
      };
    });

    return dbPromise;
  }

  // Save scan image (Base64 dataURL / Blob)
  async function saveScan(docId, dataUrl, meta = {}) {
    const record = {
      id: docId,
      dataUrl: dataUrl,
      fileName: meta.name || `${docId}_scan.png`,
      fileSize: meta.size || dataUrl.length,
      mimeType: meta.type || "image/jpeg",
      updatedAt: new Date().toISOString()
    };

    const db = await openDB();
    if (db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction([STORE_NAME], "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.put(record);
          tx.oncomplete = () => {
            window.dispatchEvent(new CustomEvent("scan:updated", { detail: { id: docId, record } }));
            resolve(record);
          };
          tx.onerror = (e) => {
            console.error("IndexedDB put error, falling back to localStorage", e);
            saveToLocalStorage(docId, record);
            resolve(record);
          };
        } catch (err) {
          saveToLocalStorage(docId, record);
          resolve(record);
        }
      });
    } else {
      saveToLocalStorage(docId, record);
      return record;
    }
  }

  function saveToLocalStorage(docId, record) {
    try {
      localStorage.setItem(`hafedh_scan_${docId}`, JSON.stringify(record));
      window.dispatchEvent(new CustomEvent("scan:updated", { detail: { id: docId, record } }));
    } catch (e) {
      console.error("LocalStorage write failed (quota exceeded?):", e);
    }
  }

  // Get scan for docId
  async function getScan(docId) {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction([STORE_NAME], "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(docId);
          req.onsuccess = () => {
            if (req.result) {
              resolve(req.result);
            } else {
              resolve(getFromLocalStorage(docId));
            }
          };
          req.onerror = () => {
            resolve(getFromLocalStorage(docId));
          };
        } catch (e) {
          resolve(getFromLocalStorage(docId));
        }
      });
    } else {
      return getFromLocalStorage(docId);
    }
  }

  function getFromLocalStorage(docId) {
    try {
      const item = localStorage.getItem(`hafedh_scan_${docId}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  // Remove scan
  async function removeScan(docId) {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction([STORE_NAME], "readwrite");
        tx.objectStore(STORE_NAME).delete(docId);
      } catch (e) {}
    }
    try {
      localStorage.removeItem(`hafedh_scan_${docId}`);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("scan:removed", { detail: { id: docId } }));
  }

  // Get all scans as a map { docId: record }
  async function getAllScans() {
    const db = await openDB();
    const map = {};

    if (db) {
      await new Promise((resolve) => {
        try {
          const tx = db.transaction([STORE_NAME], "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              map[cursor.value.id] = cursor.value;
              cursor.continue();
            } else {
              resolve();
            }
          };
          req.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }

    // Merge any from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("hafedh_scan_")) {
        const docId = key.replace("hafedh_scan_", "");
        if (!map[docId]) {
          try {
            map[docId] = JSON.parse(localStorage.getItem(key));
          } catch (e) {}
        }
      }
    }

    return map;
  }

  return {
    saveScan,
    getScan,
    removeScan,
    getAllScans
  };
})();
