/** Browser-local ZIP snapshots, independent of the legacy single-robot store. */
export class ProjectStore {
  constructor(indexedDB = globalThis.indexedDB) { this.indexedDB = indexedDB; this.db = null; }
  async open() {
    if (this.db) return this.db;
    if (!this.indexedDB) throw new Error('Browser project storage is unavailable.');
    this.db = await new Promise((resolve, reject) => {
      const request = this.indexedDB.open('mymodelrobot-workcells', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('projects', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Project storage is unavailable.'));
      request.onblocked = () => reject(new Error('Close other workcell tabs to update project storage.'));
    });
    return this.db;
  }
  async transact(mode, operation) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', mode);
      const request = operation(tx.objectStore('projects'));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = tx.onerror = () => reject(tx.error || new Error('Project storage failed.'));
    });
  }
  list() { return this.transact('readonly', store => store.getAll()); }
  get(id) { return this.transact('readonly', store => store.get(id)); }
  put(record) { return this.transact('readwrite', store => store.put(record)); }
  delete(id) { return this.transact('readwrite', store => store.delete(id)); }
}
