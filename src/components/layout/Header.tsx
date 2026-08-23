import React, { useState } from 'react';
import { Download, Save, FolderOpen, BookOpen, ChevronDown, PanelLeft, PanelRight } from 'lucide-react';
import { Button } from '../common';
import { useProjectStore } from '../../stores/projectStore';

interface HeaderProps {
  onExportPDF: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onToggleSidebar?: () => void;
  onToggleToolbar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPDF,
  onSaveProject,
  onLoadProject,
  onToggleSidebar,
  onToggleToolbar,
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
    <header className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between md:px-6 md:py-3">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Panel Toggle - Photos */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-primary transition-colors md:hidden"
          title="Photos"
        >
          <PanelLeft size={20} className="text-white" />
        </button>

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
              className="bg-primary border border-accent rounded px-2 py-1 text-white text-sm focus:outline-none w-32 md:w-48"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-white text-sm hover:text-accent transition-colors flex items-center gap-1"
            >
              {project.name}
              <ChevronDown size={14} className="text-text-secondary hidden md:block" />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile Panel Toggle - Tools */}
        <button
          onClick={onToggleToolbar}
          className="p-2 rounded-lg hover:bg-primary transition-colors md:hidden"
          title="Tools"
        >
          <PanelRight size={20} className="text-white" />
        </button>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadProject}
            icon={<FolderOpen size={16} />}
          >
            Open
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveProject}
            icon={<Save size={16} />}
          >
            Save
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

        {/* Mobile Export Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onExportPDF}
          loading={isExporting}
          icon={<Download size={16} />}
          className="md:hidden px-3"
        />
      </div>
    </header>
  );
};
