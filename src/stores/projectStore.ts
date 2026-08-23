import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Photo,
  Page,
  Project,
  LayoutType,
  PaperSize,
  Orientation,
  PhotoPlacement,
  TextElement,
  ToastMessage,
} from '../types';

interface ProjectState {
  // Project data
  project: Project;
  photos: Photo[];
  currentPageIndex: number;
  selectedPhotoId: string | null;

  // UI State
  isLoading: boolean;
  isExporting: boolean;
  exportProgress: number;
  toasts: ToastMessage[];
  zoom: number;

  // Project actions
  setProjectName: (name: string) => void;
  setPaperSize: (size: PaperSize) => void;
  setOrientation: (orientation: Orientation) => void;
  resetProject: () => void;

  // Photo actions
  addPhotos: (photos: Photo[]) => void;
  removePhoto: (photoId: string) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  selectPhoto: (photoId: string | null) => void;

  // Page actions
  addPage: (layout?: LayoutType) => void;
  removePage: (pageIndex: number) => void;
  setCurrentPage: (index: number) => void;
  setPageLayout: (pageIndex: number, layout: LayoutType) => void;
  setPagesLayout: (pageIndices: number[], layout: LayoutType) => void;
  updatePagePhoto: (pageIndex: number, placement: PhotoPlacement) => void;
  assignPhotoToPage: (pageIndex: number, slotIndex: number, photoId: string) => void;
  removePhotoFromSlot: (pageIndex: number, slotIndex: number) => void;
  duplicatePage: (pageIndex: number) => void;

  // Text actions
  addTextToPage: (pageIndex: number, text: Partial<TextElement>) => void;
  updateTextElement: (pageIndex: number, textId: string, updates: Partial<TextElement>) => void;
  removeTextElement: (pageIndex: number, textId: string) => void;

  // Auto-arrange
  autoArrangePhotos: () => void;
  smartArrangePhotos: () => void;
  arrangePhotosToPageCount: (count: number) => void;
  quickFillSlots: () => { filled: number; used: number };

  // UI actions
  setLoading: (loading: boolean) => void;
  setExporting: (exporting: boolean, progress?: number) => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  setZoom: (zoom: number) => void;

  // Export/Import
  exportProjectJSON: () => string;
  importProjectJSON: (json: string) => void;
}

