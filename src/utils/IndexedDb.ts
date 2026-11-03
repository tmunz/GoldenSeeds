/** Open an IndexedDB database, letting the caller create missing object stores on upgrade. */
export function openDatabase(name: string, version: number, onUpgrade: (db: IDBDatabase) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, version);
    const resultOf = (event: Event) => (event.target as unknown as { result: IDBDatabase }).result;
    request.addEventListener('upgradeneeded', (event: Event) => onUpgrade(resultOf(event)));
    request.addEventListener('success', (event: Event) => resolve(resultOf(event)));
    request.addEventListener('error', (event: Event) => reject(event));
  });
}
