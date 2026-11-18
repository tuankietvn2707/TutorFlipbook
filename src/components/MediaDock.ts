export { renderMediaDockHtml } from './mediaDock/mediaDockTemplate';
export {
  initMediaDock,
  loadTrack,
  toggleMediaDockVisibility,
  minimizeMediaDock,
  expandMediaDock
} from './mediaDock/mediaDockController';
export {
  togglePlayAudio,
  playLoadedTrack,
  playNextTrack,
  playPrevTrack,
  seekAudioRelative,
  seekAudio,
  setPlaybackRate,
  cycleLoopMode,
  toggleAbLoopPoint
} from './mediaDock/mediaDockTransport';
export { setupMediaDockListeners } from './mediaDock/mediaDockListeners';
