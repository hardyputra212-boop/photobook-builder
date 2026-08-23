import React from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

export const Footer: React.FC = () => {
  const { project, currentPageIndex, setCurrentPage, zoom, setZoom } = useProjectStore();

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < project.pages.length - 1) {
      setCurrentPage(currentPageIndex + 1);
    }
  };

  return (
    <footer className="bg-surface border-t border-border px-6 py-3 flex items-center justify-between">
      {/* Page Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          className="p-2 rounded-lg hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <div className="flex items-center gap-2">
          <FileText size={16} className="text-text-secondary" />
          <span className="text-sm text-white">
            Page{' '}
            <span className="font-medium text-accent">{currentPageIndex + 1}</span>
            {' '}of{' '}
            <span className="font-medium">{project.pages.length}</span>
          </span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPageIndex >= project.pages.length - 1}
          className="p-2 rounded-lg hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>

      {/* Page Thumbnails Strip */}
      <div className="flex-1 flex items-center justify-center gap-2 px-4 overflow-x-auto">
        {project.pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => setCurrentPage(index)}
            className={`w-12 h-12 rounded-lg border-2 flex-shrink-0 flex items-center justify-center text-xs font-medium transition-all ${
              currentPageIndex === index
                ? 'border-accent bg-accent/20 text-accent'
                : 'border-border bg-primary text-text-secondary hover:border-accent/50'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Zoom Control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Zoom:</span>
        <select
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="bg-primary border border-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
        >
          <option value="0.25">25%</option>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
        </select>
      </div>
    </footer>
  );
};
