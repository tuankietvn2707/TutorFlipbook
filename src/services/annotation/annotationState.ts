import { AnnotationDrawingTool } from '../../types';
import { updateVisualToolStyles } from './annotationStyles';

let currentDrawingTool: AnnotationDrawingTool = 'none';
let inkColor = '#0284C7';
let strokeSize = 3;
let isLaserActive = false;
let isSpotlightActive = false;
let spotlightRadius = 150;

export function setDrawingTool(tool: AnnotationDrawingTool): void {
  currentDrawingTool = tool;
  if (tool !== 'none') {
    isLaserActive = false;
    isSpotlightActive = false;
  }
  updateVisualToolStyles();
}

export function setInkColor(color: string): void {
  inkColor = color;
  if (currentDrawingTool === 'none' || currentDrawingTool === 'eraser') {
    currentDrawingTool = 'pencil';
  }
  updateVisualToolStyles();
}

export function setStrokeSize(size: number): void {
  strokeSize = size;
  updateVisualToolStyles();
}

export function toggleLaser(): boolean {
  isLaserActive = !isLaserActive;
  if (isLaserActive) {
    currentDrawingTool = 'none';
    isSpotlightActive = false;
  }
  updateVisualToolStyles();
  return isLaserActive;
}

export function toggleSpotlight(): boolean {
  isSpotlightActive = !isSpotlightActive;
  if (isSpotlightActive) {
    currentDrawingTool = 'none';
    isLaserActive = false;
  }
  updateVisualToolStyles();
  return isSpotlightActive;
}

export function cycleSpotlightRadius(): number {
  const sizes = [110, 150, 220];
  const next = sizes[(sizes.indexOf(spotlightRadius) + 1) % sizes.length];
  spotlightRadius = next;
  return spotlightRadius;
}

export function getAnnotationState() {
  return {
    currentDrawingTool,
    inkColor,
    strokeSize,
    isLaserActive,
    isSpotlightActive,
    spotlightRadius
  };
}
