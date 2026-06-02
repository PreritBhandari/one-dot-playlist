import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PLATFORMS, useConnections, type PlatformId, type Platform } from "@/hooks/use-connections";
import { AppProvider, useApp } from "@/hooks/use-app";
import {
  LIBRARY,
  fmtDuration,
  songById,
  type Playlist,
  type Song,
} from "@/hooks/use-library";
import { beginSpotifyLogin, type SpotifyTrack } from "@/lib/spotify";
import { searchYouTube, type YouTubeResult } from "@/lib/youtube";
import { useYouTubePlayer } from "@/hooks/use-youtube-player";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnePlaylist — Your music, every service, one app" },
      {
        name: "description",
        content:
          "A unified music player. Build playlists once, see exactly where every track lives — Spotify, Apple Music, YouTube Music, Amazon Music, Gaana.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: AppPage,
});

/* --------------------------------- Shell --------------------------------- */

type View =
  | { kind: "home" }
  | { kind: "library" }
  | { kind: "connect" }
  | { kind: "search" }
  | { kind: "spotify" }
  | { kind: "spotify-playlist"; id: string; name: string }
  | { kind: "playlist"; id: string };

type SourceFilter = "all" | PlatformId;

function AppPage() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [authOpen, setAuthOpen] = useState(false);
  const { isAuthed } = useApp();

  useEffect(() => {
    if (isAuthed) setAuthOpen(false);
  }, [isAuthed]);

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div className="flex-1 flex min-h-0 gap-2 p-2">
        <Sidebar view={view} setView={setView} />
        <Main view={view} setView={setView} onSignInClick={() => setAuthOpen(true)} />
      </div>
      <PlayerBar />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

/* -------------------------------- Sidebar -------------------------------- */

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { playlists } = useApp();
  const { createPlaylist, deletePlaylist } = playlists;
  const list = playlists.playlists;

  const handleCreate = () => {
    const name = window.prompt("Playlist name", "My Playlist");
    if (name === null) return;
    const p = createPlaylist(name);
    setView({ kind: "playlist", id: p.id });
  };

  return (
    <aside className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col gap-2 min-h-0">
      <div className="bg-surface-1 rounded-xl p-3 ring-1 ring-border">
        <div className="flex items-center gap-2 mb-2">
          <Logo />
        </div>
        <NavItem
          active={view.kind === "home"}
          onClick={() => setView({ kind: "home" })}
          icon={<HomeIcon />}
          label="Home"
        />
        <NavItem
          active={view.kind === "search"}
          onClick={() => setView({ kind: "search" })}
          icon={<SearchIcon />}
          label="Search"
        />
        <NavItem
          active={view.kind === "library"}
          onClick={() => setView({ kind: "library" })}
          icon={<SearchIcon />}
          label="All Songs"
        />
        <NavItem
          active={view.kind === "spotify"}
          onClick={() => setView({ kind: "spotify" })}
          icon={<PlugIcon />}
          label="Spotify"
        />
        <NavItem
          active={view.kind === "connect"}
          onClick={() => setView({ kind: "connect" })}
          icon={<PlugIcon />}
          label="Connections"
        />
      </div>

      <div className="bg-surface-1 rounded-xl p-3 ring-1 ring-border flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Your Library
          </span>
          <button
            onClick={handleCreate}
            className="size-7 rounded-full bg-surface-2 hover:bg-accent text-foreground grid place-items-center ring-1 ring-border"
            aria-label="Create playlist"
            title="Create playlist"
          >
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
              <rect x="5" y="1" width="2" height="10" rx="1" />
              <rect x="1" y="5" width="10" height="2" rx="1" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-1">
          {list.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-3">
              No playlists yet. Click + to create one.
            </div>
          )}
          {list.map((p) => {
            const active = view.kind === "playlist" && view.id === p.id;
            return (
              <div
                key={p.id}
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                  active ? "bg-surface-2" : "hover:bg-surface-2/60"
                }`}
                onClick={() => setView({ kind: "playlist", id: p.id })}
              >
                <div
                  className="size-10 rounded-md shrink-0 ring-1 ring-border"
                  style={{ background: p.cover }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Playlist · {p.songIds.length} song{p.songIds.length === 1 ? "" : "s"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${p.name}"?`)) {
                      deletePlaylist(p.id);
                      if (active) setView({ kind: "home" });
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity text-xs"
                  aria-label={`Delete ${p.name}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-2/60"
      }`}
    >
      <span className="size-5 grid place-items-center">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="relative size-7 rounded-md bg-brand grid place-items-center">
        <div className="size-1.5 rounded-full bg-background" />
      </div>
      <span className="font-semibold tracking-tight text-foreground">OnePlaylist</span>
    </div>
  );
}

