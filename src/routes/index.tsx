import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import coverResonance from "@/assets/cover-resonance.jpg";
import { PLATFORMS, useConnections, type PlatformId } from "@/hooks/use-connections";
import { AppProvider, useApp } from "@/hooks/use-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnePlaylist — One library. Every service. No compromise." },
      {
        name: "description",
        content:
          "Sync your music across Spotify, Apple Music, YouTube Music, Gaana and Amazon Music. Build the master playlist that lives everywhere you do.",
      },
      { property: "og:title", content: "OnePlaylist — Unified playlist manager" },
      {
        property: "og:description",
        content:
          "The master fader for your sound. One playlist, every streaming service.",
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
  component: LandingPage,
});

/* ------------------------------- Shell bits ------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-7 rounded-md bg-brand grid place-items-center">
        <div className="size-1.5 rounded-full bg-background" />
      </div>
      <span className="font-semibold tracking-tight text-foreground">OnePlaylist</span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#connect" className="hover:text-foreground transition-colors">Connect</a>
          <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#connect"
            className="text-sm font-medium py-2 px-4 bg-brand text-primary-foreground rounded-full hover:bg-brand-dark transition-colors"
          >
            Try demo
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-16 overflow-hidden">
      <div className="absolute inset-0 mixer-gradient -z-10 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-[11px] font-medium tracking-wide uppercase mb-8 ring-1 ring-brand/20">
          GitHub for playlists · Now in public beta
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-foreground leading-[1.05] mb-8 text-balance max-w-[22ch]">
          One library. Every service. No compromise.
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-[58ch] mb-10 text-pretty">
          Connect your streaming accounts below, then watch a playlist sync across every one of them in real time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="#connect"
            className="group flex items-center gap-2 py-2 pr-5 pl-3 bg-brand text-primary-foreground text-sm font-semibold rounded-full ring-1 ring-brand hover:bg-brand-dark transition-colors"
          >
            <span className="size-5 bg-background rounded-full grid place-items-center">
              <span className="size-1.5 bg-brand rounded-full" />
            </span>
            Try the live demo
          </a>
          <a
            href="#features"
            className="py-2 px-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn more →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Connect platforms (live) ----------------------- */

type ConnectingState = Record<PlatformId, boolean>;

