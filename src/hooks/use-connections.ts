import { useEffect, useState, useCallback } from "react";

export type PlatformId = "spotify" | "apple" | "yt" | "amazon" | "gaana";

export type Platform = {
  id: PlatformId;
  name: string;
  colorVar: string;
  short: string;
};

export const PLATFORMS: Platform[] = [
  { id: "spotify", name: "Spotify", colorVar: "var(--spotify)", short: "SP" },
  { id: "apple", name: "Apple Music", colorVar: "var(--apple)", short: "AM" },
  { id: "yt", name: "YouTube Music", colorVar: "var(--yt)", short: "YT" },
  { id: "amazon", name: "Amazon Music", colorVar: "var(--amazon)", short: "AZ" },
  { id: "gaana", name: "Gaana", colorVar: "var(--gaana)", short: "GA" },
];

const STORAGE_KEY = "oneplaylist:connections";

export function useConnections() {
  const [connected, setConnected] = useState<PlatformId[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConnected(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const persist = useCallback((next: PlatformId[]) => {
    setConnected(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }, []);

  const connect = useCallback(
    (id: PlatformId) => {
      if (connected.includes(id)) return;
      persist([...connected, id]);
    },
    [connected, persist],
  );

  const disconnect = useCallback(
    (id: PlatformId) => {
      persist(connected.filter((c) => c !== id));
    },
    [connected, persist],
  );

  const isConnected = useCallback(
    (id: PlatformId) => connected.includes(id),
    [connected],
  );

  return { connected, connect, disconnect, isConnected };
}
