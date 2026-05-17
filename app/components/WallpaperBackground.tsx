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
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/assets/wallpapers/index.json")
      .then((res) => res.json())
      .then((data) => {
        const wps: Wallpaper[] = data.wallpapers;
        setWallpapers(wps);
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
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={advance}>
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

      {/* Wallpaper notification toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-xs bg-black/70 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white shadow-lg transition-all duration-500 ease-in-out ${
            toastVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.name}</p>
              <p className="text-xs text-white/70 mt-0.5">{toast.description}</p>
            </div>
            <button
              onClick={() => setToastVisible(false)}
              className="text-white/50 hover:text-white transition-colors text-lg leading-none -mt-0.5"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
