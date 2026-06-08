import { SPOTIFY_CLIENT_ID, SPOTIFY_SCOPES, getSpotifyRedirectUri } from "./oauth-config";

/* ------------------------------------------------------------------ */
/* PKCE helpers                                                        */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = "oneplaylist:spotify:token";
const VERIFIER_KEY = "oneplaylist:spotify:verifier";
const REQUIRED_SCOPE_SET = new Set(SPOTIFY_SCOPES.split(" "));

type StoredToken = {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // ms epoch
  scope?: string;
};

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(input: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
}

function randomString(len = 64): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

/* ------------------------------------------------------------------ */
/* Auth flow                                                           */
/* ------------------------------------------------------------------ */

export async function beginSpotifyLogin(): Promise<void> {
  const verifier = randomString(96);
  const challenge = base64url(await sha256(verifier));
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: getSpotifyRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  const url = `https://accounts.spotify.com/authorize?${params}`;
  // Spotify forbids being embedded in iframes (X-Frame-Options: DENY).
  // The Lovable preview runs inside an iframe, so navigate the top window.
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // Cross-origin iframe — fall back to opening in a new tab.
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  window.location.assign(url);
}

export async function completeSpotifyLogin(code: string): Promise<StoredToken> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error("Missing PKCE verifier");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getSpotifyRedirectUri(),
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  const stored: StoredToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(stored));
  sessionStorage.removeItem(VERIFIER_KEY);
  return stored;
}

async function refreshAccessToken(refresh: string): Promise<StoredToken> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
    client_id: SPOTIFY_CLIENT_ID,
  });
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  const stored: StoredToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refresh,
    expires_at: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(stored));
  return stored;
}

export function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredToken) : null;
  } catch {
    return null;
  }
}

export function logoutSpotify(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function hasRequiredScopes(token: StoredToken): boolean {
  if (!token.scope) return false;
  const granted = new Set(token.scope.split(" "));
  return Array.from(REQUIRED_SCOPE_SET).every((scope) => granted.has(scope));
}

async function getValidToken(): Promise<string | null> {
  const t = getStoredToken();
  if (!t) return null;
  if (!hasRequiredScopes(t)) {
    logoutSpotify();
    throw new Error(
      "Spotify needs a fresh connection with playlist and profile permissions. Please connect Spotify again.",
    );
  }
  if (t.expires_at - 30_000 > Date.now()) return t.access_token;
  if (!t.refresh_token) {
    logoutSpotify();
    return null;
  }
  try {
    const fresh = await refreshAccessToken(t.refresh_token);
    return fresh.access_token;
  } catch {
    logoutSpotify();
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* API helpers                                                         */
/* ------------------------------------------------------------------ */

async function api<T>(path: string): Promise<T> {
  const token = await getValidToken();
  if (!token) throw new Error("Not authenticated with Spotify");
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error?.message || data?.error_description || data?.message || "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    if (res.status === 401 || res.status === 403) logoutSpotify();
    throw new Error(`Spotify API ${res.status} on ${path}${detail ? `: ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export type SpotifyUser = {
  id: string;
  display_name: string | null;
  email?: string;
  images?: { url: string }[];
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string | null };
};

export type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
};

export function getMe() {
  return api<SpotifyUser>("/me");
}

export async function getMyPlaylists(): Promise<SpotifyPlaylist[]> {
  const data = await api<{ items: SpotifyPlaylist[] }>("/me/playlists?limit=50");
  return data.items.filter(Boolean);
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const data = await api<{ items: { track: SpotifyTrack | null }[] }>(
    `/playlists/${playlistId}/tracks?limit=100`,
  );
  return data.items.map((i) => i.track).filter(Boolean) as SpotifyTrack[];
}

export async function searchTracks(q: string): Promise<SpotifyTrack[]> {
  if (!q.trim()) return [];
  const data = await api<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?type=track&limit=20&q=${encodeURIComponent(q)}`,
  );
  return data.tracks.items;
}