const createInitialProject = (): Project => ({
  id: uuidv4(),
  name: 'Untitled Photobook',
  paperSize: 'A4',
  orientation: 'portrait',
  pages: [createEmptyPage()],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createEmptyPage = (layout: LayoutType = 'single'): Page => ({
  id: uuidv4(),
  layout,
  photos: [],
  textElements: [],
  backgroundColor: '#FFFFFF',
});

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  project: createInitialProject(),
  photos: [],
  currentPageIndex: 0,
  selectedPhotoId: null,
  isLoading: false,
  isExporting: false,
  exportProgress: 0,
  toasts: [],
  zoom: 1,

  // Project actions
  setProjectName: (name) =>
    set((state) => ({
      project: { ...state.project, name, updatedAt: new Date() },
    })),

  setPaperSize: (size) =>
    set((state) => ({
      project: { ...state.project, paperSize: size, updatedAt: new Date() },
    })),

  setOrientation: (orientation) =>
    set((state) => ({
      project: { ...state.project, orientation, updatedAt: new Date() },
    })),

  resetProject: () =>
    set({
      project: createInitialProject(),
      photos: [],
      currentPageIndex: 0,
      selectedPhotoId: null,
    }),

  // Photo actions
  addPhotos: (newPhotos) =>
    set((state) => ({
      photos: [...state.photos, ...newPhotos],
      project: { ...state.project, updatedAt: new Date() },
    })),

  removePhoto: (photoId) =>
    set((state) => {
      // Remove photo from all pages
      const updatedPages = state.project.pages.map((page) => ({
        ...page,
        photos: page.photos.filter((p) => p.photoId !== photoId),
      }));

      return {
        photos: state.photos.filter((p) => p.id !== photoId),
        project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
        selectedPhotoId: state.selectedPhotoId === photoId ? null : state.selectedPhotoId,
      };
    }),

  reorderPhotos: (fromIndex, toIndex) =>
    set((state) => {
      const photos = [...state.photos];
      const [removed] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, removed);
      return { photos };
    }),

  selectPhoto: (photoId) => set({ selectedPhotoId: photoId }),

  // Page actions
  addPage: (layout) =>
    set((state) => {
      const newPage = createEmptyPage(layout || state.project.pages[0]?.layout || 'single');
      return {
        project: {
          ...state.project,
          pages: [...state.project.pages, newPage],
          updatedAt: new Date(),
        },
        currentPageIndex: state.project.pages.length,
      };
    }),

  removePage: (pageIndex) =>
    set((state) => {
      if (state.project.pages.length <= 1) return state;
      const pages = state.project.pages.filter((_, i) => i !== pageIndex);
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
        currentPageIndex: Math.min(state.currentPageIndex, pages.length - 1),
      };
    }),

  setCurrentPage: (index) => set({ currentPageIndex: index }),

  setPageLayout: (pageIndex, layout) =>
    set((state) => {
      console.log('🔄 setPageLayout called:', { pageIndex, layout, pagesCount: state.project.pages.length });

      const pages = [...state.project.pages];
      const oldPhotos = pages[pageIndex]?.photos || [];
      console.log('📸 Old photos:', oldPhotos.length);

      // Clear photos from the page with new layout
      pages[pageIndex] = { ...pages[pageIndex], layout, photos: [] };

      // Automatically redistribute old photos to empty slots across all pages
      // Priority: fill earliest pages first, delete empty pages
      const updatedPages = redistributePhotosWithPriority(pages, oldPhotos, pageIndex);
      console.log('📄 Updated pages:', updatedPages.length);

      const photoCount = oldPhotos.length;
      const deletedPages = pages.length - updatedPages.length;
      const newToast: ToastMessage = {
        id: uuidv4(),
        type: 'success',
        message: photoCount > 0
          ? `Layout changed. ${photoCount} photo(s) redistributed.${deletedPages > 0 ? ` ${deletedPages} empty page(s) removed.` : ''}`
          : 'Layout changed.',
      };

      return {
        project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
        toasts: [...state.toasts, newToast],
      };
    }),

  setPagesLayout: (pageIndices, layout) =>
    set((state) => {
      const pages = [...state.project.pages];
      let totalCleared = 0;
      const clearedPhotos: PhotoPlacement[] = [];

      // Clear photos from all affected pages
      for (const index of pageIndices) {
        if (index >= 0 && index < pages.length) {
          const pagePhotos = pages[index]?.photos || [];
          totalCleared += pagePhotos.length;
          clearedPhotos.push(...pagePhotos);
          pages[index] = { ...pages[index], layout, photos: [] };
        }
      }

      // Automatically redistribute cleared photos to empty slots
      // Use the first affected page as reference for priority
      const firstAffectedPage = Math.min(...pageIndices);
      const updatedPages = redistributePhotosWithPriority(pages, clearedPhotos, firstAffectedPage);

      const deletedPages = pages.length - updatedPages.length;
      const newToast: ToastMessage = {
        id: uuidv4(),
        type: 'success',
        message: totalCleared > 0
          ? `Layout applied. ${totalCleared} photo(s) redistributed.${deletedPages > 0 ? ` ${deletedPages} empty page(s) removed.` : ''}`
          : `Layout applied to ${pageIndices.length} page(s).`,
      };

      return {
        project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
        toasts: [...state.toasts, newToast],
      };
    }),

  duplicatePage: (pageIndex) =>
    set((state) => {
      const pages = [...state.project.pages];
      const sourcePage = pages[pageIndex];
      if (!sourcePage) return state;

      const newPage: Page = {
        id: uuidv4(),
        layout: sourcePage.layout,
        photos: sourcePage.photos.map((p) => ({ ...p })),
        textElements: sourcePage.textElements.map((t) => ({ ...t, id: uuidv4() })),
        backgroundColor: sourcePage.backgroundColor,
      };

      // Insert after the source page
      pages.splice(pageIndex + 1, 0, newPage);

      return {
        project: { ...state.project, pages, updatedAt: new Date() },
        currentPageIndex: pageIndex + 1,
      };
    }),

  updatePagePhoto: (pageIndex, placement) =>
    set((state) => {
      const pages = [...state.project.pages];
      const page = { ...pages[pageIndex] };
      const photoIndex = page.photos.findIndex((p) => p.photoId === placement.photoId);
      if (photoIndex >= 0) {
        page.photos[photoIndex] = placement;
      } else {
        page.photos.push(placement);
      }
      pages[pageIndex] = page;
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
      };
    }),

  assignPhotoToPage: (pageIndex, slotIndex, photoId) =>
    set((state) => {
      const pages = [...state.project.pages];
      const page = { ...pages[pageIndex] };

      // Remove photo from its current slot if any
      page.photos = page.photos.filter((p) => p.photoId !== photoId);

      // Get layout slots for this page
      const layoutSlots = getLayoutSlots(page.layout);
      if (slotIndex < layoutSlots.length) {
        const slot = layoutSlots[slotIndex];
        page.photos.push({
          photoId,
          slotIndex, // Store the slot index for reliable matching
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          rotation: 0,
          cropX: 0,
          cropY: 0,
          cropWidth: 100,
          cropHeight: 100,
          fitMode: 'cover',
        });
      }

      pages[pageIndex] = page;
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
      };
    }),

  removePhotoFromSlot: (pageIndex, slotIndex) =>
    set((state) => {
      const pages = [...state.project.pages];
      const page = { ...pages[pageIndex] };

      // Remove photo from the specified slot
      page.photos = page.photos.filter((p) => p.slotIndex !== slotIndex);

      pages[pageIndex] = page;
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
      };
    }),

  // Text actions
  addTextToPage: (pageIndex, text) =>
    set((state) => {
      const pages = [...state.project.pages];
      const page = { ...pages[pageIndex] };
      page.textElements.push({
        id: uuidv4(),
        content: '',
        x: 50,
        y: 50,
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#000000',
        alignment: 'center',
        ...text,
      });
      pages[pageIndex] = page;
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
      };
    }),

  updateTextElement: (pageIndex, textId, updates) =>
    set((state) => {
      const pages = [...state.project.pages];
      const page = { ...pages[pageIndex] };
      const textIndex = page.textElements.findIndex((t) => t.id === textId);
      if (textIndex >= 0) {
        page.textElements[textIndex] = { ...page.textElements[textIndex], ...updates };
        pages[pageIndex] = page;
      }
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
      };
    }),

  removeTextElement: (pageIndex, textId) =>
    set((state) => {
      const pages = [...state.project.pages];
      const page = { ...pages[pageIndex] };
      page.textElements = page.textElements.filter((t) => t.id !== textId);
      pages[pageIndex] = page;
      return {
        project: { ...state.project, pages, updatedAt: new Date() },
      };
    }),

  // Auto-arrange
  autoArrangePhotos: () =>
    set((state) => {
      const { photos, project } = state;
      if (photos.length === 0) return state;

      // Sort photos by EXIF date
      const sortedPhotos = [...photos].sort((a, b) => {
        const dateA = a.exifDate ? new Date(a.exifDate).getTime() : 0;
        const dateB = b.exifDate ? new Date(b.exifDate).getTime() : 0;
        return dateA - dateB;
      });

      // Get photos per page based on first page layout
      const photosPerPage = getPhotosPerPage(project.pages[0]?.layout || 'single');
      const newPages: Page[] = [];

      for (let i = 0; i < sortedPhotos.length; i += photosPerPage) {
        const pagePhotos = sortedPhotos.slice(i, i + photosPerPage);
        const layout = project.pages[newPages.length]?.layout || 'single';
        const slots = getLayoutSlots(layout);

        const page: Page = {
          id: uuidv4(),
          layout,
          photos: pagePhotos.map((photo, idx) => {
            const slot = slots[idx] || slots[0];
            return {
              photoId: photo.id,
              slotIndex: idx,
              x: slot.x,
              y: slot.y,
              width: slot.width,
              height: slot.height,
              rotation: 0,
              cropX: 0,
              cropY: 0,
              cropWidth: 100,
              cropHeight: 100,
              fitMode: 'cover' as const,
            };
          }),
          textElements: [],
          backgroundColor: '#FFFFFF',
        };

        newPages.push(page);
      }

      return {
        project: { ...project, pages: newPages, updatedAt: new Date() },
        currentPageIndex: 0,
      };
    }),

  // Smart Arrange - Auto-select layout based on photo orientation
  smartArrangePhotos: () =>
    set((state) => {
      const { photos, project } = state;
      if (photos.length === 0) return state;

      // Sort photos by EXIF date
      const sortedPhotos = [...photos].sort((a, b) => {
        const dateA = a.exifDate ? new Date(a.exifDate).getTime() : 0;
        const dateB = b.exifDate ? new Date(b.exifDate).getTime() : 0;
        return dateA - dateB;
      });

      // Group photos by orientation
      const portraitPhotos = sortedPhotos.filter(p => p.orientation === 'portrait');
      const landscapePhotos = sortedPhotos.filter(p => p.orientation === 'landscape');
      const squarePhotos = sortedPhotos.filter(p => p.orientation === 'square');

      const newPages: Page[] = [];

      // Helper to create page with layout
      const createPage = (layout: LayoutType, pagePhotos: typeof sortedPhotos): Page => {
        const slots = getLayoutSlots(layout);
        return {
          id: uuidv4(),
          layout,
          photos: pagePhotos.map((photo, idx) => {
            const slot = slots[idx] || slots[0];
            return {
              photoId: photo.id,
              slotIndex: idx,
              x: slot.x,
              y: slot.y,
              width: slot.width,
              height: slot.height,
              rotation: 0,
              cropX: 0,
              cropY: 0,
              cropWidth: 100,
              cropHeight: 100,
              fitMode: 'cover' as const,
            };
          }),
          textElements: [],
          backgroundColor: '#FFFFFF',
        };
      };

      // Layout preferences based on photo orientation
      const portraitLayouts: LayoutType[] = ['single', 'two-up', 'grid-2x2', 'grid-3x3', 'portfolio', 'grid-2-4'];
      const landscapeLayouts: LayoutType[] = ['single', 'two-up', 'panorama', 'quad-split', 'featured-duo', 'hero-wide'];
      const squareLayouts: LayoutType[] = ['single', 'two-up', 'grid-2x2', 'grid-3x3', 'puzzle', 'mosaic', 'center-focus'];

      // Helper to get page capacity
      const getPageCapacity = (layout: LayoutType): number => {
        return getLayoutSlots(layout).length;
      };

      // Try to create pages that are completely filled
      // Strategy: Sort layouts by capacity, fill pages completely

      const layoutCapacities = {
        portrait: portraitLayouts.map(l => ({ layout: l, capacity: getPageCapacity(l) })).sort((a, b) => b.capacity - a.capacity),
        landscape: landscapeLayouts.map(l => ({ layout: l, capacity: getPageCapacity(l) })).sort((a, b) => b.capacity - a.capacity),
        square: squareLayouts.map(l => ({ layout: l, capacity: getPageCapacity(l) })).sort((a, b) => b.capacity - a.capacity),
      };

      // Process each orientation group - only create FULL pages
      // Portrait photos
      let photoIndex = 0;
      while (photoIndex < portraitPhotos.length) {
        const remaining = portraitPhotos.length - photoIndex;
        let bestLayout: LayoutType = 'single';
        let fillCount = 1;

        // Find largest layout that fits exactly or has remaining capacity
        for (const { layout, capacity } of layoutCapacities.portrait) {
          if (capacity <= remaining) {
            bestLayout = layout;
            fillCount = capacity;
            break;
          }
        }

        const pagePhotos = portraitPhotos.slice(photoIndex, photoIndex + fillCount);
        newPages.push(createPage(bestLayout, pagePhotos));
        photoIndex += fillCount;
      }

      // Landscape photos
      photoIndex = 0;
      while (photoIndex < landscapePhotos.length) {
        const remaining = landscapePhotos.length - photoIndex;
        let bestLayout: LayoutType = 'single';
        let fillCount = 1;

        for (const { layout, capacity } of layoutCapacities.landscape) {
          if (capacity <= remaining) {
            bestLayout = layout;
            fillCount = capacity;
            break;
          }
        }

        const pagePhotos = landscapePhotos.slice(photoIndex, photoIndex + fillCount);
        newPages.push(createPage(bestLayout, pagePhotos));
        photoIndex += fillCount;
      }

      // Square photos
      photoIndex = 0;
      while (photoIndex < squarePhotos.length) {
        const remaining = squarePhotos.length - photoIndex;
        let bestLayout: LayoutType = 'single';
        let fillCount = 1;

        for (const { layout, capacity } of layoutCapacities.square) {
          if (capacity <= remaining) {
            bestLayout = layout;
            fillCount = capacity;
            break;
          }
        }

        const pagePhotos = squarePhotos.slice(photoIndex, photoIndex + fillCount);
        newPages.push(createPage(bestLayout, pagePhotos));
        photoIndex += fillCount;
      }

      return {
        project: { ...project, pages: newPages, updatedAt: new Date() },
        currentPageIndex: 0,
      };
    }),

  // Arrange Photos to Target Page Count
  arrangePhotosToPageCount: (targetPageCount: number) =>
    set((state) => {
      const { photos, project } = state;
      if (photos.length === 0) return state;
      if (targetPageCount < 1) return state;

      // Sort photos by EXIF date
      const sortedPhotos = [...photos].sort((a, b) => {
        const dateA = a.exifDate ? new Date(a.exifDate).getTime() : 0;
        const dateB = b.exifDate ? new Date(b.exifDate).getTime() : 0;
        return dateA - dateB;
      });

      const newPages: Page[] = [];

      // Helper to create page with layout
      const createPage = (layout: LayoutType, pagePhotos: typeof sortedPhotos): Page => {
        const slots = getLayoutSlots(layout);
        return {
          id: uuidv4(),
          layout,
          photos: pagePhotos.map((photo, idx) => {
            const slot = slots[idx] || slots[0];
            return {
              photoId: photo.id,
              slotIndex: idx,
              x: slot.x,
              y: slot.y,
              width: slot.width,
              height: slot.height,
              rotation: 0,
              cropX: 0,
              cropY: 0,
              cropWidth: 100,
              cropHeight: 100,
              fitMode: 'cover' as const,
            };
          }),
          textElements: [],
          backgroundColor: '#FFFFFF',
        };
      };

      // All available layouts sorted by capacity
      const layoutTypes: LayoutType[] = [
        'single', 'two-up', 'grid-2x2', 'grid-3x3', 'portfolio', 'scrapbook',
        'mosaic', 'grid-2-4', 'grid-4-2', 'grid-1-2-3', 'center-focus',
        'puzzle', 'panorama', 'quad-split', 'featured-duo',
        'stack-mosaic', 'side-stack', 'hero-wide', 'featured-side', 'double-stack', 'split-duo'
      ];

      // Calculate actual capacity for each layout dynamically
      const allLayouts: { layout: LayoutType; capacity: number }[] = layoutTypes
        .map(layout => ({
          layout,
          capacity: getLayoutSlots(layout).length
        }))
        .sort((a, b) => b.capacity - a.capacity);

      // Calculate photos per page (try to distribute evenly)
      const basePhotosPerPage = Math.floor(sortedPhotos.length / targetPageCount);
      const extraPhotos = sortedPhotos.length % targetPageCount;

      // Find best layout for exact photo count
      const findBestLayout = (count: number): LayoutType => {
        // Try exact match first
        const exactMatch = allLayouts.find(l => l.capacity === count);
        if (exactMatch) return exactMatch.layout;

        // If no exact match, find smallest layout that can fit more photos
        const largerLayout = allLayouts.find(l => l.capacity >= count);
        if (largerLayout) return largerLayout.layout;

        return 'single';
      };

      let photoIndex = 0;
      for (let pageNum = 0; pageNum < targetPageCount; pageNum++) {
        // Distribute photos: first few pages get +1 if there are extras
        const photosOnThisPage = pageNum < extraPhotos ? basePhotosPerPage + 1 : basePhotosPerPage;

        if (photosOnThisPage === 0) break; // No more photos

        const pagePhotos = sortedPhotos.slice(photoIndex, photoIndex + photosOnThisPage);
        const bestLayout = findBestLayout(photosOnThisPage);

        newPages.push(createPage(bestLayout, pagePhotos));
        photoIndex += photosOnThisPage;
      }

      return {
        project: { ...project, pages: newPages, updatedAt: new Date() },
        currentPageIndex: 0,
      };
    }),

  // Quick Fill - Fill all empty slots with unassigned photos
  quickFillSlots: () => {
    let filledCount = 0;
    let usedPhotoCount = 0;

    set((state) => {
      const { photos, project } = state;
      if (photos.length === 0) return state;

      // Get unassigned photos
      const assignedPhotoIds = new Set<string>();
      for (const page of project.pages) {
        for (const photo of page.photos) {
          assignedPhotoIds.add(photo.photoId);
        }
      }

      const unassignedPhotos = photos.filter((p) => !assignedPhotoIds.has(p.id));
      if (unassignedPhotos.length === 0) return state;

      let photoIndex = 0;
      const pages = project.pages.map((page) => {
        const slots = getLayoutSlots(page.layout);
        const newPhotos = [...page.photos];
        let pageFilled = 0;

        for (let slotIdx = 0; slotIdx < slots.length && photoIndex < unassignedPhotos.length; slotIdx++) {
          // Check if this slot is already filled
          const existingPhoto = newPhotos.find((p) => p.slotIndex === slotIdx);

          if (!existingPhoto) {
            // Find next available unassigned photo
            while (photoIndex < unassignedPhotos.length) {
              const photo = unassignedPhotos[photoIndex];
              if (!assignedPhotoIds.has(photo.id) && !newPhotos.some((p) => p.photoId === photo.id)) {
                const slot = slots[slotIdx];
                newPhotos.push({
                  photoId: photo.id,
                  slotIndex: slotIdx,
                  x: slot.x,
                  y: slot.y,
                  width: slot.width,
                  height: slot.height,
                  rotation: 0,
                  cropX: 0,
                  cropY: 0,
                  cropWidth: 100,
                  cropHeight: 100,
                  fitMode: 'cover',
                });
                pageFilled++;
                photoIndex++;
                break;
              }
              photoIndex++;
            }
          }
        }

        filledCount += pageFilled;
        usedPhotoCount = Math.max(usedPhotoCount, photoIndex);

        return { ...page, photos: newPhotos };
      });

      return {
        project: { ...project, pages, updatedAt: new Date() },
      };
    });

    return { filled: filledCount, used: usedPhotoCount };
  },

  // UI actions
  setLoading: (loading) => set({ isLoading: loading }),

  setExporting: (exporting, progress = 0) =>
    set({ isExporting: exporting, exportProgress: progress }),

  addToast: (type, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uuidv4(), type, message }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),

  // Export/Import
  exportProjectJSON: () => {
    const state = get();
    return JSON.stringify({
      project: state.project,
      photos: state.photos.map((p) => ({
        ...p,
        file: undefined,
      })),
    });
  },

  importProjectJSON: (json) => {
    try {
      const data = JSON.parse(json);
      set({
        project: data.project,
        photos: data.photos,
        currentPageIndex: 0,
      });
    } catch {
      get().addToast('error', 'Failed to import project');
    }
  },
}));