function ConnectPlatforms() {
  const { connected, connect, disconnect, isConnected } = useConnections();
  const [connecting, setConnecting] = useState<ConnectingState>({} as ConnectingState);

  const handleToggle = (id: PlatformId) => {
    if (isConnected(id)) {
      disconnect(id);
      return;
    }
    setConnecting((s) => ({ ...s, [id]: true }));
    // Simulate OAuth round-trip
    window.setTimeout(() => {
      connect(id);
      setConnecting((s) => ({ ...s, [id]: false }));
    }, 900);
  };

  return (
    <section id="connect" className="relative py-16 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand">
              Step 1
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-foreground">
              Connect your streaming accounts
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {connected.length === 0
                ? "Click any platform to simulate sign-in."
                : `${connected.length} of ${PLATFORMS.length} connected`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => {
            const active = isConnected(p.id);
            const busy = connecting[p.id];
            return (
              <button
                key={p.id}
                onClick={() => handleToggle(p.id)}
                disabled={busy}
                className={`group flex items-center justify-between gap-4 p-4 rounded-2xl ring-1 transition-all text-left ${
                  active
                    ? "bg-surface-1 ring-brand/40"
                    : "bg-surface-1/40 ring-border hover:bg-surface-1 hover:ring-border"
                } ${busy ? "opacity-70 cursor-wait" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="size-10 rounded-xl grid place-items-center text-[11px] font-bold text-background shrink-0"
                    style={{ backgroundColor: p.colorVar }}
                  >
                    {p.short}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {busy
                        ? "Authorizing…"
                        : active
                        ? "Connected · syncing"
                        : "Not connected"}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-brand text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {busy ? "…" : active ? "Disconnect" : "Connect"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Sync demo card ---------------------------- */

type Track = {
  n: string;
  title: string;
  artist: string;
  /** Platforms where the track natively exists in the source library. */
  sources: PlatformId[];
};

const DEMO_TRACKS: Track[] = [
  { n: "01", title: "Starlight Echoes", artist: "Solaris", sources: ["spotify", "apple", "yt", "amazon", "gaana"] },
  { n: "02", title: "Midnight City Lights", artist: "Neon Drift", sources: ["spotify", "apple", "yt", "amazon"] },
  { n: "03", title: "Ocean Floor Dreams", artist: "Submerged", sources: ["spotify", "yt", "amazon", "gaana"] },
  { n: "04", title: "Paper Planes", artist: "Mira Vale", sources: ["spotify", "apple", "gaana"] },
  { n: "05", title: "Velvet Static", artist: "Hollow Coast", sources: ["apple", "yt", "amazon", "gaana"] },
];

type SyncStatus = "idle" | "pending" | "matched" | "missing";
type SyncMatrix = Record<string, Record<PlatformId, SyncStatus>>;

function buildIdleMatrix(): SyncMatrix {
  const m: SyncMatrix = {};
  for (const t of DEMO_TRACKS) {
    m[t.n] = {} as Record<PlatformId, SyncStatus>;
    for (const p of PLATFORMS) m[t.n][p.id] = "idle";
  }
  return m;
}

function DashboardPreview() {
  const { connected } = useConnections();
  const [matrix, setMatrix] = useState<SyncMatrix>(() => buildIdleMatrix());
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset matrix when connections change
  useEffect(() => {
    setMatrix(buildIdleMatrix());
    setProgress(0);
  }, [connected.length]);

  const totalCells = useMemo(
    () => DEMO_TRACKS.length * Math.max(connected.length, 1),
    [connected.length],
  );

  const runSync = async () => {
    if (syncing || connected.length === 0) return;
    setSyncing(true);
    setProgress(0);

    // Start: mark all connected as pending
    setMatrix(() => {
      const next: SyncMatrix = {};
      for (const t of DEMO_TRACKS) {
        next[t.n] = {} as Record<PlatformId, SyncStatus>;
        for (const p of PLATFORMS) {
          next[t.n][p.id] = connected.includes(p.id) ? "pending" : "idle";
        }
      }
      return next;
    });

    let done = 0;
    for (const t of DEMO_TRACKS) {
      for (const pid of connected) {
        // animate one cell at a time
        await new Promise<void>((r) => window.setTimeout(r, 180));
        const status: SyncStatus = t.sources.includes(pid) ? "matched" : "missing";
        setMatrix((prev) => ({
          ...prev,
          [t.n]: { ...prev[t.n], [pid]: status },
        }));
        done += 1;
        setProgress(Math.round((done / totalCells) * 100));
      }
    }
    setSyncing(false);
  };

  const matchedCount = useMemo(() => {
    let c = 0;
    for (const t of DEMO_TRACKS) {
      for (const p of connected) {
        if (matrix[t.n]?.[p] === "matched") c++;
      }
    }
    return c;
  }, [matrix, connected]);

  return (
    <section id="dashboard" className="relative pb-24 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand">
              Step 2
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-foreground">
              Sync a playlist across every service
            </h2>
          </div>
        </div>

        <div className="glass-card ring-1 ring-border rounded-3xl p-4 md:p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img
                src={coverResonance}
                alt="Late Night Resonance playlist cover"
                className="size-16 rounded-xl object-cover ring-1 ring-border"
                width={64}
                height={64}
              />
              <div className="text-left">
                <h3 className="text-lg font-medium text-foreground">Late Night Resonance</h3>
                <p className="text-sm text-muted-foreground">
                  {DEMO_TRACKS.length} tracks
                  {connected.length > 0
                    ? ` · syncing to ${connected.length} platform${connected.length === 1 ? "" : "s"}`
                    : " · no platforms connected"}
                </p>
              </div>
            </div>
            <button
              onClick={runSync}
              disabled={connected.length === 0 || syncing}
              className={`text-sm font-semibold py-2 px-4 rounded-full transition-all ${
                connected.length === 0 || syncing
                  ? "bg-surface-2 text-muted-foreground cursor-not-allowed"
                  : "bg-brand text-primary-foreground hover:bg-brand-dark"
              }`}
            >
              {syncing
                ? `Syncing… ${progress}%`
                : connected.length === 0
                ? "Connect a platform first"
                : "Sync now"}
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-surface-2 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Column headers */}
          {connected.length > 0 && (
            <div className="hidden sm:grid grid-cols-[1fr_auto] gap-4 px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              <div>Track</div>
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${connected.length}, 1.5rem)` }}
              >
                {connected.map((pid) => {
                  const p = PLATFORMS.find((x) => x.id === pid)!;
                  return (
                    <div key={pid} className="text-center" title={p.name}>
                      {p.short}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracks */}
          <div className="space-y-1">
            {DEMO_TRACKS.map((t) => (
              <div
                key={t.n}
                className="grid grid-cols-[1fr_auto] gap-4 items-center p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono w-6 text-muted-foreground/60">
                    {t.n}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-foreground truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {t.artist}
                    </div>
                  </div>
                </div>

                {/* Sync cells */}
                {connected.length === 0 ? (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                    Waiting
                  </span>
                ) : (
                  <div
                    className="grid gap-1.5"
                    style={{
                      gridTemplateColumns: `repeat(${connected.length}, 1.5rem)`,
                    }}
                  >
                    {connected.map((pid) => {
                      const status = matrix[t.n]?.[pid] ?? "idle";
                      const p = PLATFORMS.find((x) => x.id === pid)!;
                      return (
                        <SyncCell
                          key={pid}
                          status={status}
                          colorVar={p.colorVar}
                          label={`${p.name}: ${status}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer summary */}
          {progress === 100 && (
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="text-muted-foreground">
                Sync complete · <span className="text-foreground font-medium">{matchedCount}</span>{" "}
                of {totalCells} matched across {connected.length} platform
                {connected.length === 1 ? "" : "s"}.
              </div>
              <div className="text-xs text-muted-foreground/70 font-mono uppercase tracking-widest">
                Auto re-sync · every 15m
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SyncCell({
  status,
  colorVar,
  label,
}: {
  status: SyncStatus;
  colorVar: string;
  label: string;
}) {
  if (status === "idle") {
    return (
      <span
        title={label}
        className="size-5 rounded-md bg-surface-2 ring-1 ring-border"
      />
    );
  }
  if (status === "pending") {
    return (
      <span
        title={label}
        className="size-5 rounded-md bg-surface-2 ring-1 ring-border relative overflow-hidden"
      >
        <span
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: `color-mix(in oklab, ${colorVar} 30%, transparent)` }}
        />
      </span>
    );
  }
  if (status === "matched") {
    return (
      <span
        title={label}
        className="size-5 rounded-md grid place-items-center"
        style={{ backgroundColor: colorVar }}
      >
        <svg viewBox="0 0 12 12" className="size-3 text-background" fill="none">
          <path
            d="M2.5 6.5L5 9l4.5-5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  // missing
  return (
    <span
      title={label}
      className="size-5 rounded-md bg-surface-2 ring-1 ring-destructive/40 grid place-items-center"
    >
      <span className="size-1 rounded-full bg-destructive/70" />
    </span>
  );
}

/* --------------------------------- Below --------------------------------- */

function Features() {
  const features = [
    {
      title: "Platform sync",
      body: "Add a track on one service and watch it appear across your entire ecosystem. No manual updates, no exports, no broken links.",
    },
    {
      title: "AI smart lists",
      body: "Generate collections based on mood, tempo, weather or time of day. Our engine scans every service to find the perfect mix.",
    },
    {
      title: "Collaborative hub",
      body: "Build playlists with friends no matter which service they use. The first truly platform-agnostic social music experience.",
    },
    {
      title: "Cross-platform search",
      body: "Search every connected library in one query. Automatically match equivalent songs across services.",
    },
    {
      title: "Listening analytics",
      body: "See your most played songs, favorite artists, listening trends and platform usage in one dashboard.",
    },
    {
      title: "Backup & recovery",
      body: "Every playlist, every revision, archived. Restore any version, anytime, anywhere.",
    },
  ];

  return (
    <section id="features" className="py-24 border-y border-border bg-surface-1/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-brand">
            Built for curators
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold text-foreground leading-tight text-balance">
            The master fader for your sound.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
          {features.map((f) => (
            <div key={f.title} className="space-y-3">
              <div className="size-10 rounded-xl bg-surface-2 grid place-items-center ring-1 ring-border">
                <div className="size-3 rounded-full bg-brand" />
              </div>
              <h3 className="text-lg font-medium text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Listener",
      price: "$0",
      tag: "Free forever",
      cta: "Get started",
      featured: false,
      features: [
        "Up to 3 connected platforms",
        "Basic sync frequency",
        "Public playlist sharing",
        "Up to 500 tracks managed",
      ],
    },
    {
      name: "Audiophile",
      price: "$12",
      tag: "Most popular",
      cta: "Start 14-day trial",
      featured: true,
      features: [
        "Unlimited platforms",
        "Real-time synchronization",
        "AI smart playlist generation",
        "Advanced listening analytics",
        "Offline playlist management",
      ],
    },
    {
      name: "Collective",
      price: "$24",
      tag: "For teams",
      cta: "Contact sales",
      featured: false,
      features: [
        "Up to 6 accounts",
        "Collaborative playlists",
        "Shared AI engine",
        "Priority migration support",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold text-foreground leading-tight mb-4 text-balance">
            The right plan for your library
          </h2>
          <p className="text-muted-foreground max-w-[56ch] mx-auto text-pretty">
            From casual listeners to vinyl-grade archivists. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`p-8 rounded-3xl flex flex-col ${
                t.featured
                  ? "bg-surface-2/40 ring-1 ring-brand/40 relative"
                  : "bg-surface-1/60 ring-1 ring-border"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {t.tag}
                </div>
              )}
              <h3 className="text-foreground font-medium mb-2">{t.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-semibold text-foreground">{t.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="text-sm text-muted-foreground flex items-center gap-3"
                  >
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${
                        t.featured ? "bg-brand" : "bg-muted-foreground/40"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors ${
                  t.featured
                    ? "bg-brand text-primary-foreground hover:bg-brand-dark"
                    : "bg-surface-2 text-foreground hover:bg-accent ring-1 ring-border"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © 2026 OnePlaylist Inc. Built for those who hear everything.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Status</a>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <ConnectPlatforms />
        <DashboardPreview />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
