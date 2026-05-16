'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Rnd } from 'react-rnd';

interface TerminalWindowProps {
  children: React.ReactNode;
}

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

export default function TerminalWindow({ children }: TerminalWindowProps) {
  const [maximized, setMaximized] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const prevRef = useRef({ size: { width: 0, height: 0 }, position: { x: 0, y: 0 } });

  // Calculate initial centered size/position
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = vw >= 1024 ? Math.min(950, vw * 0.9) : vw * 0.95;
    const h = vh * (vw >= 768 ? 0.85 : 0.9);
    const x = (vw - w) / 2;
    const y = (vh - h) / 2;
    setSize({ width: w, height: h });
    setPosition({ x, y });
    setReady(true);
  }, []);

  const toggleMaximize = useCallback(() => {
    if (!maximized) {
      prevRef.current = { size, position };
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setSize({ width: vw * 0.95, height: vh * 0.95 });
      setPosition({ x: vw * 0.025, y: vh * 0.025 });
    } else {
      setSize(prevRef.current.size);
      setPosition(prevRef.current.position);
    }
    setMaximized(!maximized);
  }, [maximized, size, position]);

  if (!ready) return null;

  return (
    <Rnd
      size={size}
      position={position}
      minWidth={MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      maxWidth="95vw"
      maxHeight="95vh"
      bounds="parent"
      dragHandleClassName="terminal-drag-handle"
      onDragStop={(_e, d) => {
        setPosition({ x: d.x, y: d.y });
        if (maximized) setMaximized(false);
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(pos);
        if (maximized) setMaximized(false);
      }}
      className="relative z-10"
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title bar */}
      <div
        className="terminal-drag-handle flex items-center px-4 shrink-0 relative select-none"
        style={{
          height: '38px',
          background: '#3c3c3c',
          borderBottom: '1px solid #2a2a2a',
          cursor: 'grab',
        }}
        onDoubleClick={toggleMaximize}
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
    </Rnd>
  );
}
