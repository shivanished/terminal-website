'use client';

import { useViewMode } from '../contexts/ViewModeContext';

export default function ModeToggle() {
  const { mode, setMode } = useViewMode();

  const toggleMode = () => {
    setMode(mode === 'tui' ? 'plain' : 'tui');
  };

  const isPlainMode = mode === 'plain';

  if (!isPlainMode) {
    // TUI mode: macOS folder icon
    return (
      <button
        onClick={toggleMode}
        aria-label="Switch to Plain Mode"
        className="fixed top-4 right-4 z-40 flex flex-col items-center gap-0.5 cursor-default"
      >
        <img
          src="/assets/folder-icon.png"
          alt="Plain"
          className="w-16 h-16"
          draggable={false}
        />
        <span
          className="text-white"
          style={{
            fontFamily: '.AppleSystemUIFont, -apple-system, "Helvetica Neue", sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.5)',
          }}
        >
          plain-website
        </span>
      </button>
    );
  }

  // Plain mode: existing text button
  return (
    <button
      onClick={toggleMode}
      aria-label="Switch to Terminal Mode"
      className="fixed top-3 right-3 md:top-5 md:right-5 z-40 flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 bg-white border border-black rounded-lg text-black hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-xs md:text-sm font-medium"
      style={{ fontFamily: 'var(--font-tinos), serif' }}
    >
      TUI
    </button>
  );
}
