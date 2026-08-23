import React, { useState, useEffect } from 'react';
import { X, RotateCw, RotateCcw, Sun, Contrast, Check, Maximize2, Minimize2, StretchHorizontal } from 'lucide-react';
import { Button } from '../common';
import { useProjectStore } from '../../stores/projectStore';

interface PhotoEditorProps {
  photoId: string;
  placement: {
    rotation: number;
    brightness: number;
    contrast: number;
    fitMode?: 'cover' | 'contain' | 'fill';
  };
  onClose: () => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ photoId, placement, onClose }) => {
  const { photos, currentPageIndex, updatePagePhoto } = useProjectStore();

  const photo = photos.find((p) => p.id === photoId);

  const [rotation, setRotation] = useState(placement.rotation);
  const [brightness, setBrightness] = useState(placement.brightness || 100);
  const [contrast, setContrast] = useState(placement.contrast || 100);
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>(placement.fitMode || 'cover');

  useEffect(() => {
    setRotation(placement.rotation);
    setBrightness(placement.brightness || 100);
    setContrast(placement.contrast || 100);
    setFitMode(placement.fitMode || 'cover');
  }, [placement]);

  if (!photo) return null;

  const handleApply = () => {
    // Find current placement and update
    const currentPlacement = useProjectStore.getState().project.pages[currentPageIndex]?.photos.find(
      (p) => p.photoId === photoId
    );

    if (currentPlacement) {
      updatePagePhoto(currentPageIndex, {
        ...currentPlacement,
        rotation,
        brightness,
        contrast,
        fitMode,
      });
    }

    onClose();
  };

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFitMode('cover');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-lg mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Edit Photo</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 bg-background">
          <div
            className="relative mx-auto overflow-hidden rounded-lg"
            style={{
              width: '280px',
              height: '200px',
            }}
          >
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="w-full h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            />
          </div>
          <p className="text-center text-text-secondary text-sm mt-2 truncate">
            {photo.name}
          </p>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white flex items-center gap-2">
                <RotateCw size={16} />
                Rotation
              </label>
              <span className="text-sm text-text-secondary">{rotation}°</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleRotate(-90)} className="flex-1">
                <RotateCcw size={16} />
                -90°
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleRotate(90)} className="flex-1">
                <RotateCw size={16} />
                +90°
              </Button>
            </div>
          </div>

          {/* Brightness */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white flex items-center gap-2">
                <Sun size={16} />
                Brightness
              </label>
              <span className="text-sm text-text-secondary">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white flex items-center gap-2">
                <Contrast size={16} />
                Contrast
              </label>
              <span className="text-sm text-text-secondary">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Fit Mode */}
          <div>
            <label className="text-sm text-white flex items-center gap-2 mb-2">
              <Minimize2 size={16} />
              Fit Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFitMode('cover')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  fitMode === 'cover'
                    ? 'bg-accent/20 border-accent text-white'
                    : 'bg-primary border-border text-text-secondary hover:border-accent/50'
                }`}
              >
                <Maximize2 size={16} className="mx-auto mb-1" />
                <div className="text-xs">Cover</div>
              </button>
              <button
                onClick={() => setFitMode('contain')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  fitMode === 'contain'
                    ? 'bg-accent/20 border-accent text-white'
                    : 'bg-primary border-border text-text-secondary hover:border-accent/50'
                }`}
              >
                <Minimize2 size={16} className="mx-auto mb-1" />
                <div className="text-xs">Shrink</div>
              </button>
              <button
                onClick={() => setFitMode('fill')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  fitMode === 'fill'
                    ? 'bg-accent/20 border-accent text-white'
                    : 'bg-primary border-border text-text-secondary hover:border-accent/50'
                }`}
              >
                <StretchHorizontal size={16} className="mx-auto mb-1" />
                <div className="text-xs">Fill</div>
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {fitMode === 'cover' && 'Potong untuk mengisi slot'}
              {fitMode === 'contain' && 'Tampilkan ukuran asli (ada ruang kosong)'}
              {fitMode === 'fill' && 'Regang untuk mengisi slot'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply} className="flex-1" icon={<Check size={16} />}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
