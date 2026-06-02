import { useEffect, useRef, useState, useCallback } from "react";

// Minimal YouTube IFrame Player API typing
type YTPlayer = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (s: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

type YTPlayerCtor = new (
  el: HTMLElement,
  opts: {
    height: string | number;
    width: string | number;
    playerVars?: Record<string, number>;
    events?: {
      onReady?: () => void;
      onStateChange?: (e: { data: number }) => void;
    };
  },
) => YTPlayer;

declare global {
  interface Window {
    YT?: { Player: YTPlayerCtor; PlayerState: { PLAYING: number; PAUSED: number; ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT?.Player) return resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return apiPromise;
}

export type YouTubeNowPlaying = {
  videoId: string;
  title: string;
  channel: string;
};

export function useYouTubePlayer(containerId: string) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState<YouTubeNowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let mounted = true;
    void loadYouTubeApi().then(() => {
      if (!mounted) return;
      const el = document.getElementById(containerId);
      if (!el || !window.YT) return;
      playerRef.current = new window.YT.Player(el, {
        height: "1",
        width: "1",
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            if (!window.YT) return;
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true);
            else if (e.data === window.YT.PlayerState.PAUSED) setPlaying(false);
            else if (e.data === window.YT.PlayerState.ENDED) setPlaying(false);
          },
        },
      });
    });
    return () => {
      mounted = false;
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [containerId]);

  // tick progress
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!playerRef.current || !playing) return;
      try {
        setProgress(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      } catch {
        /* noop */
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [playing]);

  const play = useCallback((track: YouTubeNowPlaying) => {
    if (!playerRef.current || !ready) return;
    if (current?.videoId === track.videoId) {
      playerRef.current.playVideo();
      return;
    }
    playerRef.current.loadVideoById(track.videoId);
    setCurrent(track);
  }, [current, ready]);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const toggle = useCallback((track: YouTubeNowPlaying) => {
    if (current?.videoId === track.videoId && playing) {
      pause();
    } else {
      play(track);
    }
  }, [current, playing, play, pause]);

  const seek = useCallback((t: number) => {
    playerRef.current?.seekTo(t, true);
  }, []);

  return { ready, current, playing, progress, duration, play, pause, toggle, seek };
}
