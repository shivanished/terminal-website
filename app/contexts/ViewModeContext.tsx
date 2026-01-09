'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ViewMode = 'tui' | 'plain';

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  showModeSelection: boolean;
  dismissModeSelection: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>('tui');
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on client-side only
  useEffect(() => {
    setMounted(true);

    try {
      // Load saved mode preference, default to 'tui'
      const savedMode = localStorage.getItem('viewMode') as ViewMode;
      if (savedMode === 'tui' || savedMode === 'plain') {
        setModeState(savedMode);
      }
    } catch (error) {
      // localStorage disabled or blocked - graceful fallback
      console.warn('localStorage not available, mode preference will not persist');
    }
  }, []);

  const setMode = (newMode: ViewMode) => {
    setModeState(newMode);

    try {
      localStorage.setItem('viewMode', newMode);
    } catch (error) {
      console.warn('Failed to save mode preference to localStorage');
    }
  };

  const dismissModeSelection = () => {
    setShowModeSelection(false);

    try {
      localStorage.setItem('hasSeenModeSelection', 'true');
    } catch (error) {
      console.warn('Failed to save modal dismissal to localStorage');
    }
  };

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <ViewModeContext.Provider value={{ mode, setMode, showModeSelection, dismissModeSelection }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
