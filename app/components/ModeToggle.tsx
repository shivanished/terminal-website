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
        flex items-center justify-center
        px-3 py-1.5 md:px-4 md:py-2
        ${isPlainMode 
          ? 'bg-white border border-black rounded-lg text-black hover:shadow-lg hover:-translate-y-1 transition-all duration-200' 
          : 'bg-black border border-[#00ff00] rounded text-[#00ff00] hover:brightness-110 transition-all duration-200'
        }
        text-xs md:text-sm font-medium
      `}
      style={{
        fontFamily: isPlainMode 
          ? 'var(--font-tinos), serif' 
          : 'var(--font-geist-mono), "Courier New", monospace'
      }}
    >
      {isPlainMode ? 'TUI' : 'Plain'}
    </button>
  );
}
