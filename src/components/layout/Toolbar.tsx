import React from 'react';
import { Layout, FileText, RotateCw, RotateCcw, ZoomIn, ZoomOut, Plus, Trash2, Copy } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../common';
import { LayoutSelector } from '../settings';
import type { PaperSize, LayoutType } from '../../types';
import { PAPER_SIZES } from '../../types';

export const Toolbar: React.FC = () => {
  const {
    project,
    currentPageIndex,
    setPageLayout,
    setPagesLayout,
    setPaperSize,
    setOrientation,
    addPage,
    removePage,
    duplicatePage,
    zoom,
    setZoom,
    photos,
    assignPhotoToPage,
    selectedPhotoId,
    updatePagePhoto,
  } = useProjectStore();

  const currentPage = project.pages[currentPageIndex];

  // Batch selection state
  const [selectedPages, setSelectedPages] = React.useState<Set<number>>(new Set());

  const handleRotate = (degrees: number) => {
    if (!selectedPhotoId || !currentPage) return;

    const photoPlacement = currentPage.photos.find((p) => p.photoId === selectedPhotoId);
    if (photoPlacement) {
      updatePagePhoto(currentPageIndex, {
        ...photoPlacement,
        rotation: (photoPlacement.rotation + degrees) % 360,
      });
    }
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  const applyLayoutToSelected = (layout: LayoutType) => {
    if (selectedPages.size === 0) {
      // Apply to current page only
      setPageLayout(currentPageIndex, layout);
    } else {
      // Apply to selected pages
      const pagesToUpdate = selectedPages.has(currentPageIndex)
        ? Array.from(selectedPages)
        : [currentPageIndex, ...Array.from(selectedPages)];
      setPagesLayout(pagesToUpdate, layout);
      setSelectedPages(new Set());
    }
  };

  const handleDuplicatePage = () => {
    duplicatePage(currentPageIndex);
  };

  return (
    <aside className="w-72 bg-surface border-l border-border flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Visual Layout Selection */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Layout size={16} />
            Layout
          </h3>

          {/* Batch Apply Controls */}
          {project.pages.length > 1 && (
            <div className="mb-3 flex items-center gap-2 text-xs">
              <span className="text-text-secondary">
                {selectedPages.size > 0 ? `${selectedPages.size} pages selected` : 'Click to select'}
              </span>
              {selectedPages.size > 0 && (
                <button
                  onClick={deselectAllPages}
                  className="text-accent hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <LayoutSelector
            currentLayout={currentPage?.layout || 'single'}
            onSelect={applyLayoutToSelected}
          />

          {selectedPages.size > 0 && (
            <p className="text-xs text-accent mt-2">
              Layout will apply to {selectedPages.size + 1} pages
            </p>
          )}
        </div>

        {/* Paper Size */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <FileText size={16} />
            Paper Size
          </h3>
          <div className="space-y-2">
            {Object.keys(PAPER_SIZES).filter(size => size !== 'CUSTOM').map((size) => (
              <button
                key={size}
                onClick={() => setPaperSize(size as PaperSize)}
                className={`w-full p-2 rounded-lg border text-left transition-all ${
                  project.paperSize === size
                    ? 'bg-accent/20 border-accent'
                    : 'bg-primary border-border hover:border-accent/50'
                }`}
              >
                <div className="text-sm text-white">{size}</div>
                <div className="text-xs text-text-secondary">
                  {PAPER_SIZES[size as PaperSize].width} x {PAPER_SIZES[size as PaperSize].height} mm
                </div>
              </button>
            ))}
          </div>

          {/* Orientation */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setOrientation('portrait')}
              className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                project.orientation === 'portrait'
                  ? 'bg-accent/20 border-accent'
                  : 'bg-primary border-border hover:border-accent/50'
              }`}
            >
              <div className="w-6 h-8 mx-auto border-2 border-current rounded mb-1" />
              <div className="text-xs text-text-secondary">Portrait</div>
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                project.orientation === 'landscape'
                  ? 'bg-accent/20 border-accent'
                  : 'bg-primary border-border hover:border-accent/50'
              }`}
            >
              <div className="w-8 h-5 mx-auto border-2 border-current rounded mb-1" />
              <div className="text-xs text-text-secondary">Landscape</div>
            </button>
          </div>
        </div>

        {/* Photo Actions */}
        {selectedPhotoId && (
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Photo Actions</h3>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRotate(-90)}
                icon={<RotateCcw size={14} />}
              >
                -90°
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRotate(90)}
                icon={<RotateCw size={14} />}
              >
                +90°
              </Button>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <ZoomIn size={16} />
            Zoom: {Math.round(zoom * 100)}%
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setZoom(zoom - 0.25)}
              icon={<ZoomOut size={14} />}
              disabled={zoom <= 0.25}
            />
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-accent"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setZoom(zoom + 0.25)}
              icon={<ZoomIn size={14} />}
              disabled={zoom >= 2}
            />
          </div>
        </div>

        {/* Page Management */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Pages</h3>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => addPage()}
              icon={<Plus size={14} />}
              className="flex-1"
            >
              Add
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDuplicatePage}
              icon={<Copy size={14} />}
              title="Duplicate current page"
            />
            <Button
              variant="danger"
              size="sm"
              onClick={() => removePage(currentPageIndex)}
              icon={<Trash2 size={14} />}
              disabled={project.pages.length <= 1}
            />
          </div>
        </div>

        {/* Assign Photo to Slot */}
        {photos.length > 0 && currentPage && (
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Assign to Slot</h3>
            <div className="space-y-1">
              {Array.from({ length: getSlotCount(currentPage.layout) }).map((_, index) => {
                const assignedPhoto = currentPage.photos.find((p) => p.slotIndex === index);
                return (
                  <button
                    key={index}
                    onClick={() => {
                      const unassigned = photos.find(
                        (p) => !currentPage.photos.some((cp) => cp.photoId === p.id)
                      );
                      if (unassigned) {
                        assignPhotoToPage(currentPageIndex, index, unassigned.id);
                      } else if (photos.length > 0) {
                        assignPhotoToPage(currentPageIndex, index, photos[0].id);
                      }
                    }}
                    className="w-full p-2 rounded-lg border bg-primary border-border hover:border-accent/50 text-left text-sm text-text-secondary transition-all"
                  >
                    Slot {index + 1}: {assignedPhoto ? 'Filled' : 'Empty'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-auto p-4 border-t border-border bg-primary/50">
        <div className="text-xs text-text-secondary space-y-1">
          <p>
            <span className="text-white">{project.pages.length}</span> pages
          </p>
          <p>
            Current: Page {currentPageIndex + 1} of {project.pages.length}
          </p>
        </div>
      </div>
    </aside>
  );
};

// Helper function to get slot count for a layout
function getSlotCount(layout: LayoutType): number {
  switch (layout) {
    case 'single': return 1;
    case 'two-up': return 2;
    case 'grid-2x2': return 4;
    case 'grid-3x3': return 9;
    case 'portfolio': return 3;
    case 'scrapbook': return 4;
    case 'mosaic': return 5;
    case 'grid-2-4': return 6;
    case 'grid-4-2': return 6;
    case 'grid-1-2-3': return 6;
    case 'center-focus': return 5;
    case 'puzzle': return 4;
    case 'panorama': return 1;
    case 'quad-split': return 4;
    case 'featured-duo': return 3;
    case 'stack-mosaic': return 6;
    case 'side-stack': return 4;
    case 'hero-wide': return 1;
    case 'featured-side': return 3;
    case 'double-stack': return 4;
    case 'split-duo': return 3;
    case 'portrait-large-left': return 3;
    case 'landscape-large-top': return 3;
    case 'portrait-large-right': return 3;
    case 'landscape-large-bottom': return 3;
    default: return 1;
  }
}
