// Photo types
export type PhotoOrientation = 'portrait' | 'landscape' | 'square';

export interface Photo {
  id: string;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  orientation: PhotoOrientation;
  exifDate?: Date;
  thumbnail?: string;
  name: string;
}

// Text element types
export interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

// Photo placement in a page
export interface PhotoPlacement {
  photoId: string;
  slotIndex: number; // Index in the layout for reliable matching
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  fitMode: 'cover' | 'contain' | 'fill';
  brightness?: number; // 50-150, default 100
  contrast?: number; // 50-150, default 100
}

// Layout types
export type LayoutType =
  | 'single'
  | 'two-up'
  | 'grid-2x2'
  | 'grid-3x3'
  | 'portfolio'
  | 'scrapbook'
  | 'mosaic'
  | 'grid-2-4'
  | 'grid-4-2'
  | 'grid-1-2-3'
  | 'center-focus'
  | 'puzzle'
  | 'panorama'
  | 'quad-split'
  | 'featured-duo'
  | 'stack-mosaic'
  | 'side-stack'
  | 'hero-wide'
  | 'featured-side'
  | 'double-stack'
  | 'split-duo'
  | 'portrait-large-left'
  | 'landscape-large-top'
  | 'portrait-large-right'
  | 'landscape-large-bottom';

// Paper size types
export type PaperSize = 'A4' | 'A5' | 'LETTER' | 'SQUARE' | 'CUSTOM';
export type Orientation = 'portrait' | 'landscape';

// Page interface
export interface Page {
  id: string;
  layout: LayoutType;
  photos: PhotoPlacement[];
  textElements: TextElement[];
  backgroundColor: string;
}

// Project interface
export interface Project {
  id: string;
  name: string;
  paperSize: PaperSize;
  orientation: Orientation;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
}

// Layout template interface
export interface LayoutTemplate {
  type: LayoutType;
  name: string;
  icon: string;
  slots: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

// Paper size dimensions in mm
export interface PaperDimensions {
  width: number;
  height: number;
}

export const PAPER_SIZES: Record<PaperSize, PaperDimensions> = {
  'A4': { width: 210, height: 297 },
  'A5': { width: 148, height: 210 },
  'LETTER': { width: 215.9, height: 279.4 },
  'SQUARE': { width: 203.2, height: 203.2 },
  'CUSTOM': { width: 210, height: 297 },
};

// UI State types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
