import React from 'react';
import { Image, Layout, FileText, Download } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'photos' | 'layout' | 'pages' | 'export';
  onTabChange: (tab: 'photos' | 'layout' | 'pages' | 'export') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'photos' as const, icon: Image, label: 'Photos' },
    { id: 'layout' as const, icon: Layout, label: 'Layout' },
    { id: 'pages' as const, icon: FileText, label: 'Pages' },
    { id: 'export' as const, icon: Download, label: 'Export' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full min-w-[64px] min-h-[48px] transition-all ${
                isActive
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <Icon size={22} className="mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
