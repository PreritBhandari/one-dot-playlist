// Publishable client identifiers — safe to ship to the browser.
// Spotify Client ID is meant to be public when using the PKCE flow.
// YouTube Data API keys should be restricted by HTTP referrer in the
// Google Cloud console for production.

export const SPOTIFY_CLIENT_ID = "bee7cc276fe94a0d9cfbb46df38698ed";
export const YOUTUBE_API_KEY = "AIzaSyDhGMWkN89JnKrHvxh2ZTKNTodwWYh3uGw";

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "user-top-read",
].join(" ");

export function getSpotifyRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/callback/spotify`;
}
