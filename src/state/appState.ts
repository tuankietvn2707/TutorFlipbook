import { Book, CategoryFilter, AudioTrack } from '../types';

interface AppState {
  allBooks: Book[];
  currentBook: Book | null;
  currentCategory: CategoryFilter;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  isPanActive: boolean;
  isTeachingMode: boolean;
  isMediaDockOpen: boolean;
  currentAudioTrack: AudioTrack | null;
  isPlayingAudio: boolean;
  timerSeconds: number;
  timerInterval: number | null;
  pageFlipInstance: any;
}

type Listener<T> = (val: T) => void;

class StateManager {
  private state: AppState = {
    allBooks: [],
    currentBook: null,
    currentCategory: 'all',
    searchQuery: '',
    currentPage: 1,
    totalPages: 1,
    zoomLevel: 1.0,
    panOffset: { x: 0, y: 0 },
    isPanActive: false,
    isTeachingMode: false,
    isMediaDockOpen: false,
    currentAudioTrack: null,
    isPlayingAudio: false,
    timerSeconds: 300,
    timerInterval: null,
    pageFlipInstance: null
  };

  private listeners: { [K in keyof AppState]?: Listener<AppState[K]>[] } = {};

  get<K extends keyof AppState>(key: K): AppState[K] {
    return this.state[key];
  }

  set<K extends keyof AppState>(key: K, value: AppState[K]): void {
    this.state[key] = value;
    if (this.listeners[key]) {
      this.listeners[key]!.forEach(fn => fn(value));
    }
  }

  update(partial: Partial<AppState>): void {
    for (const key in partial) {
      const k = key as keyof AppState;
      this.set(k, partial[k] as any);
    }
  }

  subscribe<K extends keyof AppState>(key: K, fn: Listener<AppState[K]>): () => void {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key]!.push(fn);
    return () => {
      this.listeners[key] = this.listeners[key]!.filter(item => item !== fn);
    };
  }
}

export const appState = new StateManager();