// Helper functions
function getPhotosPerPage(layout: LayoutType): number {
  switch (layout) {
    case 'single':
      return 1;
    case 'two-up':
      return 2;
    case 'grid-2x2':
    case 'puzzle':
    case 'quad-split':
      return 4;
    case 'grid-3x3':
      return 9;
    case 'portfolio':
    case 'grid-2-4':
    case 'grid-4-2':
      return 3;
    case 'scrapbook':
      return 4;
    case 'mosaic':
    case 'center-focus':
      return 5;
    case 'grid-1-2-3':
      return 6;
    case 'panorama':
      return 1;
    case 'featured-duo':
      return 3;
    default:
      return 1;
  }
}

function getLayoutSlots(
  layout: LayoutType
): { x: number; y: number; width: number; height: number }[] {
  const padding = 5;
  const totalWidth = 100 - padding * 2;
  const totalHeight = 100 - padding * 2;

  switch (layout) {
    case 'single':
      return [{ x: padding, y: padding, width: totalWidth, height: totalHeight }];

    case 'two-up':
      return [
        { x: padding, y: padding, width: (totalWidth - 2) / 2, height: totalHeight },
        { x: padding + (totalWidth + 2) / 2, y: padding, width: (totalWidth - 2) / 2, height: totalHeight },
      ];

    case 'grid-2x2':
      const halfW = (totalWidth - 2) / 2;
      const halfH = (totalHeight - 2) / 2;
      return [
        { x: padding, y: padding, width: halfW, height: halfH },
        { x: padding + halfW + 2, y: padding, width: halfW, height: halfH },
        { x: padding, y: padding + halfH + 2, width: halfW, height: halfH },
        { x: padding + halfW + 2, y: padding + halfH + 2, width: halfW, height: halfH },
      ];

    case 'grid-3x3':
      const thirdW = (totalWidth - 4) / 3;
      const thirdH = (totalHeight - 4) / 3;
      const slots3x3 = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          slots3x3.push({
            x: padding + col * (thirdW + 2),
            y: padding + row * (thirdH + 2),
            width: thirdW,
            height: thirdH,
          });
        }
      }
      return slots3x3;

    case 'portfolio':
      return [
        { x: padding, y: padding, width: totalWidth * 0.6, height: totalHeight },
        { x: padding + totalWidth * 0.6 + 2, y: padding, width: totalWidth * 0.38, height: (totalHeight - 2) / 2 },
        { x: padding + totalWidth * 0.6 + 2, y: padding + (totalHeight + 2) / 2, width: totalWidth * 0.38, height: (totalHeight - 2) / 2 },
      ];

    case 'scrapbook':
      return [
        { x: padding, y: padding, width: totalWidth * 0.45, height: totalHeight * 0.6 },
        { x: padding + totalWidth * 0.47, y: padding, width: totalWidth * 0.51, height: totalHeight * 0.4 },
        { x: padding, y: padding + totalHeight * 0.62, width: totalWidth * 0.6, height: totalHeight * 0.36 },
        { x: padding + totalWidth * 0.62, y: padding + totalHeight * 0.42, width: totalWidth * 0.36, height: totalHeight * 0.56 },
      ];

    case 'mosaic':
      return [
        { x: padding, y: padding, width: totalWidth * 0.55, height: totalHeight * 0.55 },
        { x: padding + totalWidth * 0.57, y: padding, width: totalWidth * 0.41, height: totalHeight * 0.35 },
        { x: padding + totalWidth * 0.57, y: padding + totalHeight * 0.37, width: totalWidth * 0.41, height: totalHeight * 0.61 },
        { x: padding, y: padding + totalHeight * 0.57, width: totalWidth * 0.28, height: totalHeight * 0.41 },
        { x: padding + totalWidth * 0.3, y: padding + totalHeight * 0.57, width: totalWidth * 0.25, height: totalHeight * 0.41 },
      ];

    // === NEW LAYOUTS ===
    case 'grid-2-4':
      return [
        { x: padding, y: padding, width: totalWidth, height: totalHeight * 0.45 },
        { x: padding, y: padding + totalHeight * 0.47, width: (totalWidth - 2) / 2, height: totalHeight * 0.5 },
        { x: padding + (totalWidth + 2) / 2, y: padding + totalHeight * 0.47, width: (totalWidth - 2) / 2, height: totalHeight * 0.5 },
      ];

    case 'grid-4-2':
      return [
        { x: padding, y: padding, width: (totalWidth - 2) / 2, height: totalHeight * 0.45 },
        { x: padding + (totalWidth + 2) / 2, y: padding, width: (totalWidth - 2) / 2, height: totalHeight * 0.45 },
        { x: padding, y: padding + totalHeight * 0.47, width: totalWidth, height: totalHeight * 0.5 },
      ];

    case 'grid-1-2-3':
      return [
        { x: padding, y: padding, width: totalWidth * 0.6, height: totalHeight * 0.55 },
        { x: padding + totalWidth * 0.62, y: padding, width: totalWidth * 0.36, height: (totalHeight - 2) / 2 },
        { x: padding + totalWidth * 0.62, y: padding + (totalHeight + 2) / 2, width: totalWidth * 0.36, height: (totalHeight - 2) / 2 },
        { x: padding, y: padding + totalHeight * 0.57, width: totalWidth * 0.3, height: totalHeight * 0.4 },
        { x: padding + totalWidth * 0.32, y: padding + totalHeight * 0.57, width: totalWidth * 0.3, height: totalHeight * 0.4 },
        { x: padding + totalWidth * 0.64, y: padding + totalHeight * 0.57, width: totalWidth * 0.34, height: totalHeight * 0.4 },
      ];

    case 'center-focus':
      return [
        { x: padding + totalWidth * 0.25, y: padding + totalHeight * 0.25, width: totalWidth * 0.5, height: totalHeight * 0.5 },
        { x: padding, y: padding, width: totalWidth * 0.2, height: totalHeight * 0.2 },
        { x: padding + totalWidth * 0.75, y: padding, width: totalWidth * 0.2, height: totalHeight * 0.2 },
        { x: padding, y: padding + totalHeight * 0.75, width: totalWidth * 0.2, height: totalHeight * 0.2 },
        { x: padding + totalWidth * 0.75, y: padding + totalHeight * 0.75, width: totalWidth * 0.2, height: totalHeight * 0.2 },
      ];

    case 'puzzle':
      return [
        { x: padding, y: padding, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
        { x: padding + (totalWidth + 2) / 2, y: padding, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
        { x: padding, y: padding + (totalHeight + 2) / 2, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
        { x: padding + (totalWidth + 2) / 2, y: padding + (totalHeight + 2) / 2, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
      ];

    case 'panorama':
      return [{ x: padding, y: padding + totalHeight * 0.3, width: totalWidth, height: totalHeight * 0.4 }];

    case 'quad-split':
      return [
        { x: padding, y: padding, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
        { x: padding + (totalWidth + 2) / 2, y: padding, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
        { x: padding, y: padding + (totalHeight + 2) / 2, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
        { x: padding + (totalWidth + 2) / 2, y: padding + (totalHeight + 2) / 2, width: (totalWidth - 2) / 2, height: (totalHeight - 2) / 2 },
      ];

    case 'featured-duo':
      return [
        { x: padding, y: padding + totalHeight * 0.15, width: totalWidth * 0.6, height: totalHeight * 0.7 },
        { x: padding + totalWidth * 0.62, y: padding, width: totalWidth * 0.36, height: totalHeight * 0.4 },
        { x: padding + totalWidth * 0.62, y: padding + totalHeight * 0.42, width: totalWidth * 0.36, height: totalHeight * 0.43 },
      ];

    default:
      return [{ x: padding, y: padding, width: totalWidth, height: totalHeight }];
  }
}

// Better redistribution function: prioritize earliest pages, delete empty pages
function redistributePhotosWithPriority(
  pages: Page[],
  clearedPhotos: PhotoPlacement[],
  changedPageIndex: number
): Page[] {
  if (clearedPhotos.length === 0) return pages;

  // Sort cleared photos by their original order (keep slotIndex order)
  const sortedPhotos = [...clearedPhotos].sort((a, b) => a.slotIndex - b.slotIndex);

  // Step 1: First try to fill empty slots on pages BEFORE the changed page (earlier pages have priority)
  // Step 2: Then fill empty slots on pages AFTER the changed page
  // Step 3: If a page becomes empty, delete it

  let photoIndex = 0;
  let updatedPages = pages.map((page, pageIdx) => {
    const slots = getLayoutSlots(page.layout);
    const newPhotos = [...page.photos];

    // Check how many empty slots this page has
    const filledSlotIndices = new Set(newPhotos.map((p) => p.slotIndex));
    const emptySlotCount = slots.length - filledSlotIndices.size;

    // Fill empty slots (priority: earlier pages first, then the changed page, then later pages)
    // But for the changed page, we keep its slots empty for now

    // Only fill if this page is not the changed page (the changed page should be filled last)
    if (pageIdx !== changedPageIndex && emptySlotCount > 0) {
      for (let slotIdx = 0; slotIdx < slots.length && photoIndex < sortedPhotos.length; slotIdx++) {
        if (!filledSlotIndices.has(slotIdx)) {
          const photo = sortedPhotos[photoIndex];
          const slot = slots[slotIdx];
          const alreadyAssigned = newPhotos.some((p) => p.photoId === photo.photoId);

          if (!alreadyAssigned) {
            newPhotos.push({
              photoId: photo.photoId,
              slotIndex: slotIdx,
              x: slot.x,
              y: slot.y,
              width: slot.width,
              height: slot.height,
              rotation: photo.rotation,
              cropX: photo.cropX,
              cropY: photo.cropY,
              cropWidth: photo.cropWidth,
              cropHeight: photo.cropHeight,
              fitMode: photo.fitMode,
            });
            photoIndex++;
          }
        }
      }
    }

    return { ...page, photos: newPhotos };
  });

  // Step 2: Now fill the changed page with remaining photos
  if (photoIndex < sortedPhotos.length) {
    const changedPage = updatedPages[changedPageIndex];
    if (changedPage) {
      const slots = getLayoutSlots(changedPage.layout);
      const filledSlotIndices = new Set(changedPage.photos.map((p) => p.slotIndex));
      const newPhotos = [...changedPage.photos];

      for (let slotIdx = 0; slotIdx < slots.length && photoIndex < sortedPhotos.length; slotIdx++) {
        if (!filledSlotIndices.has(slotIdx)) {
          const photo = sortedPhotos[photoIndex];
          const slot = slots[slotIdx];

          newPhotos.push({
            photoId: photo.photoId,
            slotIndex: slotIdx,
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            rotation: photo.rotation,
            cropX: photo.cropX,
            cropY: photo.cropY,
            cropWidth: photo.cropWidth,
            cropHeight: photo.cropHeight,
            fitMode: photo.fitMode,
          });
          photoIndex++;
        }
      }

      updatedPages[changedPageIndex] = { ...changedPage, photos: newPhotos };
    }
  }

  // Step 3: Remove pages that become completely empty (only if more than 1 page exists)
  if (updatedPages.length > 1) {
    updatedPages = updatedPages.filter((page) => page.photos.length > 0);

    // If all pages are now empty, keep at least one page
    if (updatedPages.length === 0) {
      updatedPages = [pages[changedPageIndex] || pages[0]];
    }
  }

  return updatedPages;
}
