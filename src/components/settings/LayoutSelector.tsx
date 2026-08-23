import React from 'react';
import type { LayoutType } from '../../types';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onSelect: (layout: LayoutType) => void;
}

interface LayoutConfig {
  type: LayoutType;
  name: string;
  icon: React.ReactNode;
  slots: { x: number; y: number; w: number; h: number }[];
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ currentLayout, onSelect }) => {
  const layouts: LayoutConfig[] = [
    // === BASIC LAYOUTS ===
    {
      type: 'single',
      name: 'Single',
      slots: [{ x: 10, y: 10, w: 80, h: 80 }],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="10" width="80" height="80" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'two-up',
      name: '2 Photos',
      slots: [
        { x: 5, y: 10, w: 42, h: 80 },
        { x: 53, y: 10, w: 42, h: 80 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="10" width="42" height="80" fill="currentColor" rx="4" />
          <rect x="53" y="10" width="42" height="80" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'grid-2x2',
      name: 'Grid 2x2',
      slots: [
        { x: 5, y: 5, w: 42, h: 42 },
        { x: 53, y: 5, w: 42, h: 42 },
        { x: 5, y: 53, w: 42, h: 42 },
        { x: 53, y: 53, w: 42, h: 42 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="42" height="42" fill="currentColor" rx="2" />
          <rect x="53" y="5" width="42" height="42" fill="currentColor" rx="2" />
          <rect x="5" y="53" width="42" height="42" fill="currentColor" rx="2" />
          <rect x="53" y="53" width="42" height="42" fill="currentColor" rx="2" />
        </svg>
      ),
    },
    {
      type: 'grid-3x3',
      name: 'Grid 3x3',
      slots: [
        { x: 3, y: 3, w: 28, h: 28 },
        { x: 36, y: 3, w: 28, h: 28 },
        { x: 69, y: 3, w: 28, h: 28 },
        { x: 3, y: 36, w: 28, h: 28 },
        { x: 36, y: 36, w: 28, h: 28 },
        { x: 69, y: 36, w: 28, h: 28 },
        { x: 3, y: 69, w: 28, h: 28 },
        { x: 36, y: 69, w: 28, h: 28 },
        { x: 69, y: 69, w: 28, h: 28 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="3" y="3" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="36" y="3" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="69" y="3" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="3" y="36" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="36" y="36" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="69" y="36" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="3" y="69" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="36" y="69" width="28" height="28" fill="currentColor" rx="2" />
          <rect x="69" y="69" width="28" height="28" fill="currentColor" rx="2" />
        </svg>
      ),
    },
    // === PORTFOLIO & CREATIVE ===
    {
      type: 'portfolio',
      name: 'Portfolio',
      slots: [
        { x: 5, y: 10, w: 55, h: 80 },
        { x: 65, y: 10, w: 30, h: 36 },
        { x: 65, y: 54, w: 30, h: 36 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="10" width="55" height="80" fill="currentColor" rx="4" />
          <rect x="65" y="10" width="30" height="36" fill="currentColor" rx="4" />
          <rect x="65" y="54" width="30" height="36" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'scrapbook',
      name: 'Scrapbook',
      slots: [
        { x: 5, y: 5, w: 45, h: 55 },
        { x: 55, y: 5, w: 40, h: 35 },
        { x: 5, y: 65, w: 50, h: 30 },
        { x: 60, y: 45, w: 35, h: 50 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="45" height="55" fill="currentColor" rx="4" />
          <rect x="55" y="5" width="40" height="35" fill="currentColor" rx="4" />
          <rect x="5" y="65" width="50" height="30" fill="currentColor" rx="4" />
          <rect x="60" y="45" width="35" height="50" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'mosaic',
      name: 'Mosaic',
      slots: [
        { x: 5, y: 5, w: 55, h: 55 },
        { x: 65, y: 5, w: 30, h: 30 },
        { x: 65, y: 40, w: 30, h: 55 },
        { x: 5, y: 65, w: 28, h: 30 },
        { x: 36, y: 65, w: 24, h: 30 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="55" height="55" fill="currentColor" rx="4" />
          <rect x="65" y="5" width="30" height="30" fill="currentColor" rx="4" />
          <rect x="65" y="40" width="30" height="55" fill="currentColor" rx="4" />
          <rect x="5" y="65" width="28" height="30" fill="currentColor" rx="4" />
          <rect x="36" y="65" width="24" height="30" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    // === NEW VARIANTS - GRID VARIATIONS ===
    {
      type: 'grid-2-4',
      name: '2 + 4',
      slots: [
        { x: 5, y: 5, w: 90, h: 40 },
        { x: 5, y: 50, w: 42, h: 45 },
        { x: 53, y: 50, w: 42, h: 45 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="90" height="40" fill="currentColor" rx="4" />
          <rect x="5" y="50" width="42" height="45" fill="currentColor" rx="4" />
          <rect x="53" y="50" width="42" height="45" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'grid-4-2',
      name: '4 + 2',
      slots: [
        { x: 5, y: 5, w: 42, h: 40 },
        { x: 53, y: 5, w: 42, h: 40 },
        { x: 5, y: 50, w: 90, h: 45 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="42" height="40" fill="currentColor" rx="4" />
          <rect x="53" y="5" width="42" height="40" fill="currentColor" rx="4" />
          <rect x="5" y="50" width="90" height="45" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'grid-1-2-3',
      name: '1 + 2 + 3',
      slots: [
        { x: 5, y: 5, w: 60, h: 55 },
        { x: 70, y: 5, w: 25, h: 25 },
        { x: 70, y: 35, w: 25, h: 25 },
        { x: 5, y: 65, w: 28, h: 30 },
        { x: 38, y: 65, w: 28, h: 30 },
        { x: 70, y: 65, w: 25, h: 30 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="60" height="55" fill="currentColor" rx="4" />
          <rect x="70" y="5" width="25" height="25" fill="currentColor" rx="4" />
          <rect x="70" y="35" width="25" height="25" fill="currentColor" rx="4" />
          <rect x="5" y="65" width="28" height="30" fill="currentColor" rx="4" />
          <rect x="38" y="65" width="28" height="30" fill="currentColor" rx="4" />
          <rect x="70" y="65" width="25" height="30" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    // === DECORATIVE LAYOUTS ===
    {
      type: 'center-focus',
      name: 'Center Focus',
      slots: [
        { x: 25, y: 25, w: 50, h: 50 },
        { x: 5, y: 5, w: 18, h: 18 },
        { x: 77, y: 5, w: 18, h: 18 },
        { x: 5, y: 77, w: 18, h: 18 },
        { x: 77, y: 77, w: 18, h: 18 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="25" y="25" width="50" height="50" fill="currentColor" rx="4" />
          <rect x="5" y="5" width="18" height="18" fill="currentColor" rx="2" />
          <rect x="77" y="5" width="18" height="18" fill="currentColor" rx="2" />
          <rect x="5" y="77" width="18" height="18" fill="currentColor" rx="2" />
          <rect x="77" y="77" width="18" height="18" fill="currentColor" rx="2" />
        </svg>
      ),
    },
    {
      type: 'puzzle',
      name: 'Puzzle',
      slots: [
        { x: 5, y: 5, w: 40, h: 40 },
        { x: 55, y: 5, w: 40, h: 40 },
        { x: 5, y: 55, w: 40, h: 40 },
        { x: 55, y: 55, w: 40, h: 40 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="40" height="40" fill="currentColor" rx="4" />
          <rect x="55" y="5" width="40" height="40" fill="currentColor" rx="4" />
          <rect x="5" y="55" width="40" height="40" fill="currentColor" rx="4" />
          <rect x="55" y="55" width="40" height="40" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    // === WIDE LAYOUTS ===
    {
      type: 'panorama',
      name: 'Panorama',
      slots: [{ x: 3, y: 30, w: 94, h: 40 }],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="3" y="30" width="94" height="40" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'quad-split',
      name: 'Quad Split',
      slots: [
        { x: 3, y: 3, w: 44, h: 44 },
        { x: 53, y: 3, w: 44, h: 44 },
        { x: 3, y: 53, w: 44, h: 44 },
        { x: 53, y: 53, w: 44, h: 44 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="3" y="3" width="44" height="44" fill="currentColor" rx="4" />
          <rect x="53" y="3" width="44" height="44" fill="currentColor" rx="4" />
          <rect x="3" y="53" width="44" height="44" fill="currentColor" rx="4" />
          <rect x="53" y="53" width="44" height="44" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'featured-duo',
      name: 'Featured Duo',
      slots: [
        { x: 5, y: 15, w: 60, h: 70 },
        { x: 70, y: 5, w: 25, h: 40 },
        { x: 70, y: 50, w: 25, h: 35 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="15" width="60" height="70" fill="currentColor" rx="4" />
          <rect x="70" y="5" width="25" height="40" fill="currentColor" rx="4" />
          <rect x="70" y="50" width="25" height="35" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    // === NEW USER LAYOUTS ===
    {
      type: 'stack-mosaic',
      name: 'Stack Mosaic',
      slots: [
        { x: 5, y: 5, w: 90, h: 35 },
        { x: 5, y: 43, w: 42, h: 26 },
        { x: 53, y: 43, w: 42, h: 26 },
        { x: 5, y: 72, w: 28, h: 23 },
        { x: 36, y: 72, w: 28, h: 23 },
        { x: 67, y: 72, w: 28, h: 23 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="90" height="35" fill="currentColor" rx="4" />
          <rect x="5" y="43" width="42" height="26" fill="currentColor" rx="4" />
          <rect x="53" y="43" width="42" height="26" fill="currentColor" rx="4" />
          <rect x="5" y="72" width="28" height="23" fill="currentColor" rx="2" />
          <rect x="36" y="72" width="28" height="23" fill="currentColor" rx="2" />
          <rect x="67" y="72" width="28" height="23" fill="currentColor" rx="2" />
        </svg>
      ),
    },
    {
      type: 'side-stack',
      name: 'Side Stack',
      slots: [
        { x: 5, y: 5, w: 35, h: 28 },
        { x: 5, y: 36, w: 35, h: 28 },
        { x: 5, y: 67, w: 35, h: 28 },
        { x: 45, y: 5, w: 50, h: 90 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="35" height="28" fill="currentColor" rx="4" />
          <rect x="5" y="36" width="35" height="28" fill="currentColor" rx="4" />
          <rect x="5" y="67" width="35" height="28" fill="currentColor" rx="4" />
          <rect x="45" y="5" width="50" height="90" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'hero-wide',
      name: 'Hero Wide',
      slots: [
        { x: 5, y: 20, w: 90, h: 60 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="20" width="90" height="60" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'featured-side',
      name: 'Featured Side',
      slots: [
        { x: 5, y: 5, w: 55, h: 90 },
        { x: 65, y: 5, w: 30, h: 42 },
        { x: 65, y: 53, w: 30, h: 42 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="55" height="90" fill="currentColor" rx="4" />
          <rect x="65" y="5" width="30" height="42" fill="currentColor" rx="4" />
          <rect x="65" y="53" width="30" height="42" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'double-stack',
      name: 'Double Stack',
      slots: [
        { x: 5, y: 5, w: 42, h: 42 },
        { x: 5, y: 53, w: 42, h: 42 },
        { x: 53, y: 5, w: 42, h: 42 },
        { x: 53, y: 53, w: 42, h: 42 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="42" height="42" fill="currentColor" rx="4" />
          <rect x="5" y="53" width="42" height="42" fill="currentColor" rx="4" />
          <rect x="53" y="5" width="42" height="42" fill="currentColor" rx="4" />
          <rect x="53" y="53" width="42" height="42" fill="currentColor" rx="4" />
        </svg>
      ),
    },
    {
      type: 'split-duo',
      name: 'Split Duo',
      slots: [
        { x: 5, y: 5, w: 35, h: 42 },
        { x: 5, y: 53, w: 35, h: 42 },
        { x: 45, y: 5, w: 50, h: 90 },
      ],
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="35" height="42" fill="currentColor" rx="4" />
          <rect x="5" y="53" width="35" height="42" fill="currentColor" rx="4" />
          <rect x="45" y="5" width="50" height="90" fill="currentColor" rx="4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
      {layouts.map((layout) => (
        <button
          key={layout.type}
          onClick={() => onSelect(layout.type)}
          className={`p-2 rounded-lg border text-left transition-all ${
            currentLayout === layout.type
              ? 'bg-accent/20 border-accent'
              : 'bg-primary border-border hover:border-accent/50'
          }`}
        >
          <div
            className={`w-full aspect-square mb-1 ${
              currentLayout === layout.type ? 'text-accent' : 'text-text-secondary'
            }`}
          >
            {layout.icon}
          </div>
          <div className="text-[10px] text-center text-text-secondary truncate">
            {layout.name}
          </div>
        </button>
      ))}
    </div>
  );
};
