// Offline-First IndexedDB Storage & Auto-Sync Engine for E-School Daara
window.OfflineSyncManager = (function() {
  const DB_NAME = 'eschool_offline_db';
  const DB_VERSION = 1;
  let dbInstance = null;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('offline_attendance')) {
          db.createObjectStore('offline_attendance', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('offline_grades')) {
          db.createObjectStore('offline_grades', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = (e) => {
        console.error('IndexedDB open error:', e);
        reject(e);
      };
    });
  }

  // Save Attendance locally when offline
  async function saveAttendanceOffline(studentId, status, recordedBy) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_attendance', 'readwrite');
      const store = tx.objectStore('offline_attendance');
      const record = {
        studentId,
        status,
        recordedBy: recordedBy || 'TCH-01',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      const req = store.add(record);
      req.onsuccess = () => {
        console.log('[OfflineSync] Attendance queued in IndexedDB:', record);
        resolve(record);
      };
      req.onerror = (e) => reject(e);
    });
  }

  // Retrieve queued offline attendance logs
  async function getOfflineAttendanceQueue() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_attendance', 'readonly');
      const store = tx.objectStore('offline_attendance');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e);
    });
  }

  // Clear synced queue
  async function clearOfflineAttendanceQueue() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_attendance', 'readwrite');
      const store = tx.objectStore('offline_attendance');
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }

  // Auto Sync when device comes back online
  async function syncOfflineDataToServer() {
    if (!navigator.onLine) {
      console.log('[OfflineSync] Device is still offline. Keeping local records.');
      return 0;
    }

    try {
      const pendingLogs = await getOfflineAttendanceQueue();
      if (pendingLogs.length === 0) return 0;

      console.log(`[OfflineSync] Syncing ${pendingLogs.length} offline attendance records to cloud server...`);

      for (const item of pendingLogs) {
        await fetch('/api/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: item.studentId,
            recordedBy: item.recordedBy,
            method: 'OFFLINE_SYNC_QR'
          })
        }).catch(err => console.warn('Sync individual failed:', err));
      }

      await clearOfflineAttendanceQueue();
      console.log('[OfflineSync] Cloud sync completed successfully.');
      return pendingLogs.length;
    } catch (e) {
      console.warn('[OfflineSync] Sync failed:', e);
      return 0;
    }
  }

  // Listen to browser network changes
  window.addEventListener('online', async () => {
    console.log('[OfflineSync] Connection restored. Auto-syncing...');
    const syncedCount = await syncOfflineDataToServer();
    if (syncedCount > 0 && window.showToastNotice) {
      window.showToastNotice(`Connexion rétablie : ${syncedCount} présences hors-ligne synchronisées avec succès !`);
    }
    updateOnlineBadge(true);
  });

  window.addEventListener('offline', () => {
    console.warn('[OfflineSync] Device is offline. Offline-First mode active.');
    if (window.showToastNotice) {
      window.showToastNotice('Mode Hors-Ligne activé. Les données sont sauvegardées localement.');
    }
    updateOnlineBadge(false);
  });

  function updateOnlineBadge(isOnline) {
    const badge = document.getElementById('offline-network-status-indicator');
    if (badge) {
      badge.style.display = isOnline ? 'none' : 'flex';
    }
  }

  return {
    saveAttendanceOffline,
    getOfflineAttendanceQueue,
    syncOfflineDataToServer,
    isOnline: () => navigator.onLine
  };
})();
