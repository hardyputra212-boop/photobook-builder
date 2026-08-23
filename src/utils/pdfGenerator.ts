import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Project, Photo, PaperSize, Orientation } from '../types';
import { PAPER_SIZES } from '../types';

interface PDFExportOptions {
  dpi?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

// Get paper dimensions in mm
function getPaperDimensions(
  paperSize: PaperSize,
  orientation: Orientation
): { width: number; height: number } {
  const dims = PAPER_SIZES[paperSize];
  if (orientation === 'landscape') {
    return { width: dims.height, height: dims.width };
  }
  return { width: dims.width, height: dims.height };
}

// Render a page to canvas
async function renderPageToCanvas(
  pageElement: HTMLElement,
  dpi: number
): Promise<HTMLCanvasElement> {
  const canvas = await html2canvas(pageElement, {
    scale: dpi / 96, // Convert from 96 DPI (screen) to target DPI
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  return canvas;
}

// Main PDF export function
export async function exportToPDF(
  project: Project,
  _photos: Photo[],
  pagesContainer: HTMLElement,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { dpi = 150, quality = 1, onProgress } = options;

  // Get paper dimensions
  const paperDims = getPaperDimensions(project.paperSize, project.orientation);

  // Create PDF document
  const pdf = new jsPDF({
    orientation: project.orientation,
    unit: 'mm',
    format: [paperDims.width, paperDims.height],
  });

  // Get all page elements
  const pageElements = pagesContainer.querySelectorAll('.page-canvas');
  const totalPages = pageElements.length;

  if (totalPages === 0) {
    throw new Error('No pages to export');
  }

  // Render each page
  for (let i = 0; i < totalPages; i++) {
    if (onProgress) {
      onProgress((i / totalPages) * 100);
    }

    const pageElement = pageElements[i] as HTMLElement;
    if (!pageElement) continue;

    try {
      // Render page to canvas
      const canvas = await renderPageToCanvas(pageElement, dpi);

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', quality);

      // Add page to PDF
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF (fit to page)
      pdf.addImage(imgData, 'JPEG', 0, 0, paperDims.width, paperDims.height);
    } catch (error) {
      console.error(`Failed to render page ${i + 1}:`, error);
    }
  }

  if (onProgress) {
    onProgress(100);
  }

  return pdf.output('blob');
}

// Download PDF blob
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate PDF with canvas directly (alternative method)
export async function generatePDFFromCanvas(
  canvas: HTMLCanvasElement,
  paperSize: PaperSize,
  orientation: Orientation,
  filename: string
): Promise<void> {
  const paperDims = getPaperDimensions(paperSize, orientation);

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [paperDims.width, paperDims.height],
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, paperDims.width, paperDims.height);
  pdf.save(filename);
}
