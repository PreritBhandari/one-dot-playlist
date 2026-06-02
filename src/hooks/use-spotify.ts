import { useCallback, useEffect, useState } from "react";
import {
  getMe,
  getMyPlaylists,
  getPlaylistTracks,
  getStoredToken,
  logoutSpotify,
  type SpotifyPlaylist,
  type SpotifyTrack,
  type SpotifyUser,
} from "@/lib/spotify";

export function useSpotify() {
  const [token, setToken] = useState<string | null>(
    () => getStoredToken()?.access_token ?? null,
  );
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setPlaylists([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [me, lists] = await Promise.all([getMe(), getMyPlaylists()]);
      setUser(me);
      setPlaylists(lists);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) void refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "oneplaylist:spotify:token") {
        setToken(getStoredToken()?.access_token ?? null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [token, refresh]);

  const signOut = useCallback(() => {
    logoutSpotify();
    setToken(null);
    setUser(null);
    setPlaylists([]);
  }, []);

  const fetchTracks = useCallback(
    (playlistId: string): Promise<SpotifyTrack[]> =>
      getPlaylistTracks(playlistId),
    [],
  );

  return {
    isAuthed: !!token,
    user,
    playlists,
    loading,
    error,
    refresh,
    signOut,
    fetchTracks,
    setTokenFromStorage: () =>
      setToken(getStoredToken()?.access_token ?? null),
  };
}
