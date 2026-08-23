import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { getLayoutSlots } from '../../utils/layoutTemplates';
import { getPaperDimensionsInPixels } from '../../utils/photoUtils';
import { PhotoEditor } from '../settings';

interface CanvasProps {
  pagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const Canvas: React.FC<CanvasProps> = ({ pagesContainerRef }) => {
  const {
    project,
    photos,
    currentPageIndex,
    zoom,
    selectPhoto,
    selectedPhotoId,
    assignPhotoToPage,
  } = useProjectStore();

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const paperDims = getPaperDimensionsInPixels(project.paperSize, project.orientation);

  // Calculate canvas size with zoom
  const canvasWidth = paperDims.width * zoom;
  const canvasHeight = paperDims.height * zoom;

  // Get placement for editing photo
  const editingPlacement = editingPhotoId
    ? project.pages[currentPageIndex]?.photos.find((p) => p.photoId === editingPhotoId)
    : null;

  const editingPlacementForEditor = editingPlacement
    ? {
        rotation: editingPlacement.rotation,
        brightness: editingPlacement.brightness || 100,
        contrast: editingPlacement.contrast || 100,
      }
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { currentPageIndex, project, setCurrentPage, selectPhoto } = useProjectStore.getState();

      // Arrow keys for page navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentPageIndex > 0) {
          setCurrentPage(currentPageIndex - 1);
        }
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentPageIndex < project.pages.length - 1) {
          setCurrentPage(currentPageIndex + 1);
        }
      }

      // Delete key to deselect
      if (e.key === 'Escape') {
        selectPhoto(null);
        setEditingPhotoId(null);
      }

      // Number keys 1-9 to select photos in slots
      if (e.key >= '1' && e.key <= '9') {
        const slotIndex = parseInt(e.key) - 1;
        const currentPage = project.pages[currentPageIndex];
        if (currentPage) {
          const slots = getLayoutSlots(currentPage.layout);
          if (slotIndex < slots.length) {
            const photoInSlot = currentPage.photos.find((p) => p.slotIndex === slotIndex);
            if (photoInSlot) {
              selectPhoto(photoInSlot.photoId);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle drag over slot
  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(slotIndex);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
  };

  // Handle drop on slot
  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);

    const photoId = e.dataTransfer.getData('photo-id');
    const photoIndex = e.dataTransfer.getData('photo-index');

    if (photoId || photoIndex) {
      // Get photo ID - either from drag data or from index
      let targetPhotoId = photoId;

      if (!targetPhotoId && photoIndex !== '') {
        const photos = useProjectStore.getState().photos;
        const idx = parseInt(photoIndex);
        if (photos[idx]) {
          targetPhotoId = photos[idx].id;
        }
      }

      if (targetPhotoId) {
        assignPhotoToPage(currentPageIndex, slotIndex, targetPhotoId);
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-8 flex items-center justify-center">
      {/* Page Container for PDF Export - includes all pages for export, but only current page visible */}
      <div
        ref={pagesContainerRef}
        className="relative"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: 'none',
        }}
      >
        {project.pages.map((page, pageIndex) => {
          const isCurrentPage = pageIndex === currentPageIndex;
          // Position non-current pages off-screen but keep visible for PDF export
          const leftPosition = isCurrentPage ? 0 : -9999; // Move off-screen but still renderable
          return (
            <div
              key={page.id}
              className="page-canvas absolute bg-white rounded-lg overflow-hidden shadow-2xl"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                left: leftPosition,
                top: 0,
              }}
            >
              <PageContent
                page={page}
                photos={photos}
                slots={getLayoutSlots(page.layout)}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                isCurrentPage={isCurrentPage}
                selectPhoto={selectPhoto}
                selectedPhotoId={selectedPhotoId}
                onDoubleClickPhoto={(photoId) => setEditingPhotoId(photoId)}
                dragOverSlot={isCurrentPage ? dragOverSlot : null}
                onDragOver={isCurrentPage ? (e, slotIndex) => handleDragOver(e, slotIndex) : undefined}
                onDragLeave={isCurrentPage ? handleDragLeave : undefined}
                onDrop={isCurrentPage ? (e, slotIndex) => handleDrop(e, slotIndex) : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* Photo Editor Modal */}
      {editingPhotoId && editingPlacementForEditor && (
        <PhotoEditor
          photoId={editingPhotoId}
          placement={editingPlacementForEditor}
          onClose={() => setEditingPhotoId(null)}
        />
      )}
    </div>
  );
};

interface PageContentProps {
  page: NonNullable<ReturnType<typeof useProjectStore.getState>['project']['pages'][number]>;
  photos: ReturnType<typeof useProjectStore.getState>['photos'];
  slots: { x: number; y: number; width: number; height: number }[];
  canvasWidth: number;
  canvasHeight: number;
  isCurrentPage: boolean;
  selectPhoto: (id: string | null) => void;
  selectedPhotoId: string | null;
  onDoubleClickPhoto?: (photoId: string) => void;
  dragOverSlot: number | null;
  onDragOver?: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, slotIndex: number) => void;
}

const PageContent: React.FC<PageContentProps> = ({
  page,
  photos,
  slots,
  canvasWidth,
  canvasHeight,
  isCurrentPage,
  selectPhoto,
  selectedPhotoId,
  onDoubleClickPhoto,
  dragOverSlot,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: page.backgroundColor }}
      />

      {/* Photo Slots */}
      {slots.map((slot, index) => {
        // Use slotIndex for reliable matching instead of x/y coordinates
        const placement = page.photos.find((p) => p.slotIndex === index);
        const photo = placement ? photos.find((p) => p.id === placement.photoId) : null;

        const slotLeft = (slot.x / 100) * canvasWidth;
        const slotTop = (slot.y / 100) * canvasHeight;
        const slotWidth = (slot.width / 100) * canvasWidth;
        const slotHeight = (slot.height / 100) * canvasHeight;

        const isSelected = placement && selectedPhotoId === placement.photoId;
        const isDragOver = dragOverSlot === index;

        return (
          <div
            key={index}
            className={`absolute transition-all group ${
              isCurrentPage ? 'cursor-pointer' : ''
            } ${
              isDragOver
                ? 'border-2 border-accent bg-accent/20'
                : isSelected
                ? 'border-2 border-accent'
                : 'border-2 border-transparent hover:border-accent/50'
            }`}
            style={{
              left: slotLeft,
              top: slotTop,
              width: slotWidth,
              height: slotHeight,
            }}
            onClick={() => {
              if (isCurrentPage && placement) {
                selectPhoto(placement.photoId === selectedPhotoId ? null : placement.photoId);
              }
            }}
            onDoubleClick={() => {
              if (isCurrentPage && placement && onDoubleClickPhoto) {
                onDoubleClickPhoto(placement.photoId);
              }
            }}
            onDragOver={onDragOver ? (e) => onDragOver(e, index) : undefined}
            onDragLeave={onDragLeave}
            onDrop={onDrop ? (e) => onDrop(e, index) : undefined}
          >
            {photo ? (
              <>
                <img
                  src={photo.dataUrl}
                  alt=""
                  className={`w-full h-full pointer-events-none ${
                    placement?.fitMode === 'contain' ? 'object-contain' :
                    placement?.fitMode === 'fill' ? 'object-fill' :
                    'object-cover'
                  }`}
                  style={{
                    transform: `rotate(${placement?.rotation || 0}deg)`,
                    filter: `brightness(${placement?.brightness || 100}%) contrast(${placement?.contrast || 100}%)`,
                  }}
                  draggable={false}
                />

                {/* Edit Button on Hover */}
                {isCurrentPage && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDoubleClickPhoto) {
                        onDoubleClickPhoto(placement.photoId);
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors"
                    title="Edit photo"
                  >
                    <Pencil size={16} className="text-white" />
                  </button>
                )}

                {/* Slot Number */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white font-medium">
                  {index + 1}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                <span className="text-gray-400 text-lg font-bold">{index + 1}</span>
                <span className="text-gray-400 text-xs">Drop here</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Text Elements */}
      {page.textElements.map((text) => (
        <div
          key={text.id}
          className="absolute pointer-events-none"
          style={{
            left: (text.x / 100) * canvasWidth,
            top: (text.y / 100) * canvasHeight,
            fontSize: text.fontSize * (canvasWidth / 600),
            fontFamily: text.fontFamily,
            color: text.color,
            textAlign: text.alignment,
          }}
        >
          {text.content}
        </div>
      ))}
    </>
  );
};
