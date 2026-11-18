export const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export type AudioLoopMode = 'sequential' | 'all' | 'single';

export const mediaDockState = {
  audioElement: null as HTMLAudioElement | null,
  loadedBookId: null as string | null,
  currentTrackId: null as string | null,
  currentTrackIndex: 0,
  loopMode: 'sequential' as AudioLoopMode,
  isMuted: false,
  previousVolume: 1,
  showRemainingTime: false,
  isPlaylistDrawerOpen: false,
  currentSearchQuery: '',
  currentSpeedIndex: 1,
  abLoopStart: null as number | null,
  abLoopEnd: null as number | null
};

export function formatTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
