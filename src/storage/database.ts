import type {WorkoutRecord} from '../types';

const DATABASE_NAME = 'eye-gym';
const DATABASE_VERSION = 1;
const WORKOUTS_STORE = 'workouts';
const CHANGE_EVENT = 'eye-gym:workouts-changed';

let databasePromise: Promise<IDBDatabase> | null = null;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });
}

export function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(WORKOUTS_STORE)) {
        const store = database.createObjectStore(WORKOUTS_STORE, {keyPath: 'id'});
        store.createIndex('completedAt', 'completedAt');
        store.createIndex('syncedAt', 'syncedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('Unable to open IndexedDB'));
    };
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked by another tab'));
  });
  return databasePromise;
}

function announceChange(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export async function saveWorkout(record: WorkoutRecord): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(WORKOUTS_STORE, 'readwrite');
  transaction.objectStore(WORKOUTS_STORE).put(record);
  await transactionDone(transaction);
  announceChange();
}

export async function listWorkouts(): Promise<WorkoutRecord[]> {
  const database = await openDatabase();
  const transaction = database.transaction(WORKOUTS_STORE, 'readonly');
  const records = await requestResult(transaction.objectStore(WORKOUTS_STORE).getAll() as IDBRequest<WorkoutRecord[]>);
  await transactionDone(transaction);
  return records.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export async function listUnsyncedWorkouts(): Promise<WorkoutRecord[]> {
  return (await listWorkouts()).filter((record) => record.syncedAt === null);
}

export async function markWorkoutsSynced(ids: readonly string[], syncedAt = new Date().toISOString()): Promise<void> {
  if (ids.length === 0) return;
  const records = (await listWorkouts()).filter((record) => ids.includes(record.id));
  const database = await openDatabase();
  const transaction = database.transaction(WORKOUTS_STORE, 'readwrite');
  const store = transaction.objectStore(WORKOUTS_STORE);
  for (const record of records) store.put({...record, syncedAt});
  await transactionDone(transaction);
  announceChange();
}

export async function mergeWorkouts(records: readonly WorkoutRecord[], markAsSynced = true): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(WORKOUTS_STORE, 'readwrite');
  const store = transaction.objectStore(WORKOUTS_STORE);
  const syncedAt = new Date().toISOString();
  for (const record of records) {
    store.put(markAsSynced ? {...record, syncedAt: record.syncedAt ?? syncedAt} : record);
  }
  await transactionDone(transaction);
  announceChange();
}

export async function clearWorkouts(): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(WORKOUTS_STORE, 'readwrite');
  transaction.objectStore(WORKOUTS_STORE).clear();
  await transactionDone(transaction);
  announceChange();
}

export function subscribeToWorkoutChanges(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function closeDatabaseForTests(): void {
  if (!databasePromise) return;
  void databasePromise.then((database) => database.close());
  databasePromise = null;
}
