import { useRef, useCallback } from 'react';
import { Header, Sidebar, Toolbar, Footer } from './components/layout';
import { Canvas } from './components/editor';
import { Toast } from './components/common';
import { useProjectStore } from './stores/projectStore';
import { exportToPDF, downloadPDF } from './utils/pdfGenerator';

function App() {
  const {
    project,
    photos,
    setExporting,
    addToast,
    exportProjectJSON,
    importProjectJSON,
  } = useProjectStore();

  const pagesContainerRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        onExportPDF={handleExportPDF}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas pagesContainerRef={pagesContainerRef} />
        <Toolbar />
      </div>

      <Footer />
      <Toast />
    </div>
  );
}

export default App;
