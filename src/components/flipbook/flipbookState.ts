import * as PageFlipPkg from 'page-flip';

export const EMPTY_PAGE_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function getPageFlipConstructor(): any {
  return (
    (PageFlipPkg as any)?.PageFlip ||
    (PageFlipPkg as any)?.default?.PageFlip ||
    (PageFlipPkg as any)?.default ||
    (window as any)?.St?.PageFlip ||
    (window as any)?.PageFlip
  );
}

let pageFlipInstance: any = null;
let zoomLevel = 1.0;
let panOffset = { x: 0, y: 0 };
let isPanToolActive = false;

export function getPageFlipInstance(): any {
  return pageFlipInstance;
}

export function setPageFlipInstance(instance: any): void {
  pageFlipInstance = instance;
}

export function getZoomLevel(): number {
  return zoomLevel;
}

export function setZoomLevelState(lvl: number): void {
  zoomLevel = lvl;
}

export function getPanOffset(): { x: number; y: number } {
  return panOffset;
}

export function setPanOffset(x: number, y: number): void {
  panOffset = { x, y };
}

export function getIsPanToolActive(): boolean {
  return isPanToolActive;
}

export function setIsPanToolActive(active: boolean): void {
  isPanToolActive = active;
}
