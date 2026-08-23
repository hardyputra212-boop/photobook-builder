import { useRef, useCallback, useState } from 'react';
import { Sidebar, Toolbar, Footer, BottomNav } from '../components/layout';
import { Canvas } from '../components/editor';
import { useProjectStore } from '../stores/projectStore';
import { exportToPDF, downloadPDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

type MobileTab = 'photos' | 'layout' | 'pages' | 'export';

export const EditorPage: React.FC = () => {
  const {
    project,
    photos,
    setExporting,
    addToast,
    exportProjectJSON,
    importProjectJSON,
  } = useProjectStore();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const pagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Mobile state
  const [mobileTab, setMobileTab] = useState<MobileTab>('photos');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Export to PDF
  const handleExportPDF = useCallback(async () => {
    if (photos.length === 0) {
      addToast('error', 'No photos to export');
      return;
    }

    if (!pagesContainerRef.current) {
      addToast('error', 'Export failed - please try again');
      return;
    }

    setExporting(true, 0);

    try {
      const blob = await exportToPDF(
        project,
        photos,
        pagesContainerRef.current,
        {
          dpi: 150,
          quality: 0.95,
          onProgress: (progress) => setExporting(true, progress),
        }
      );

      const filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      downloadPDF(blob, filename);
      addToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      addToast('error', 'Failed to export PDF');
    } finally {
      setExporting(false, 0);
    }
  }, [project, photos, setExporting, addToast]);

  // Save project
  const handleSaveProject = useCallback(() => {
    try {
      const json = exportProjectJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('success', 'Project saved!');
    } catch (error) {
      addToast('error', 'Failed to save project');
    }
  }, [project, exportProjectJSON, addToast]);

  // Load project
  const handleLoadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          try {
            importProjectJSON(content);
            addToast('success', 'Project loaded!');
          } catch {
            addToast('error', 'Invalid project file');
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }, [importProjectJSON, addToast]);

  // Close panels on mobile
  const handleClosePanels = () => {
    setShowSidebar(false);
    setShowToolbar(false);
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Editor Header */}
      <header className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between md:px-6 md:py-3">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-primary transition-colors text-text-secondary hover:text-white"
            title="Back to Home"
          >
            ←
          </button>

          {/* Mobile Panel Toggle - Photos */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-primary transition-colors md:hidden"
            title="Photos"
          >
            <span className="text-lg">📷</span>
          </button>

          <span className="font-semibold text-white">{project.name}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadProject}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors"
          >
            Open
          </button>
          <button
            onClick={handleSaveProject}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-white text-sm rounded-lg transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors md:hidden"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Panels Overlay */}
      {(showSidebar || showToolbar) && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleClosePanels}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Panel */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] bg-surface transform transition-transform duration-300 md:hidden ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>

        {/* Canvas */}
        <Canvas pagesContainerRef={pagesContainerRef} />

        {/* Desktop Toolbar - hidden on mobile */}
        <div className="hidden lg:block">
          <Toolbar />
        </div>

        {/* Mobile Toolbar Panel */}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] bg-surface transform transition-transform duration-300 md:hidden ${
            showToolbar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <Toolbar />
        </div>
      </div>

      {/* Desktop Footer - hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {/* Mobile Tab Actions */}
      {mobileTab === 'photos' && (
        <div className="fixed bottom-16 left-0 right-0 bg-surface border-t border-border p-3 z-30 md:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMobileTab('layout');
                setShowToolbar(true);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium transition-all text-sm"
            >
              Auto Arrange
            </button>
            <button
              onClick={() => {
                setMobileTab('layout');
                setShowToolbar(true);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-surface border border-border hover:border-accent/50 text-white font-medium transition-all text-sm"
            >
              Select Layout
            </button>
          </div>
        </div>
      )}

      {mobileTab === 'export' && (
        <div className="fixed bottom-16 left-0 right-0 bg-surface border-t border-border p-3 z-30 md:hidden flex gap-2">
          <button
            onClick={handleSaveProject}
            className="flex-1 py-3 px-4 rounded-xl bg-surface border border-border hover:border-accent/50 text-white font-medium transition-all text-sm"
          >
            Save Project
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium transition-all text-sm"
          >
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
};