/* ---------------------------------- Main --------------------------------- */

function Main({
  view, setView, onSignInClick,
}: { view: View; setView: (v: View) => void; onSignInClick: () => void }) {
  return (
    <main className="flex-1 min-w-0 bg-surface-1 rounded-xl ring-1 ring-border overflow-hidden flex flex-col">
      <Topbar onSignInClick={onSignInClick} />
      <div className="flex-1 overflow-y-auto">
        {view.kind === "home" && <HomeView setView={setView} />}
        {view.kind === "library" && <LibraryView />}
        {view.kind === "connect" && <PlatformHub />}
        {view.kind === "search" && <SearchView />}
        {view.kind === "spotify" && <SpotifyHomeView setView={setView} />}
        {view.kind === "spotify-playlist" && (
          <SpotifyPlaylistView id={view.id} name={view.name} setView={setView} />
        )}
        {view.kind === "playlist" && <PlaylistView id={view.id} setView={setView} />}
      </div>
    </main>
  );
}

function Topbar({ onSignInClick }: { onSignInClick: () => void }) {
  const { user, signOut } = useApp();
  return (
    <div className="h-14 px-5 flex items-center justify-between border-b border-border bg-background/40 backdrop-blur-sm shrink-0">
      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        OnePlaylist · Unified Library
      </span>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <span className="hidden sm:inline text-xs text-muted-foreground">{user.name}</span>
            <button
              onClick={signOut}
              className="text-xs font-medium py-1.5 px-3 bg-surface-2 text-foreground rounded-full ring-1 ring-border hover:bg-accent"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={onSignInClick}
            className="text-xs font-semibold py-1.5 px-3 bg-foreground text-background rounded-full hover:opacity-90"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Home --------------------------------- */

function HomeView({ setView }: { setView: (v: View) => void }) {
  const { playlists } = useApp();
  const { user } = useApp();
  return (
    <div className="p-6 lg:p-8 space-y-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {user ? `Welcome back, ${user.name}` : "Good evening"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          One library across Spotify, Apple Music, YouTube Music, Amazon Music & Gaana.
        </p>
      </header>

      <PlatformIntegrationPanel onManage={() => setView({ kind: "connect" })} />

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-medium">Your playlists</h2>
          <button
            onClick={() => setView({ kind: "library" })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Browse all songs →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} onOpen={() => setView({ kind: "playlist", id: p.id })} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Trending across services</h2>
        <TrackList songs={LIBRARY.slice(0, 6)} compact />
      </section>
    </div>
  );
}

function PlaylistCard({ playlist, onOpen }: { playlist: Playlist; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="text-left bg-surface-2/40 hover:bg-surface-2 transition-colors rounded-xl p-3 ring-1 ring-border group"
    >
      <div
        className="aspect-square rounded-lg mb-3 ring-1 ring-border shadow-lg"
        style={{ background: playlist.cover }}
      />
      <div className="text-sm font-medium text-foreground truncate">{playlist.name}</div>
      <div className="text-xs text-muted-foreground truncate">
        {playlist.songIds.length} song{playlist.songIds.length === 1 ? "" : "s"}
      </div>
    </button>
  );
}

function PlatformIntegrationPanel({ onManage }: { onManage: () => void }) {
  const { connected, isConnected } = useConnections();

  const sourceCount = (id: PlatformId) =>
    LIBRARY.filter((song) => song.sources.includes(id)).length;

  return (
    <section className="rounded-3xl border border-white/10 bg-surface-2/70 p-4 ring-1 ring-border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Platform integration</div>
          <h2 className="text-xl font-semibold mt-2">All your services in one place</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            View which streaming platforms are connected, how many tracks are available from each service, and manage them from the Connections page.
          </p>
        </div>
        <div>
          <button
            onClick={onManage}
            className="h-9 rounded-full bg-surface-2 px-4 text-xs font-semibold text-foreground ring-1 ring-border hover:bg-surface-3"
          >
            Manage connections
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {PLATFORMS.map((platform) => {
          const active = isConnected(platform.id);
          return (
            <div
              key={platform.id}
              className={`flex flex-col items-center gap-2 rounded-3xl border px-3 py-4 text-center ${
                active
                  ? "border-brand/40 bg-brand/10 text-foreground"
                  : "border-border bg-background/50 text-muted-foreground"
              }`}
            >
              <PlatformBadge platform={platform} present={active} size="lg" />
              <div className="text-sm font-medium truncate">{platform.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {sourceCount(platform.id)} tracks
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------- Library -------------------------------- */

function LibraryView() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return LIBRARY;
    return LIBRARY.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.artist.toLowerCase().includes(t) ||
        s.album.toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-3xl font-semibold mb-1">All Songs</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Every track from every connected service in one library.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search songs, artists, albums…"
        className="w-full max-w-md mb-6 px-4 py-2.5 bg-surface-2 rounded-full ring-1 ring-border text-sm outline-none focus:ring-brand"
      />
      <TrackList songs={filtered} />
    </div>
  );
}

/* ------------------------------ Connections ------------------------------ */

const INTEGRATION_SCOPES: Record<PlatformId, string[]> = {
  spotify: ["library", "playlists", "liked"],
  apple: ["library", "playlists", "cloud"],
  yt: ["library", "videos", "uploads"],
  amazon: ["library", "playlists", "stations"],
  gaana: ["library", "playlists", "favorites"],
};

function ConnectView() {
  const { connected, connect, disconnect, isConnected } = useConnections();
  const [busy, setBusy] = useState<Record<PlatformId, boolean>>(() => ({} as Record<PlatformId, boolean>));
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Record<string, string>>({});

  const sourceCount = (id: PlatformId) =>
    LIBRARY.filter((song) => song.sources.includes(id)).length;

  const toggle = (id: PlatformId) => {
    if (isConnected(id)) return disconnect(id);
    setBusy((s) => ({ ...s, [id]: true }));
    window.setTimeout(() => {
      connect(id);
      setBusy((s) => ({ ...s, [id]: false }));
    }, 700);
  };

  const connectAll = () => {
    setBusy(PLATFORMS.reduce((acc, p) => ({ ...acc, [p.id]: true }), {} as Record<PlatformId, boolean>));
    window.setTimeout(() => {
      PLATFORMS.forEach((p) => connect(p.id));
      setBusy({} as Record<PlatformId, boolean>);
    }, 700);
  };

  const syncAll = () => {
    setSyncing(true);
    window.setTimeout(() => {
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSync(
        connected.reduce((acc, id) => ({ ...acc, [id]: stamp }), {} as Record<string, string>),
      );
      setSyncing(false);
    }, 900);
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-3xl font-semibold mb-1">Connections</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {connected.length} of {PLATFORMS.length} streaming services connected.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl">
        {PLATFORMS.map((p) => {
          const active = isConnected(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={busy[p.id]}
              className={`flex items-center justify-between p-4 rounded-2xl ring-1 transition-all text-left ${
                active ? "bg-surface-2 ring-brand/40" : "bg-surface-2/40 ring-border hover:bg-surface-2"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <PlatformBadge platform={p} size="lg" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {busy[p.id] ? "Authorizing…" : active ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  active ? "bg-brand text-primary-foreground" : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {busy[p.id] ? "…" : active ? "Disconnect" : "Connect"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlatformHub() {
  const { connected, connect, disconnect, isConnected } = useConnections();
  const [busy, setBusy] = useState<Record<PlatformId, boolean>>(() => ({} as Record<PlatformId, boolean>));
  const [pending, setPending] = useState<Record<PlatformId, boolean>>(() => ({} as Record<PlatformId, boolean>));
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Record<string, string>>({});

  const SERVICE_AUTH_URLS: Record<PlatformId, string> = {
    spotify: "https://accounts.spotify.com/login",
    apple: "https://music.apple.com",
    yt: "https://music.youtube.com",
    amazon: "https://music.amazon.com",
    gaana: "https://gaana.com/music",
  };

  const sourceCount = (id: PlatformId) =>
    LIBRARY.filter((song) => song.sources.includes(id)).length;

  const startServiceConnect = (platform: Platform) => {
    if (platform.id === "spotify") {
      void beginSpotifyLogin();
      return;
    }
    if (platform.id === "yt") {
      // YouTube uses API key auth — just enable it
      connect("yt");
      return;
    }
    setPending((s) => ({ ...s, [platform.id]: true }));
    window.open(SERVICE_AUTH_URLS[platform.id], "_blank");
  };

  const confirmConnected = (id: PlatformId) => {
    setBusy((s) => ({ ...s, [id]: true }));
    window.setTimeout(() => {
      connect(id);
      setBusy((s) => ({ ...s, [id]: false }));
      setPending((s) => ({ ...s, [id]: false }));
    }, 700);
  };

  const connectAll = () => {
    const targets = PLATFORMS.filter((p) => !isConnected(p.id));
    setPending(targets.reduce((acc, p) => ({ ...acc, [p.id]: true }), {} as Record<PlatformId, boolean>));
    targets.forEach((platform) => startServiceConnect(platform));
  };

  const syncAll = () => {
    setSyncing(true);
    window.setTimeout(() => {
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSync(
        connected.reduce((acc, id) => ({ ...acc, [id]: stamp }), {} as Record<string, string>),
      );
      setSyncing(false);
    }, 900);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Connections</h1>
          <p className="text-sm text-muted-foreground">
            {connected.length} of {PLATFORMS.length} streaming services connected.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-surface-2/60 px-2 py-1.5 ring-1 ring-border">
            {PLATFORMS.map((platform) => (
              <PlatformBadge
                key={platform.id}
                platform={platform}
                present={isConnected(platform.id)}
              />
            ))}
          </div>
          <button
            onClick={connectAll}
            className="h-9 rounded-md bg-foreground px-3 text-xs font-semibold text-background hover:opacity-90"
          >
            Open all sign-in pages
          </button>
          <button
            onClick={syncAll}
            disabled={connected.length === 0 || syncing}
            className="h-9 rounded-md bg-brand px-3 text-xs font-semibold text-primary-foreground hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {syncing ? "Syncing" : "Sync connected"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_18rem] gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => {
            const active = isConnected(p.id);
            const isPending = pending[p.id];
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl ring-1 transition-all ${
                  active ? "bg-surface-2 ring-brand/40" : "bg-surface-2/40 ring-border hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformBadge platform={p} size="lg" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {active ? "Connected" : isPending ? "Waiting for service auth" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {active ? (
                      <button
                        onClick={() => disconnect(p.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand text-primary-foreground"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => startServiceConnect(p)}
                        disabled={isPending}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-surface-2 text-muted-foreground hover:bg-surface-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Connect
                      </button>
                    )}
                    {!active && isPending && (
                      <button
                        onClick={() => confirmConnected(p.id)}
                        disabled={busy[p.id]}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Confirm connected
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <IntegrationMetric label="Tracks" value={sourceCount(p.id)} />
                  <IntegrationMetric label="Lists" value={sourceCount(p.id)} />
                  <IntegrationMetric label="Sync" value={lastSync[p.id] ?? (active ? "Ready" : "Off")} />
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {INTEGRATION_SCOPES[p.id].map((scope) => (
                    <span
                      key={scope}
                      className="rounded-md bg-background/40 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground ring-1 ring-border"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <IntegrationAction label="Import" disabled={!active} />
                  <IntegrationAction label="Export" disabled={!active} />
                  <IntegrationAction label="Match" disabled={!active} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-background/35 p-4 ring-1 ring-border">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Source bridge
          </div>
          <div className="mt-4 space-y-3">
            {PLATFORMS.map((platform, index) => (
              <div key={platform.id} className="flex items-center gap-3">
                <PlatformBadge platform={platform} present={isConnected(platform.id)} />
                <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${isConnected(platform.id) ? 92 - index * 9 : 18}%`,
                      backgroundColor: platform.colorVar,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-[10px] font-mono text-muted-foreground">
                  {sourceCount(platform.id)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Demo connectors are wired to the local library: connect, sync, import, export, match,
            filter, and play availability all use the same platform source map.
          </p>
        </div>
      </div>
    </div>
  );
}

function IntegrationMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-background/35 px-2 py-2 ring-1 ring-border">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function IntegrationAction({ label, disabled }: { label: string; disabled: boolean }) {
  return (
    <button
      disabled={disabled}
      className="rounded-md bg-surface-2 px-2 py-1.5 text-[11px] font-medium text-foreground ring-1 ring-border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-35"
    >
      {label}
    </button>
  );
}

/* -------------------------------- Playlist ------------------------------- */

function PlaylistView({ id, setView }: { id: string; setView: (v: View) => void }) {
  const { playlists } = useApp();
  const p = playlists.playlists.find((x) => x.id === id);
  const { player } = useApp();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  useEffect(() => {
    setSourceFilter("all");
  }, [id]);

  if (!p) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Playlist not found.</p>
        <button onClick={() => setView({ kind: "home" })} className="text-brand text-sm mt-2">
          ← Back to home
        </button>
      </div>
    );
  }

  const songs = p.songIds.map(songById).filter(Boolean) as Song[];
  const visibleSongs =
    sourceFilter === "all"
      ? songs
      : songs.filter((song) => song.sources.includes(sourceFilter));
  const totalSec = songs.reduce((a, b) => a + b.duration, 0);

  const playAll = () => {
    if (visibleSongs.length === 0) return;
    const s = visibleSongs[0];
    player.play({ id: s.id, title: s.title, artist: s.artist, src: s.previewUrl });
  };

  return (
    <div>
      <div
        className="p-6 lg:p-8 pb-8 flex flex-col sm:flex-row items-end gap-6"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, var(--surface-2) 60%, transparent), transparent)`,
        }}
      >
        <div
          className="size-40 lg:size-48 rounded-lg ring-1 ring-border shadow-2xl shadow-black/40 shrink-0"
          style={{ background: p.cover }}
        />
        <div className="min-w-0">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Playlist
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mt-2 wrap-break-word">{p.name}</h1>
          {p.description && (
            <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
          )}
          <div className="text-xs text-muted-foreground mt-3">
            {songs.length} song{songs.length === 1 ? "" : "s"} · {Math.ceil(totalSec / 60)} min
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-4 flex items-center gap-3">
        <button
          onClick={playAll}
          disabled={songs.length === 0}
          className="size-12 rounded-full bg-brand text-primary-foreground grid place-items-center hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand/30"
          aria-label="Play playlist"
        >
          <svg viewBox="0 0 12 12" className="size-4" fill="currentColor">
            <path d="M3 2l7 4-7 4V2z" />
          </svg>
        </button>
        <AddSongMenu playlistId={p.id} />
      </div>

      <div className="px-6 lg:px-8 pb-4">
        <SourceFilterBar
          songs={songs}
          value={sourceFilter}
          onChange={setSourceFilter}
        />
      </div>

      <div className="px-2 lg:px-6 pb-8">
        {songs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground text-sm">This playlist is empty.</p>
            <p className="text-muted-foreground text-xs mt-1">Use "Add songs" above to fill it.</p>
          </div>
        ) : visibleSongs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground text-sm">No songs from this source.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Pick another platform or show all sources.
            </p>
          </div>
        ) : (
          <TrackList songs={visibleSongs} playlistId={p.id} />
        )}
      </div>
    </div>
  );
}

function SourceFilterBar({
  songs, value, onChange,
}: { songs: Song[]; value: SourceFilter; onChange: (value: SourceFilter) => void }) {
  const counts = PLATFORMS.reduce(
    (acc, platform) => {
      acc[platform.id] = songs.filter((song) => song.sources.includes(platform.id)).length;
      return acc;
    },
    {} as Record<PlatformId, number>,
  );
  const visibleCount =
    value === "all" ? songs.length : songs.filter((song) => song.sources.includes(value)).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Filter by source
        </span>
        <span className="text-xs text-muted-foreground">
          Showing {visibleCount} of {songs.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange("all")}
          className={`h-8 rounded-md px-3 text-xs font-medium ring-1 transition-colors ${
            value === "all"
              ? "bg-foreground text-background ring-foreground"
              : "bg-surface-2/60 text-muted-foreground ring-border hover:text-foreground hover:bg-surface-2"
          }`}
        >
          All sources
          <span className="ml-2 font-mono opacity-70">{songs.length}</span>
        </button>
        {PLATFORMS.map((platform) => {
          const active = value === platform.id;
          const count = counts[platform.id];
          return (
            <button
              key={platform.id}
              onClick={() => onChange(platform.id)}
              disabled={count === 0}
              className={`h-8 rounded-md px-2.5 text-xs font-medium ring-1 transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                active
                  ? "bg-foreground text-background ring-foreground"
                  : "bg-surface-2/60 text-muted-foreground ring-border hover:text-foreground hover:bg-surface-2"
              }`}
            >
              <span className="inline-flex items-center gap-2" title={platform.name}>
                <PlatformBadge platform={platform} />
                <span className="font-mono opacity-70">{count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddSongMenu({ playlistId }: { playlistId: string }) {
  const { playlists } = useApp();
  const [open, setOpen] = useState(false);
  const p = playlists.playlists.find((x) => x.id === playlistId)!;
  const available = LIBRARY.filter((s) => !p.songIds.includes(s.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium py-2 px-4 bg-surface-2 text-foreground rounded-full ring-1 ring-border hover:bg-accent"
      >
        + Add songs
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-2 w-80 max-h-96 overflow-y-auto bg-surface-2 ring-1 ring-border rounded-xl shadow-2xl p-1">
            {available.length === 0 && (
              <div className="text-xs text-muted-foreground p-4 text-center">
                All songs already in this playlist.
              </div>
            )}
            {available.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  playlists.addSong(playlistId, s.id);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-1 text-left"
              >
                <div className="size-9 rounded-md shrink-0" style={{ background: s.cover }} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.artist}</div>
                  <div className="mt-1">
                    <SourceBadges sources={s.sources} compact />
                  </div>
                </div>
                <span className="text-brand text-lg leading-none">＋</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------- Track list ------------------------------ */

function TrackList({
  songs, playlistId, compact = false,
}: { songs: Song[]; playlistId?: string; compact?: boolean }) {
  return (
    <div className="space-y-px">
      {!compact && (
        <div className="hidden md:grid grid-cols-[2rem_minmax(12rem,1.2fr)_minmax(8rem,1fr)_minmax(17rem,auto)_3rem] gap-4 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Sources</div>
          <div className="text-right">⏱</div>
        </div>
      )}
      {songs.map((s, i) => (
        <TrackRow
          key={s.id + (playlistId ?? "")}
          song={s}
          index={i + 1}
          playlistId={playlistId}
          compact={compact}
        />
      ))}
    </div>
  );
}

function TrackRow({
  song, index, playlistId, compact,
}: { song: Song; index: number; playlistId?: string; compact: boolean }) {
  const { player, playlists } = useApp();
  const isCurrent = player.current?.id === song.id;
  const isPlaying = isCurrent && player.playing;

  const onPlay = () => {
    player.toggle({
      id: song.id,
      title: song.title,
      artist: song.artist,
      src: song.previewUrl,
    });
  };

  if (compact) {
    return (
      <button
        onClick={onPlay}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2/60 text-left group"
      >
        <div
          className="size-10 rounded-md shrink-0 grid place-items-center relative"
          style={{ background: song.cover }}
        >
          <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/40 transition-colors grid place-items-center">
            <span className={`${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"} text-white`}>
              {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-sm truncate ${isCurrent ? "text-brand" : "text-foreground"}`}>
            {song.title}
          </div>
          <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
        </div>
        <SourceBadges sources={song.sources} compact />
      </button>
    );
  }

  return (
    <div
      className={`grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[2rem_minmax(12rem,1.2fr)_minmax(8rem,1fr)_minmax(17rem,auto)_3rem] gap-4 items-center px-4 py-2 rounded-md group ${
        isCurrent ? "bg-surface-2/60" : "hover:bg-surface-2/60"
      }`}
    >
      <div className="text-sm text-muted-foreground text-center w-8">
        <span className="group-hover:hidden">{isCurrent ? "♪" : index}</span>
        <button
          onClick={onPlay}
          className="hidden group-hover:inline-flex text-foreground"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
        </button>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-md shrink-0" style={{ background: song.cover }} />
        <div className="min-w-0 flex-1">
          <div className={`text-sm truncate ${isCurrent ? "text-brand" : "text-foreground"}`}>
            {song.title}
          </div>
          <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
          <div className="mt-1 md:hidden">
            <SourceBadges sources={song.sources} />
          </div>
        </div>
        {playlistId && (
          <button
            onClick={() => playlists.removeSong(playlistId, song.id)}
            className="md:hidden text-muted-foreground hover:text-foreground text-xs transition-colors"
            aria-label="Remove from playlist"
            title="Remove"
          >
            Ã—
          </button>
        )}
      </div>
      <div className="hidden md:block text-xs text-muted-foreground truncate">{song.album}</div>
      <div className="hidden md:flex items-center gap-1.5">
        <SourceBadges sources={song.sources} />
        {playlistId && (
          <button
            onClick={() => playlists.removeSong(playlistId, song.id)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground text-xs ml-2 transition-opacity"
            aria-label="Remove from playlist"
            title="Remove"
          >
            ×
          </button>
        )}
      </div>
      <div className="hidden md:block text-right text-xs text-muted-foreground font-mono">
        {fmtDuration(song.duration)}
      </div>
    </div>
  );
}

function SourceBadges({
  sources, compact = false,
}: { sources: PlatformId[]; compact?: boolean }) {
  const platforms = PLATFORMS.filter((p) => sources.includes(p.id));

  return (
    <div className={`flex flex-wrap items-center gap-1 ${compact ? "max-w-52" : ""}`}>
      {platforms.map((platform) => (
        <SourceChip key={platform.id} platform={platform} compact={compact} />
      ))}
    </div>
  );
}

function SourceChip({
  platform, compact = false,
}: { platform: Platform; compact?: boolean }) {
  return (
    <span
      title={platform.name}
      aria-label={platform.name}
      className={`inline-grid place-items-center rounded-md ring-1 ring-border text-background shrink-0 ${
        compact ? "size-5" : "size-6"
      }`}
      style={{ backgroundColor: platform.colorVar }}
    >
      <PlatformLogo platform={platform} className={compact ? "size-3" : "size-3.5"} />
    </span>
  );
}

function PlatformBadge({
  platform, present = true, size = "sm",
}: { platform: Platform; present?: boolean; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "size-10" : "size-5";
  const logoSize = size === "lg" ? "size-6" : "size-3";
  return (
    <span
      title={`${platform.name}${present ? "" : " · not available"}`}
      aria-label={platform.name}
      className={`${dim} rounded grid place-items-center text-background shrink-0 transition-opacity ${
        present ? "opacity-100" : "opacity-15 grayscale"
      }`}
      style={{ backgroundColor: platform.colorVar }}
    >
      <PlatformLogo platform={platform} className={logoSize} />
    </span>
  );
}

function PlatformLogo({
  platform, className,
}: { platform: Platform; className: string }) {
  if (platform.id === "spotify") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 8.5c4.4-1.3 9.3-.8 13 1.3" />
        <path d="M6.2 12c3.4-1 7.4-.6 10.2 1" />
        <path d="M7.5 15.3c2.2-.6 4.8-.4 6.8.7" />
      </svg>
    );
  }

  if (platform.id === "apple") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M16.4 12.5c0-2 1.6-3 1.7-3.1-1-.1-2.5.6-3.1.6-.7 0-1.7-.6-2.8-.6-2.2 0-4.2 1.8-4.2 4.7 0 1.4.5 2.9 1.2 3.9.6.9 1.4 2 2.4 2s1.4-.6 2.6-.6 1.5.6 2.6.6 1.8-1 2.4-1.9c.7-1 1-2 1-2.1-.1 0-3.8-1.4-3.8-4.5Z" />
        <path d="M14.8 7.8c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.6-.9 1.4-.8 2.2.8.1 1.6-.4 2.2-1Z" />
      </svg>
    );
  }

  if (platform.id === "yt") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 8.5v7l6-3.5-6-3.5Z" />
      </svg>
    );
  }

  if (platform.id === "amazon") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 9.2c1.2-1 2.8-1.5 4.7-1.5 2.9 0 4.8 1.7 4.8 4.2V17" />
        <path d="M16.5 12.2c-1.1-.5-2.3-.7-3.7-.5-2.4.3-3.8 1.4-3.8 3.1 0 1.5 1.2 2.6 3 2.6 1.9 0 3.4-1.1 4.5-3.2" />
        <path d="M5.5 19c4.2 1.9 8.5 1.9 13 0" />
        <path d="M17.2 18.2l1.7.7-1.1 1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15.6 9.1a4.6 4.6 0 1 0 .3 5.4h-3.7v-2.2h6.2c.1.5.1.8.1 1.2 0 3.7-2.6 6.4-6.2 6.4A7.1 7.1 0 1 1 17.5 8l-1.9 1.1Z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
      <path d="M3 2l7 4-7 4V2z" />
    </svg>
  );
}
function PauseGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
      <rect x="2" y="2" width="3" height="8" rx="0.5" />
      <rect x="7" y="2" width="3" height="8" rx="0.5" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 7l6-5 6 5v7H2V7z" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M11 11l3 3" strokeLinecap="round" />
    </svg>
  );
}
function PlugIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 2v4M11 2v4" strokeLinecap="round" />
      <rect x="3" y="6" width="10" height="4" rx="1" />
      <path d="M8 10v4" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------- Player --------------------------------- */

function fmt(t: number) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function PrevGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4 6l4 3" />
    </svg>
  );
}

function NextGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3l4 3-4 3" />
    </svg>
  );
}

function PlayerBar() {
  const { player } = useApp();
  const current = player.current;
  const song = current ? LIBRARY.find((s) => s.id === current.id) : null;
  const currentIndex = song ? LIBRARY.findIndex((s) => s.id === song.id) : -1;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex >= 0 && currentIndex < LIBRARY.length - 1;

  const playNext = () => {
    if (canNext && song) {
      const nextSong = LIBRARY[currentIndex + 1];
      player.play({ id: nextSong.id, title: nextSong.title, artist: nextSong.artist, src: nextSong.previewUrl });
    }
  };

  const playPrev = () => {
    if (canPrev && song) {
      const prevSong = LIBRARY[currentIndex - 1];
      player.play({ id: prevSong.id, title: prevSong.title, artist: prevSong.artist, src: prevSong.previewUrl });
    }
  };

  return (
    <div className="border-t border-border/40 bg-background/65 backdrop-blur-xl px-3 py-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/10 px-3 py-2 shadow-[0_18px_42px_-28px_rgba(15,23,42,0.8)] backdrop-blur-2xl">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="h-12 w-12 shrink-0 overflow-hidden rounded-3xl bg-surface-3 ring-1 ring-border"
            style={{
              backgroundImage: song ? `url(${song.cover})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!song && (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground px-2">
                No art
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
              Now playing
            </div>
            <div className="truncate text-sm font-semibold text-foreground">
              {current?.title ?? "Select a song to start"}
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              {current?.artist ?? "Browse your library"}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3 sm:max-w-2xl">
          <div className="flex items-center gap-2 rounded-full bg-background/80 px-2 py-1.5 ring-1 ring-border shadow-sm">
            <button
              onClick={playPrev}
              disabled={!canPrev}
              className="size-8 rounded-full bg-surface-3 text-muted-foreground grid place-items-center hover:bg-surface-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <PrevGlyph />
            </button>
            <button
              onClick={() => {
                if (!current) return;
                player.playing ? player.pause() : player.play(current);
              }}
              disabled={!current}
              className="size-10 rounded-full bg-foreground text-background grid place-items-center hover:scale-105 transition-transform disabled:opacity-30"
              aria-label={player.playing ? "Pause" : "Play"}
            >
              {player.playing ? <PauseGlyph /> : <PlayGlyph />}
            </button>
            <button
              onClick={playNext}
              disabled={!canNext}
              className="size-8 rounded-full bg-surface-3 text-muted-foreground grid place-items-center hover:bg-surface-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <NextGlyph />
            </button>
          </div>

          <div className="flex flex-1 min-w-0 items-center gap-2">
            <span className="hidden sm:block text-[10px] font-mono text-muted-foreground tabular-nums w-11 text-right">
              {fmt(player.progress)}
            </span>
            <input
              type="range"
              min={0}
              max={player.duration || 0}
              value={player.progress}
              onChange={(e) => player.seek(Number(e.target.value))}
              className="h-1 w-full rounded-full accent-brand"
              disabled={!current}
            />
            <span className="hidden sm:block text-[10px] font-mono text-muted-foreground tabular-nums w-11 text-left">
              {fmt(player.duration)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 min-w-36">
          {song ? (
            <>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Playing from
              </div>
              <SourceBadges sources={song.sources.slice(0, 1)} compact />
            </>
          ) : (
            <div className="text-[10px] text-muted-foreground">Choose a track to start.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Auth ---------------------------------- */

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    signIn({
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm bg-surface-1 ring-1 ring-border rounded-2xl p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-foreground">Sign in to OnePlaylist</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Quick demo sign-in. No password required.
        </p>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full mb-3 px-3 py-2 bg-surface-2 rounded-lg ring-1 ring-border text-sm outline-none focus:ring-brand"
        />
        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="you@example.com"
          className="w-full mb-5 px-3 py-2 bg-surface-2 rounded-lg ring-1 ring-border text-sm outline-none focus:ring-brand"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-sm rounded-lg bg-surface-2 text-foreground ring-1 ring-border hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-brand text-primary-foreground hover:bg-brand-dark"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
