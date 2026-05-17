"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Wallpaper {
  name: string;
  path: string;
  description: string;
}

const CYCLE_INTERVAL = 30000;
const TRANSITION_DURATION = 1500;
const TOAST_DURATION = 5000;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WallpaperBackground() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [orderPos, setOrderPos] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [toast, setToast] = useState<Wallpaper | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastHovered, setToastHovered] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/assets/wallpapers/index.json")
      .then((res) => res.json())
      .then((data) => {
        const wps: Wallpaper[] = data.wallpapers;
        setWallpapers(wps);
        // Preload all images so they're cached for instant display
        wps.forEach((wp) => {
          const img = new Image();
          img.src = `/assets/wallpapers/${wp.path}`;
        });
        if (wps.length > 0) {
          const indices = Array.from({ length: wps.length }, (_, i) => i);
          const shuffled = shuffle(indices);
          setOrder(shuffled);
          setCurrentIndex(shuffled[0]);
          setOrderPos(0);
          setToast(wps[shuffled[0]]);
          setToastVisible(true);
          toastTimeoutRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);
        }
      });
  }, []);

  const advance = useCallback(() => {
    if (wallpapers.length <= 1) return;
    if (transitioning) return;

    let newOrder = order;
    let newPos = orderPos + 1;

    // Reshuffle when we've gone through all
    if (newPos >= newOrder.length) {
      newOrder = shuffle(Array.from({ length: wallpapers.length }, (_, i) => i));
      // Avoid starting with same image that just showed
      if (newOrder[0] === currentIndex && newOrder.length > 1) {
        [newOrder[0], newOrder[1]] = [newOrder[1], newOrder[0]];
      }
      setOrder(newOrder);
      newPos = 0;
    }

    const next = newOrder[newPos];
    setOrderPos(newPos);
    setNextIndex(next);
    setTransitioning(true);

    setToast(wallpapers[next]);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);

    setTimeout(() => {
      setCurrentIndex(next);
      setNextIndex(null);
      setTransitioning(false);
    }, TRANSITION_DURATION);
  }, [wallpapers, currentIndex, order, orderPos, transitioning]);

  useEffect(() => {
    if (wallpapers.length <= 1) return;
    const interval = setInterval(advance, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [advance, wallpapers.length]);

  if (wallpapers.length === 0) return null;

  const imgSrc = (wp: Wallpaper) => `/assets/wallpapers/${wp.path}`;

  return (
    <>
      {/* Background images — click to advance */}
      <div className="absolute inset-0 z-0">
        <img
          src={imgSrc(wallpapers[currentIndex])}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {nextIndex !== null && (
          <img
            src={imgSrc(wallpapers[nextIndex])}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
            style={{
              transitionDuration: `${TRANSITION_DURATION}ms`,
              opacity: transitioning ? 1 : 0,
            }}
          />
        )}
      </div>

      {/* macOS-style notification toast */}
      {toast && (
        <div
          className={`fixed top-3 right-3 z-50 w-[360px] transition-all duration-700 ease-in-out group ${
            toastVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-[calc(100%+12px)] opacity-0 pointer-events-none"
          }`}
          onMouseEnter={() => {
            setToastHovered(true);
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          }}
          onMouseLeave={() => {
            setToastHovered(false);
            toastTimeoutRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);
          }}
          style={{
            background: 'rgba(43, 43, 43, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 0.5px rgba(255, 255, 255, 0.1) inset',
            padding: '12px 14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
          }}
        >
          {/* macOS close button — visible on hover */}
          <button
            onClick={() => setToastVisible(false)}
            className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#3a3a3c] border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#4a4a4c]"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1l-6 6" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-3">
            {/* App icon */}
            <img
              src="/assets/photos-icon.webp"
              alt=""
              className="shrink-0"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
              }}
            />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: 0, lineHeight: '16px' }}>
                {toast.name}
              </p>
              <p style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', margin: '2px 0 0', lineHeight: '15px' }}>
                {toast.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
