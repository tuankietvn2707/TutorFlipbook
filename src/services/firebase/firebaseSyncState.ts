export interface CloudSyncStatus {
  isSyncing: boolean;
  syncingLabel: string;
  progressPercent: number;
  cloudBookCount: number;
  lastSyncedAt: string | null;
}

type SyncListener = (status: CloudSyncStatus) => void;

const status: CloudSyncStatus = {
  isSyncing: false,
  syncingLabel: '',
  progressPercent: 0,
  cloudBookCount: 0,
  lastSyncedAt: null
};

const listeners = new Set<SyncListener>();

export function getCloudSyncStatus(): CloudSyncStatus {
  return { ...status };
}

export function updateCloudSyncStatus(partial: Partial<CloudSyncStatus>): void {
  Object.assign(status, partial);
  const snapshot = getCloudSyncStatus();
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribeCloudSyncStatus(fn: SyncListener): () => void {
  listeners.add(fn);
  fn(getCloudSyncStatus());
  return () => listeners.delete(fn);
}
