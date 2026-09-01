"use client";

import { useEffect, useRef, useState } from "react";

interface BootScreenProps {
  /** 0..1 fraction of boot tasks completed */
  progress: number;
  /** Called once fade-out finishes; parent should unmount */
  onComplete: () => void;
}

const MIN_DISPLAY_MS = 700;
const FADE_MS = 450;
const BAR_TRANSITION_MS = 350;

export default function BootScreen({ progress, onComplete }: BootScreenProps) {
  const mountedAt = useRef<number>(0);
  const [fading, setFading] = useState(false);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (mountedAt.current === 0) mountedAt.current = Date.now();
  }, []);

  // Ease displayed bar toward real progress; first tick shows a little life immediately.
  useEffect(() => {
    const t = setTimeout(() => setDisplayed(Math.max(progress, 0.06)), 30);
    return () => clearTimeout(t);
  }, [progress]);

  // Once everything is ready and the minimum display time has passed, fade out.
  useEffect(() => {
    if (progress < 1 || fading) return;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_DISPLAY_MS - elapsed) + BAR_TRANSITION_MS;
    const t = setTimeout(() => setFading(true), wait);
    return () => clearTimeout(t);
  }, [progress, fading]);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(onComplete, FADE_MS);
    return () => clearTimeout(t);
  }, [fading, onComplete]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
      style={{
        background: "#000",
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <svg
        width="84"
        height="84"
        viewBox="0 0 24 24"
        fill="#fff"
        style={{ marginBottom: "76px", marginTop: "-40px" }}
      >
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
      <div
        style={{
          width: "256px",
          height: "6px",
          borderRadius: "3px",
          background: "#2b2b2b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(1, displayed) * 100}%`,
            background: "#d6d6d6",
            borderRadius: "3px",
            transition: `width ${BAR_TRANSITION_MS}ms ease-out`,
          }}
        />
      </div>
    </div>
  );
}
