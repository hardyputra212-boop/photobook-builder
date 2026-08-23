import type { LayoutType, LayoutTemplate } from '../types';

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // === BASIC ===
  {
    type: 'single',
    name: 'Single',
    icon: '□',
    slots: [{ x: 10, y: 10, width: 80, height: 80 }],
  },
  {
    type: 'two-up',
    name: '2 Photos',
    icon: '▭▭',
    slots: [
      { x: 1, y: 1, width: 48, height: 98 },
      { x: 51, y: 1, width: 48, height: 98 },
    ],
  },
  {
    type: 'grid-2x2',
    name: 'Grid 2x2',
    icon: '▦',
    slots: [
      // Row 1
      { x: 1, y: 1, width: 48, height: 48 },
      { x: 51, y: 1, width: 48, height: 48 },
      // Row 2
      { x: 1, y: 51, width: 48, height: 48 },
      { x: 51, y: 51, width: 48, height: 48 },
    ],
  },
  {
    type: 'grid-3x3',
    name: 'Grid 3x3',
    icon: '9▢',
    slots: [
      // Row 1
      { x: 1, y: 1, width: 32, height: 32 },
      { x: 34, y: 1, width: 32, height: 32 },
      { x: 67, y: 1, width: 32, height: 32 },
      // Row 2
      { x: 1, y: 34, width: 32, height: 32 },
      { x: 34, y: 34, width: 32, height: 32 },
      { x: 67, y: 34, width: 32, height: 32 },
      // Row 3
      { x: 1, y: 67, width: 32, height: 32 },
      { x: 34, y: 67, width: 32, height: 32 },
      { x: 67, y: 67, width: 32, height: 32 },
    ],
  },
  // === PORTFOLIO & CREATIVE ===
  {
    type: 'portfolio',
    name: 'Portfolio',
    icon: '▣▤',
    slots: [
      { x: 5, y: 10, width: 55, height: 80 },
      { x: 65, y: 10, width: 30, height: 36 },
      { x: 65, y: 54, width: 30, height: 36 },
    ],
  },
  {
    type: 'scrapbook',
    name: 'Scrapbook',
    icon: '◇',
    slots: [
      { x: 5, y: 5, width: 45, height: 55 },
      { x: 55, y: 5, width: 40, height: 35 },
      { x: 5, y: 65, width: 50, height: 30 },
      { x: 60, y: 45, width: 35, height: 50 },
    ],
  },
  {
    type: 'mosaic',
    name: 'Mosaic',
    icon: '◆',
    slots: [
      { x: 5, y: 5, width: 55, height: 55 },
      { x: 65, y: 5, width: 30, height: 30 },
      { x: 65, y: 40, width: 30, height: 55 },
      { x: 5, y: 65, width: 28, height: 30 },
      { x: 36, y: 65, width: 24, height: 30 },
    ],
  },
  // === NEW VARIANTS - GRID ===
  {
    type: 'grid-2-4',
    name: '2 + 4',
    icon: '⊟',
    slots: [
      // Top row: 2 slots
      { x: 5, y: 5, width: 42, height: 40 },
      { x: 53, y: 5, width: 42, height: 40 },
      // Bottom row: 4 slots
      { x: 5, y: 50, width: 22, height: 45 },
      { x: 29, y: 50, width: 22, height: 45 },
      { x: 53, y: 50, width: 22, height: 45 },
      { x: 76, y: 50, width: 19, height: 45 },
    ],
  },
  {
    type: 'grid-4-2',
    name: '4 + 2',
    icon: '⊞',
    slots: [
      // Top row: 4 slots
      { x: 5, y: 5, width: 20, height: 40 },
      { x: 28, y: 5, width: 20, height: 40 },
      { x: 51, y: 5, width: 20, height: 40 },
      { x: 74, y: 5, width: 21, height: 40 },
      // Bottom row: 2 slots
      { x: 5, y: 50, width: 45, height: 45 },
      { x: 53, y: 50, width: 42, height: 45 },
    ],
  },
  {
    type: 'grid-1-2-3',
    name: '1 + 2 + 3',
    icon: '⊥',
    slots: [
      // Top: 1 large slot (takes full width)
      { x: 5, y: 5, width: 90, height: 35 },
      // Middle row: 2 slots
      { x: 5, y: 43, width: 42, height: 26 },
      { x: 53, y: 43, width: 42, height: 26 },
      // Bottom row: 3 slots
      { x: 5, y: 72, width: 28, height: 23 },
      { x: 36, y: 72, width: 28, height: 23 },
      { x: 67, y: 72, width: 28, height: 23 },
    ],
  },
  // === DECORATIVE ===
  {
    type: 'center-focus',
    name: 'Center Focus',
    icon: '◎',
    slots: [
      { x: 25, y: 25, width: 50, height: 50 },
      { x: 5, y: 5, width: 18, height: 18 },
      { x: 77, y: 5, width: 18, height: 18 },
      { x: 5, y: 77, width: 18, height: 18 },
      { x: 77, y: 77, width: 18, height: 18 },
    ],
  },
  {
    type: 'puzzle',
    name: 'Puzzle',
    icon: '▣',
    slots: [
      { x: 5, y: 5, width: 40, height: 40 },
      { x: 55, y: 5, width: 40, height: 40 },
      { x: 5, y: 55, width: 40, height: 40 },
      { x: 55, y: 55, width: 40, height: 40 },
    ],
  },
  // === WIDE ===
  {
    type: 'panorama',
    name: 'Panorama',
    icon: '▬',
    slots: [{ x: 3, y: 30, width: 94, height: 40 }],
  },
  {
    type: 'quad-split',
    name: 'Quad Split',
    icon: '▤',
    slots: [
      { x: 3, y: 3, width: 44, height: 44 },
      { x: 53, y: 3, width: 44, height: 44 },
      { x: 3, y: 53, width: 44, height: 44 },
      { x: 53, y: 53, width: 44, height: 44 },
    ],
  },
  {
    type: 'featured-duo',
    name: 'Featured Duo',
    icon: '▢',
    slots: [
      { x: 5, y: 15, width: 60, height: 70 },
      { x: 70, y: 5, width: 25, height: 40 },
      { x: 70, y: 50, width: 25, height: 35 },
    ],
  },
  // === NEW USER LAYOUTS ===
  {
    type: 'stack-mosaic',
    name: 'Stack Mosaic',
    icon: '▤',
    slots: [
      // Top: 1 large slot
      { x: 5, y: 5, width: 90, height: 35 },
      // Middle: 2 slots
      { x: 5, y: 43, width: 42, height: 26 },
      { x: 53, y: 43, width: 42, height: 26 },
      // Bottom: 3 slots
      { x: 5, y: 72, width: 28, height: 23 },
      { x: 36, y: 72, width: 28, height: 23 },
      { x: 67, y: 72, width: 28, height: 23 },
    ],
  },
  {
    type: 'side-stack',
    name: 'Side Stack',
    icon: '▥',
    slots: [
      // Left: 3 stacked slots
      { x: 5, y: 5, width: 35, height: 28 },
      { x: 5, y: 36, width: 35, height: 28 },
      { x: 5, y: 67, width: 35, height: 28 },
      // Right: 1 large slot
      { x: 45, y: 5, width: 50, height: 90 },
    ],
  },
  {
    type: 'hero-wide',
    name: 'Hero Wide',
    icon: '▭',
    slots: [
      { x: 5, y: 20, width: 90, height: 60 },
    ],
  },
  {
    type: 'featured-side',
    name: 'Featured Side',
    icon: '▣',
    slots: [
      // Left: 1 large slot
      { x: 5, y: 5, width: 55, height: 90 },
      // Right: 2 stacked slots
      { x: 65, y: 5, width: 30, height: 42 },
      { x: 65, y: 53, width: 30, height: 42 },
    ],
  },
  // === NEW USER LAYOUTS 2 ===
  {
    type: 'double-stack',
    name: 'Double Stack',
    icon: '▤',
    slots: [
      // Left: 2 stacked slots
      { x: 5, y: 5, width: 42, height: 42 },
      { x: 5, y: 53, width: 42, height: 42 },
      // Right: 2 stacked slots
      { x: 53, y: 5, width: 42, height: 42 },
      { x: 53, y: 53, width: 42, height: 42 },
    ],
  },
  {
    type: 'split-duo',
    name: 'Split Duo',
    icon: '▢',
    slots: [
      // Left: 2 stacked slots
      { x: 5, y: 5, width: 35, height: 42 },
      { x: 5, y: 53, width: 35, height: 42 },
      // Right: 1 large slot
      { x: 45, y: 5, width: 50, height: 90 },
    ],
  },
  // === NEW USER LAYOUTS 3 - From Images ===
  {
    type: 'portrait-large-left',
    name: 'Portrait Large Left',
    icon: '◣',
    slots: [
      // Left: 1 large slot
      { x: 1, y: 1, width: 60, height: 98 },
      // Right: 2 stacked slots on top
      { x: 63, y: 1, width: 36, height: 48 },
      { x: 63, y: 51, width: 36, height: 48 },
    ],
  },
  {
    type: 'landscape-large-top',
    name: 'Landscape Large Top',
    icon: '▄',
    slots: [
      // Top: 1 large slot
      { x: 1, y: 1, width: 98, height: 60 },
      // Bottom: 2 stacked slots
      { x: 1, y: 63, width: 48, height: 36 },
      { x: 51, y: 63, width: 48, height: 36 },
    ],
  },
  {
    type: 'portrait-large-right',
    name: 'Portrait Large Right',
    icon: '◢',
    slots: [
      // Left: 2 stacked slots
      { x: 1, y: 1, width: 36, height: 48 },
      { x: 1, y: 51, width: 36, height: 48 },
      // Right: 1 large slot
      { x: 39, y: 1, width: 60, height: 98 },
    ],
  },
  {
    type: 'landscape-large-bottom',
    name: 'Landscape Large Bottom',
    icon: '▀',
    slots: [
      // Top: 2 stacked slots
      { x: 1, y: 1, width: 48, height: 36 },
      { x: 51, y: 1, width: 48, height: 36 },
      // Bottom: 1 large slot
      { x: 1, y: 39, width: 98, height: 60 },
    ],
  },
];

export function getLayoutTemplate(type: LayoutType): LayoutTemplate {
  return LAYOUT_TEMPLATES.find((t) => t.type === type) || LAYOUT_TEMPLATES[0];
}

export function getLayoutSlots(
  layout: LayoutType
): { x: number; y: number; width: number; height: number }[] {
  const template = getLayoutTemplate(layout);
  return template.slots;
}
