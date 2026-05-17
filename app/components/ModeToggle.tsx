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
        className="fixed top-4 right-4 z-40 flex flex-col items-center gap-1 hover:scale-110 transition-transform duration-200 cursor-default"
      >
        {/* macOS folder icon */}
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
          {/* Folder back */}
          <path
            d="M4 8C4 5.79 5.79 4 8 4H18L22 8H40C42.21 8 44 9.79 44 12V32C44 34.21 42.21 36 40 36H8C5.79 36 4 34.21 4 32V8Z"
            fill="url(#folderGradient)"
          />
          {/* Folder tab */}
          <path
            d="M4 8C4 5.79 5.79 4 8 4H17L21 8H4V8Z"
            fill="#5AC8FA"
          />
          {/* Folder front face */}
          <path
            d="M4 14H44V32C44 34.21 42.21 36 40 36H8C5.79 36 4 34.21 4 32V14Z"
            fill="url(#folderFrontGradient)"
          />
          <defs>
            <linearGradient id="folderGradient" x1="24" y1="4" x2="24" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ED4F8"/>
              <stop offset="1" stopColor="#3BAFDA"/>
            </linearGradient>
            <linearGradient id="folderFrontGradient" x1="24" y1="14" x2="24" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5AC8FA"/>
              <stop offset="1" stopColor="#34AADC"/>
            </linearGradient>
          </defs>
        </svg>
        {/* Label */}
        <span
          className="text-white text-[11px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        >
          Plain
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
