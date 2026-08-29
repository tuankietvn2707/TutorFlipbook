export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  size?: number;
  fileType?: string;
}

export interface Book {
  id: string;
  title: string;
  category: 'textbook' | 'exercise' | 'reference' | string;
  color: 'emerald' | 'sky' | 'purple' | 'amber' | 'red' | string;
  totalPages: number;
  coverImage?: string;
  pages: string[];
  audioTracks?: AudioTrack[];
  videoUrl?: string;
  createdAt: string;
  lastModified?: number;
  isSample?: boolean;
}

export type CategoryFilter = 'all' | 'textbook' | 'exercise' | 'reference';

export type AnnotationDrawingTool = 'none' | 'highlighter' | 'pen-red' | 'pen-blue' | 'eraser';

export interface GoogleDriveManifestEntry {
  id: string;
  title: string;
  category: string;
  color: string;
  totalPages: number;
  audioCount: number;
  lastSynced: string;
}

declare global {
  interface Window {
    pdfjsLib?: any;
    St?: {
      PageFlip: any;
    };
    confetti?: any;
    lucide?: {
      createIcons: () => void;
    };
    google?: any;
    initGoogleDriveAuthClient?: () => void;
  }
}
