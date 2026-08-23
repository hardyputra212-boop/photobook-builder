import React, { useMemo, useState } from 'react';
import { Upload, Trash2, Calendar, GripVertical, Image as ImageIcon, Zap, Layers, Sparkles, Target } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { DropZone } from '../common';
import { processUploadedFiles, formatDate, formatFileSize } from '../../utils/photoUtils';

export const Sidebar: React.FC = () => {
  const {
    photos,
    project,
    addPhotos,
    removePhoto,
    reorderPhotos,
    autoArrangePhotos,
    smartArrangePhotos,
    arrangePhotosToPageCount,
    quickFillSlots,
    selectPhoto,
    selectedPhotoId,
    addToast,
  } = useProjectStore();

  const [targetPageCount, setTargetPageCount] = useState<number>(3);

  // Count assigned and unassigned photos across ALL pages
  const { assignedCount, totalSlots, unassignedCount } = useMemo(() => {
    let assigned = 0;
    let total = 0;

    for (const page of project.pages) {
      const slotsCount = getLayoutSlotCount(page.layout);
      total += slotsCount;
      assigned += page.photos.length;
    }

    return {
      assignedCount: assigned,
      totalSlots: total,
      unassignedCount: Math.max(0, photos.length - assigned),
    };
  }, [project.pages, photos]);

  const handleFilesSelected = async (files: FileList, folderOrder?: string[]) => {
    try {
      const newPhotos = await processUploadedFiles(files);
      if (newPhotos.length > 0) {
        addPhotos(newPhotos);
        if (folderOrder && folderOrder.length > 1) {
          addToast('success', `Added ${newPhotos.length} photos from ${folderOrder.length} folders`);
        } else {
          addToast('success', `Added ${newPhotos.length} photo(s)`);
        }
      } else {
        addToast('error', 'No valid photos found');
      }
    } catch (error) {
      addToast('error', 'Failed to process photos');
    }
  };

  const handleQuickFill = () => {
    const result = quickFillSlots();
    if (result.filled > 0) {
      addToast('success', `Filled ${result.filled} slot(s) with ${result.used} photo(s)`);
    } else {
      addToast('info', 'No empty slots to fill');
    }
  };

  const handleSmartArrange = () => {
    smartArrangePhotos();
    addToast('success', 'Smart Arrange completed! Layouts auto-selected based on photo orientation.');
  };

  const handleArrangeToPageCount = () => {
    if (photos.length === 0) {
      addToast('error', 'No photos to arrange');
      return;
    }
    if (targetPageCount < 1) {
      addToast('error', 'Page count must be at least 1');
      return;
    }
    arrangePhotosToPageCount(targetPageCount);
    addToast('success', `Arranged ${photos.length} photos into ${targetPageCount} pages!`);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('photo-index', index.toString());
    e.dataTransfer.setData('photo-id', photos[index]?.id || '');
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('photo-index'));
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      reorderPhotos(sourceIndex, targetIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <aside className="w-72 bg-surface border-r border-border flex flex-col h-full">
      {/* Upload Section */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Upload size={16} />
          Upload Photos
        </h3>
        <DropZone onFilesSelected={handleFilesSelected} />
      </div>

      {/* Photo List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <ImageIcon size={16} />
              Photos ({photos.length})
            </h3>
          </div>

          {photos.length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-4">
              No photos uploaded yet
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => selectPhoto(photo.id)}
                  className={`photo-thumbnail flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    selectedPhotoId === photo.id
                      ? 'bg-accent/20 border border-accent'
                      : 'bg-primary hover:bg-primary/80 border border-transparent'
                  }`}
                >
                  {/* Drag Handle */}
                  <GripVertical size={12} className="text-text-secondary cursor-grab flex-shrink-0" />

                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-background">
                    <img
                      src={photo.thumbnail || photo.dataUrl}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{photo.name}</p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      {photo.exifDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={8} />
                          {formatDate(photo.exifDate)}
                        </span>
                      ) : (
                        <span className="truncate">{formatFileSize(photo.file?.size || 0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {photos.length > 0 && (
        <div className="p-4 border-t border-border space-y-2">
          {/* Smart Arrange Button */}
          <button
            onClick={handleSmartArrange}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium transition-all"
          >
            <Sparkles size={16} />
            <span>Smart Arrange (Auto Layout)</span>
          </button>

          {/* Set Page Count */}
          <div className="bg-primary rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-white">
                <Target size={14} />
                <span>Set Page Count</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTargetPageCount(Math.max(1, targetPageCount - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-surface hover:bg-accent/20 text-text-secondary hover:text-white transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetPageCount}
                  onChange={(e) => setTargetPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 h-6 text-center bg-surface border border-border rounded text-sm text-white focus:outline-none focus:border-accent"
                />
                <button
                  onClick={() => setTargetPageCount(Math.min(100, targetPageCount + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-surface hover:bg-accent/20 text-text-secondary hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleArrangeToPageCount}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-all"
            >
              <Target size={14} />
              <span>Apply to {targetPageCount} Page{targetPageCount > 1 ? 's' : ''}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleQuickFill}
              disabled={unassignedCount === 0 || totalSlots - assignedCount === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Zap size={14} />
              <span>Fill</span>
            </button>

            <button
              onClick={autoArrangePhotos}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface border border-border hover:border-accent/50 text-white font-medium transition-all text-sm"
            >
              <Layers size={14} />
              <span>Arrange All</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {photos.length > 0 && (
        <div className="p-4 border-t border-border bg-primary/50">
          <div className="text-xs text-text-secondary space-y-1">
            <p>
              <span className="text-white">{photos.length}</span> photos uploaded
            </p>
            <p>
              <span className="text-white">{project.pages.length}</span> pages, <span className="text-white">{totalSlots}</span> slots
            </p>
            <p>
              <span className="text-white">{assignedCount}</span> assigned, <span className="text-white">{totalSlots - assignedCount}</span> empty
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

// Helper function to get slot count for a layout
function getLayoutSlotCount(layout: string): number {
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
