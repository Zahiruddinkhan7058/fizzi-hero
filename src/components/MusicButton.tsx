"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn("Audio playback prevented:", err);
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio
        ref={audioRef}
        src="/for.mp3"
        loop
        preload="auto"
        playsInline
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        title={isPlaying ? "Pause Music" : "Play Music"}
        className={`group relative flex size-12 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 ${
          isPlaying
            ? "bg-orange-600 text-white ring-4 ring-orange-400/50"
            : "bg-sky-950/90 text-white/90 ring-2 ring-white/30 backdrop-blur-md hover:bg-sky-900 focus:ring-sky-400/40"
        }`}
      >
        {isPlaying ? (
          <span className="flex h-5 items-end gap-1">
            <span className="h-3 w-1 animate-pulse rounded-full bg-white [animation-delay:0ms]" />
            <span className="h-5 w-1 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
            <span className="h-3.5 w-1 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
            <span className="h-2 w-1 animate-pulse rounded-full bg-white [animation-delay:450ms]" />
          </span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:scale-110"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
