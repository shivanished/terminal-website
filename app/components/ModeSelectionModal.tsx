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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full p-8 animate-fade-in">
        <h2
          id="modal-title"
          className="text-2xl md:text-3xl font-bold text-white text-center mb-3"
        >
          Choose Your Experience
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Select how you'd like to view this portfolio
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Terminal Mode Card */}
          <button
            ref={tuiButtonRef}
            onClick={() => handleSelect('tui')}
            className="group relative p-6 bg-gray-800 border-2 border-green-500/30 rounded-lg hover:border-green-500 hover:scale-105 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect('tui');
              }
            }}
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              🖥️
            </div>
            <h3 className="text-xl font-bold text-green-500 mb-2">
              Terminal Mode
            </h3>
            <p className="text-gray-300 text-sm">
              Interactive command-line interface with a retro terminal aesthetic. Type commands to explore.
            </p>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-green-500 text-xs font-mono">→</span>
            </div>
          </button>

          {/* Plain Mode Card */}
          <button
            onClick={() => handleSelect('plain')}
            className="group relative p-6 bg-gray-800 border-2 border-gray-600/30 rounded-lg hover:border-white hover:scale-105 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect('plain');
              }
            }}
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              📄
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Traditional Resume
            </h3>
            <p className="text-gray-300 text-sm">
              Clean, readable portfolio layout with all information displayed directly. Easy to scan and navigate.
            </p>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-mono">→</span>
            </div>
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          You can switch between modes anytime using the toggle button
        </p>
      </div>
    </div>
  );
}
