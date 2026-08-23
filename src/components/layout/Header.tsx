import React, { useState } from 'react';
import { Download, Save, FolderOpen, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '../common';
import { useProjectStore } from '../../stores/projectStore';

interface HeaderProps {
  onExportPDF: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPDF,
  onSaveProject,
  onLoadProject,
}) => {
  const { project, setProjectName, isExporting } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!project.name.trim()) {
      setProjectName('Untitled Photobook');
    }
  };

  return (
    <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white hidden sm:block">PhotoBook</span>
        </div>

        {/* Project Name */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary hidden sm:block">/</span>
          {isEditing ? (
            <input
              type="text"
              value={project.name}
              onChange={handleNameChange}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              autoFocus
              className="bg-primary border border-accent rounded px-2 py-1 text-white text-sm focus:outline-none w-48"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-white text-sm hover:text-accent transition-colors flex items-center gap-1"
            >
              {project.name}
              <ChevronDown size={14} className="text-text-secondary" />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLoadProject}
          icon={<FolderOpen size={16} />}
        >
          <span className="hidden sm:inline">Open</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveProject}
          icon={<Save size={16} />}
        >
          <span className="hidden sm:inline">Save</span>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="primary"
          size="sm"
          onClick={onExportPDF}
          loading={isExporting}
          icon={<Download size={16} />}
        >
          Export PDF
        </Button>
      </div>
    </header>
  );
};
