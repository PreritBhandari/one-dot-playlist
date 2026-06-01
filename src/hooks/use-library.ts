import { useCallback, useEffect, useState } from "react";
import type { PlatformId } from "@/hooks/use-connections";

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  cover: string; // hex color for fake cover
  sources: PlatformId[];
  previewUrl: string;
};

export type Playlist = {
  id: string;
  name: string;
  description?: string;
  cover: string;
  songIds: string[];
  createdAt: number;
};

const sh = (i: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i}.mp3`;

export const LIBRARY: Song[] = [
  { id: "s1", title: "Starlight Echoes", artist: "Solaris", album: "Resonance", duration: 214, cover: "#8b5cf6", sources: ["spotify", "apple", "yt", "amazon", "gaana"], previewUrl: sh(1) },
  { id: "s2", title: "Midnight City Lights", artist: "Neon Drift", album: "After Hours", duration: 198, cover: "#ec4899", sources: ["spotify", "apple", "yt", "amazon"], previewUrl: sh(2) },
  { id: "s3", title: "Ocean Floor Dreams", artist: "Submerged", album: "Deep Blue", duration: 256, cover: "#06b6d4", sources: ["spotify", "yt", "amazon", "gaana"], previewUrl: sh(3) },
  { id: "s4", title: "Paper Planes", artist: "Mira Vale", album: "Soft Currents", duration: 187, cover: "#f59e0b", sources: ["spotify", "apple", "gaana"], previewUrl: sh(4) },
  { id: "s5", title: "Velvet Static", artist: "Hollow Coast", album: "Signal", duration: 232, cover: "#10b981", sources: ["apple", "yt", "amazon", "gaana"], previewUrl: sh(5) },
  { id: "s6", title: "Glass Horizons", artist: "Aura Bloom", album: "Mirror Skies", duration: 221, cover: "#3b82f6", sources: ["spotify", "yt"], previewUrl: sh(6) },
  { id: "s7", title: "Neon Pulse", artist: "Circuit Bay", album: "Voltage", duration: 244, cover: "#ef4444", sources: ["spotify", "apple", "amazon"], previewUrl: sh(7) },
  { id: "s8", title: "Crimson Tide", artist: "Northwind", album: "Embers", duration: 209, cover: "#dc2626", sources: ["apple", "amazon"], previewUrl: sh(8) },
  { id: "s9", title: "Golden Hour", artist: "Sundial", album: "Long Days", duration: 195, cover: "#eab308", sources: ["spotify", "yt", "gaana"], previewUrl: sh(9) },
  { id: "s10", title: "Quiet Architecture", artist: "Frame", album: "Blueprints", duration: 268, cover: "#64748b", sources: ["spotify", "apple", "yt"], previewUrl: sh(10) },
  { id: "s11", title: "Lavender Field", artist: "Calla", album: "Wildflower", duration: 203, cover: "#a78bfa", sources: ["spotify", "gaana"], previewUrl: sh(11) },
  { id: "s12", title: "Iron & Honey", artist: "Lowtide", album: "Slow Burn", duration: 247, cover: "#f97316", sources: ["spotify", "apple", "yt", "amazon"], previewUrl: sh(12) },
];

const KEY = "oneplaylist:playlists";

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "p-latenight",
    name: "Late Night Resonance",
    description: "Slow tempo, big rooms.",
    cover: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
    songIds: ["s1", "s5", "s10", "s12"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "p-drive",
    name: "Sunset Drive",
    description: "Windows down energy.",
    cover: "linear-gradient(135deg,#f97316,#ec4899)",
    songIds: ["s2", "s7", "s9", "s12"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
];

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPlaylists(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  const persist = useCallback((next: Playlist[]) => {
    setPlaylists(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  }, []);

  const createPlaylist = useCallback((name: string) => {
    const palette = [
      "linear-gradient(135deg,#8b5cf6,#06b6d4)",
      "linear-gradient(135deg,#ec4899,#f59e0b)",
      "linear-gradient(135deg,#10b981,#3b82f6)",
      "linear-gradient(135deg,#ef4444,#a78bfa)",
      "linear-gradient(135deg,#f97316,#eab308)",
    ];
    const p: Playlist = {
      id: `p-${Date.now()}`,
      name: name.trim() || "New Playlist",
      cover: palette[Math.floor(Math.random() * palette.length)],
      songIds: [],
      createdAt: Date.now(),
    };
    persist([p, ...playlists]);
    return p;
  }, [playlists, persist]);

  const deletePlaylist = useCallback((id: string) => {
    persist(playlists.filter((p) => p.id !== id));
  }, [playlists, persist]);

  const renamePlaylist = useCallback((id: string, name: string) => {
    persist(playlists.map((p) => (p.id === id ? { ...p, name } : p)));
  }, [playlists, persist]);

  const addSong = useCallback((playlistId: string, songId: string) => {
    persist(playlists.map((p) =>
      p.id === playlistId && !p.songIds.includes(songId)
        ? { ...p, songIds: [...p.songIds, songId] }
        : p,
    ));
  }, [playlists, persist]);

  const removeSong = useCallback((playlistId: string, songId: string) => {
    persist(playlists.map((p) =>
      p.id === playlistId ? { ...p, songIds: p.songIds.filter((s) => s !== songId) } : p,
    ));
  }, [playlists, persist]);

  return { playlists, createPlaylist, deletePlaylist, renamePlaylist, addSong, removeSong };
}

export function songById(id: string): Song | undefined {
  return LIBRARY.find((s) => s.id === id);
}

export function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}
