'use client';

import { useEffect, useRef } from 'react';
import { useViewMode, ViewMode } from '../contexts/ViewModeContext';

export default function ModeSelectionModal() {
  const { setMode, dismissModeSelection } = useViewMode();
  const tuiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Focus the first card for accessibility
    tuiButtonRef.current?.focus();

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSelect('tui'); // Default to TUI mode on Escape
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (selectedMode: ViewMode) => {
    setMode(selectedMode);
    dismissModeSelection();
  };

  return (
    <div
      className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      style={{ fontFamily: "var(--font-tinos), serif" }}
    >
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Terminal Mode Card */}
          <button
            ref={tuiButtonRef}
            onClick={() => handleSelect('tui')}
            className="group relative focus:outline-none focus:ring-1 focus:ring-black/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect('tui');
              }
            }}
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/tui.png"
                alt="Terminal UI mode"
                className="w-full h-auto opacity-50 blur-sm group-hover:opacity-100 group-hover:blur-none transition-all duration-500 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/30 group-hover:opacity-0 transition-opacity duration-500 rounded-lg">
                <h3 
                  className="text-4xl md:text-5xl text-black font-normal"
                  style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                >
                  Terminal UI
                </h3>
              </div>
            </div>
          </button>

          {/* Plain Mode Card */}
          <button
            onClick={() => handleSelect('plain')}
            className="group relative focus:outline-none focus:ring-1 focus:ring-black/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect('plain');
              }
            }}
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/plain.png"
                alt="Plain mode"
                className="w-full h-auto opacity-50 blur-sm group-hover:opacity-100 group-hover:blur-none transition-all duration-500 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/30 group-hover:opacity-0 transition-opacity duration-500 rounded-lg">
                <h3 
                  className="text-4xl md:text-5xl text-black font-normal"
                  style={{ fontFamily: "var(--font-tinos), serif" }}
                >
                  Simple UI
                </h3>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
