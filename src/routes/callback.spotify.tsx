import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeSpotifyLogin } from "@/lib/spotify";

export const Route = createFileRoute("/callback/spotify")({
  component: SpotifyCallback,
});

function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");

    if (err) {
      setError(err);
      return;
    }
    if (!code) {
      setError("No authorization code returned by Spotify.");
      return;
    }

    completeSpotifyLogin(code)
      .then(() => {
        // Mark spotify connected so the app picks it up immediately
        try {
          const raw = localStorage.getItem("oneplaylist:connections");
          const list: string[] = raw ? JSON.parse(raw) : [];
          if (!list.includes("spotify")) {
            list.push("spotify");
            localStorage.setItem(
              "oneplaylist:connections",
              JSON.stringify(list),
            );
          }
        } catch {
          /* noop */
        }
        navigate({ to: "/", search: { connected: "spotify" } as never });
      })
      .catch((e: Error) => setError(e.message));
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background text-foreground p-6">
      <div className="max-w-md text-center space-y-3">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">Spotify sign-in failed</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <a href="/" className="inline-block text-sm text-brand underline">
              Back to OnePlaylist
            </a>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Connecting to Spotify…</h1>
            <p className="text-sm text-muted-foreground">
              One moment while we finish authentication.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
