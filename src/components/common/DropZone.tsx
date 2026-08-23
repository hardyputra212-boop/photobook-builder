import React, { useCallback, useState, useRef } from 'react';
import { Upload, Image as ImageIcon, FolderOpen, Loader2 } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList, folderOrder?: string[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  multiple = true,
  maxSize = 50,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback(
    (files: FileList): File[] | null => {
      setError(null);
      const validFiles: File[] = [];
      const maxBytes = maxSize * 1024 * 1024;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type
        if (!accept.split(',').some((type) => file.type === type.trim())) {
          if (file.type) {
            setError(`File "${file.name}" is not a supported image format`);
            return null;
          }
          continue;
        }

        // Check file size
        if (file.size > maxBytes) {
          setError(`File "${file.name}" exceeds maximum size of ${maxSize}MB`);
          return null;
        }

        validFiles.push(file);
      }

      return validFiles;
    },
    [accept, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      const validFiles = validateFiles(files);

      if (validFiles && validFiles.length > 0) {
        onFilesSelected(createFileList(validFiles));
      } else if (validFiles && validFiles.length === 0) {
        setError('No valid image files found');
      }
    },
    [onFilesSelected, validateFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const validFiles = validateFiles(e.target.files);
        if (validFiles && validFiles.length > 0) {
          onFilesSelected(createFileList(validFiles));
        }
      }
      e.target.value = '';
    },
    [onFilesSelected, validateFiles]
  );

  // Handle folder selection - groups files by folder
  const handleFolderInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const files = Array.from(e.target.files);
        const validFiles = validateFiles(createFileListFromArray(files));

        if (!validFiles || validFiles.length === 0) {
          setError('No valid image files found in selected folders');
          setIsLoading(false);
          return;
        }

        // Group files by their relative path (folder structure)
        const folderMap = new Map<string, File[]>();

        for (const file of validFiles) {
          // Get the folder path from webkitRelativePath or file name
          const pathParts = (file as any).webkitRelativePath?.split('/') || file.name.split('/');
          const folder = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : 'root';

          if (!folderMap.has(folder)) {
            folderMap.set(folder, []);
          }
          folderMap.get(folder)!.push(file);
        }

        // Sort folders by name (assuming date-based naming)
        const sortedFolders = Array.from(folderMap.keys()).sort();
        const folderOrder = sortedFolders;

        // Flatten files maintaining folder order
        const orderedFiles: File[] = [];
        for (const folder of sortedFolders) {
          // Sort files within folder by name
          const folderFiles = folderMap.get(folder)!.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          );
          orderedFiles.push(...folderFiles);
        }

        onFilesSelected(createFileListFromArray(orderedFiles), folderOrder);

      } catch (err) {
        console.error('Folder import error:', err);
        setError('Failed to process folder structure');
      } finally {
        setIsLoading(false);
        e.target.value = '';
      }
    },
    [onFilesSelected, validateFiles]
  );

  // Create FileList from array
  const createFileListFromArray = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  // Create FileList from File[]
  const createFileList = (files: File[]): FileList => {
    return createFileListFromArray(files);
  };

  return (
    <div className="space-y-3">
      {/* Main Drop Zone */}
      <div
        className={`drop-zone rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? 'active bg-accent/10 border-accent' : 'border-dashed border-2 border-border hover:border-accent/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`p-3 rounded-full transition-colors ${
              isDragging ? 'bg-accent/20' : 'bg-surface'
            }`}
          >
            {isDragging ? (
              <Upload className="w-6 h-6 text-accent" />
            ) : isLoading ? (
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6 text-text-secondary" />
            )}
          </div>

          <div>
            <p className="text-white font-medium text-sm">
              {isDragging ? 'Drop files here' : 'Drag & drop photos'}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              or <span className="text-accent hover:underline">browse</span> files
            </p>
          </div>
        </div>
      </div>

      {/* Folder Import Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          folderInputRef.current?.click();
        }}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface border border-border hover:border-accent/50 text-text-secondary hover:text-white transition-all"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FolderOpen className="w-4 h-4" />
        )}
        <span className="text-sm">
          {isLoading ? 'Processing folders...' : 'Import from Folders'}
        </span>
      </button>

      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        accept={accept}
        // @ts-ignore - webkitdirectory is not in TypeScript types
        webkitdirectory="true"
        multiple={true}
        onChange={handleFolderInput}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-text-secondary text-xs text-center">
        Supports: JPG, PNG, WEBP, GIF • Max {maxSize}MB per file
      </p>
    </div>
  );
};
