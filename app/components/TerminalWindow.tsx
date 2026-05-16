'use client';

interface TerminalWindowProps {
  children: React.ReactNode;
}

export default function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div
      className="relative z-10 flex flex-col w-[95vw] h-[90vh] md:w-[90vw] lg:w-[950px] lg:max-w-[950px] md:h-[85vh] rounded-lg overflow-hidden"
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center px-4 shrink-0 relative select-none"
        style={{
          height: '38px',
          background: '#3c3c3c',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-2">
          <span
            className="block w-3 h-3 rounded-full"
            style={{ background: '#ff5f57', border: '1px solid #e0443e' }}
          />
          <span
            className="block w-3 h-3 rounded-full"
            style={{ background: '#febc2e', border: '1px solid #dea123' }}
          />
          <span
            className="block w-3 h-3 rounded-full"
            style={{ background: '#28c840', border: '1px solid #1aab29' }}
          />
        </div>
        {/* Title text */}
        <span
          className="absolute left-1/2 -translate-x-1/2 text-xs"
          style={{ color: '#999', fontFamily: '-apple-system, system-ui, sans-serif' }}
        >
          shivansh — terminal
        </span>
      </div>

      {/* Terminal body */}
      <div className="flex-1 min-h-0 p-1" style={{ background: '#1e1e1e' }}>
        {children}
      </div>
    </div>
  );
}
