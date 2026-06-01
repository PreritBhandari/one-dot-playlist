import { useEffect, useRef, useState, useCallback } from "react";

export type PlayingTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayingTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;

    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const play = useCallback((track: PlayingTrack) => {
    const a = audioRef.current;
    if (!a) return;
    if (current?.id === track.id) {
      void a.play();
      setPlaying(true);
      return;
    }
    a.src = track.src;
    setCurrent(track);
    setProgress(0);
    void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [current]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback((track: PlayingTrack) => {
    if (current?.id === track.id && playing) {
      pause();
    } else {
      play(track);
    }
  }, [current, playing, play, pause]);

  const seek = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
  }, []);

  return { current, playing, progress, duration, play, pause, toggle, seek };
}
