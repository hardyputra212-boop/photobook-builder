import { v4 as uuidv4 } from 'uuid';
import type { Photo, PhotoOrientation, PaperSize, Orientation } from '../types';
import { PAPER_SIZES } from '../types';

// Extract EXIF date from image
export async function extractExifDate(file: File): Promise<Date | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(undefined);
          return;
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          if (view.getUint16(offset, false) === 0xffe1) {
            // EXIF marker
            const exifData = e.target?.result?.slice(offset + 4) as ArrayBuffer;
            const exifView = new DataView(exifData);

            // Check for "Exif" string
            if (exifView.getUint32(0, false) !== 0x45786966) {
              resolve(undefined);
              return;
            }

            // Get DateTimeOriginal (tag 0x9003)
            const tiffOffset = 6;
            // tiffOffset and raw EXIF parsing for date extraction
            void tiffOffset;

            // Simple approach: look for date pattern in the raw EXIF data
            const textDecoder = new TextDecoder('ascii');
            const rawData = textDecoder.decode(exifData.slice(0, 1000));
            const dateMatch = rawData.match(/(\d{4}):(\d{2}):(\d{2})/);

            if (dateMatch) {
              const [, year, month, day] = dateMatch;
              resolve(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
              return;
            }
          }
          offset += 2 + view.getUint16(offset + 2, false);
        }
        resolve(undefined);
      } catch {
        resolve(undefined);
      }
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB
  });
}

// Create thumbnail from image
export async function createThumbnail(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Get image dimensions
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Convert file to data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Get photo orientation based on dimensions
export function getPhotoOrientation(width: number, height: number): PhotoOrientation {
  const ratio = width / height;
  const threshold = 0.1; // 10% tolerance for square

  if (Math.abs(ratio - 1) < threshold) {
    return 'square';
  } else if (width > height) {
    return 'landscape';
  } else {
    return 'portrait';
  }
}

// Process uploaded files into Photo objects
export async function processUploadedFiles(files: FileList | File[]): Promise<Photo[]> {
  const validFiles = Array.from(files).filter((file) =>
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
  );

  const photos: Photo[] = [];

  for (const file of validFiles) {
    try {
      const [dimensions, thumbnail, exifDate] = await Promise.all([
        getImageDimensions(file),
        createThumbnail(file),
        extractExifDate(file),
      ]);

      const dataUrl = await fileToDataUrl(file);
      const orientation = getPhotoOrientation(dimensions.width, dimensions.height);

      photos.push({
        id: uuidv4(),
        file,
        dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        orientation,
        exifDate,
        thumbnail,
        name: file.name,
      });
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
    }
  }

  return photos;
}

// Get paper dimensions in pixels (assuming 96 DPI for screen)
export function getPaperDimensionsInPixels(
  paperSize: PaperSize,
  orientation: Orientation,
  dpi = 96
): { width: number; height: number } {
  const mmToInch = 1 / 25.4;
  const dims = PAPER_SIZES[paperSize];

  const width = orientation === 'landscape' ? dims.height : dims.width;
  const height = orientation === 'landscape' ? dims.width : dims.height;

  return {
    width: Math.round(width * mmToInch * dpi),
    height: Math.round(height * mmToInch * dpi),
  };
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
