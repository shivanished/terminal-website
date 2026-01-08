'use client';

import { useViewMode } from '../contexts/ViewModeContext';

export default function ModeToggle() {
  const { mode, setMode } = useViewMode();

  const toggleMode = () => {
    setMode(mode === 'tui' ? 'plain' : 'tui');
  };

  const isPlainMode = mode === 'plain';

  return (
    <button
      onClick={toggleMode}
      aria-label={isPlainMode ? 'Switch to Terminal Mode' : 'Switch to Plain Mode'}
      className={`
        fixed top-3 right-3 md:top-5 md:right-5 z-40
        flex items-center gap-2
        px-3 py-2 md:px-4 md:py-2
        bg-gray-900/90 backdrop-blur
        border ${isPlainMode ? 'border-white/50' : 'border-green-500/50'}
        rounded-lg
        text-sm font-medium
        ${isPlainMode ? 'text-white' : 'text-green-500'}
        hover:scale-105 hover:brightness-110
        active:scale-95
        transition-all duration-200
        shadow-lg
      `}
    >
      <span className="text-lg">
        {isPlainMode ? '🖥️' : '📄'}
      </span>
      <span className="hidden md:inline">
        {isPlainMode ? 'Terminal Mode' : 'Plain Mode'}
      </span>
    </button>
  );
}
