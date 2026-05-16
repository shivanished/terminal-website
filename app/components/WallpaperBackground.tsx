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

export default function WallpaperBackground() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [toast, setToast] = useState<Wallpaper | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/assets/wallpapers/index.json")
      .then((res) => res.json())
      .then((data) => {
        setWallpapers(data.wallpapers);
        if (data.wallpapers.length > 0) {
          setToast(data.wallpapers[0]);
          setToastVisible(true);
          toastTimeoutRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);
        }
      });
  }, []);

  const advance = useCallback(() => {
    if (wallpapers.length <= 1) return;
    const next = (currentIndex + 1) % wallpapers.length;
    setNextIndex(next);
    setTransitioning(true);

    // Show toast
    setToast(wallpapers[next]);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);

    setTimeout(() => {
      setCurrentIndex(next);
      setNextIndex(null);
      setTransitioning(false);
    }, TRANSITION_DURATION);
  }, [wallpapers, currentIndex]);

  useEffect(() => {
    if (wallpapers.length <= 1) return;
    const interval = setInterval(advance, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [advance, wallpapers.length]);

  if (wallpapers.length === 0) return null;

  const imgSrc = (wp: Wallpaper) => `/assets/wallpapers/${wp.path}`;

  return (
    <>
      {/* Background images */}
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
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Wallpaper notification toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-xs bg-black/70 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white shadow-lg transition-all duration-500 ease-in-out ${
            toastVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <p className="text-sm font-medium">{toast.name}</p>
          <p className="text-xs text-white/70 mt-0.5">{toast.description}</p>
        </div>
      )}
    </>
  );
}
