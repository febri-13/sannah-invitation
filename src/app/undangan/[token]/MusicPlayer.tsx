"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MusicPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function MusicPlayer({ src, autoPlay = false }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);
  const interacted = useRef(false);

  useEffect(() => {
    if (!autoPlay || interacted.current) return;

    const handler = () => {
      if (interacted.current) return;
      interacted.current = true;
      const audio = audioRef.current;
      if (audio) {
        audio.play().then(() => setPlaying(true)).catch(() => {});
      }
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };

    document.addEventListener("click", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [autoPlay]);

  // Throttled scroll handler: update visibility at most once per 150ms
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (sy > lastScroll.current && sy > 200) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        lastScroll.current = sy;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => setPlaying(false);
    audio.addEventListener("ended", onEnd);
    return () => audio.removeEventListener("ended", onEnd);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <audio ref={audioRef} src={src} preload="auto" loop />

          <button
            onClick={toggle}
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.15)",
              borderColor: "rgba(255,255,255,0.25)",
              boxShadow: playing
                ? "0 8px 32px rgba(var(--color-primary-rgb, 194,106,74), 0.35)"
                : "0 4px 16px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: playing ? "var(--color-primary, #C26A4A)" : "rgba(255,255,255,0.2)",
                transition: "background 0.3s",
              }}
            >
              {playing ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            <span
              className="text-sm font-medium tracking-wide"
              style={{ color: playing ? "var(--color-primary, #C26A4A)" : "rgba(255,255,255,0.9)" }}
            >
              {playing ? "JEDA" : "PUTAR MUSIK"}
            </span>

            {playing && (
              <div className="flex items-center gap-[2px] ml-1">
                {[1,2,3,4].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ background: "var(--color-primary, #C26A4A)", height: 12 }}
                    animate={{
                      height: [12, 4 + i * 4, 12],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.12,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
