import { createFileRoute } from "@tanstack/react-router";
import coverResonance from "@/assets/cover-resonance.jpg";

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

const platforms = [
  { name: "Spotify", colorVar: "var(--spotify)" },
  { name: "Apple Music", colorVar: "var(--apple)" },
  { name: "YouTube Music", colorVar: "var(--yt)" },
  { name: "Amazon Music", colorVar: "var(--amazon)" },
  { name: "Gaana", colorVar: "var(--gaana)" },
];

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
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sign in
          </button>
          <button className="text-sm font-medium py-2 px-4 bg-brand text-primary-foreground rounded-full hover:bg-brand-dark transition-colors">
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      <div className="absolute inset-0 mixer-gradient -z-10 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-[11px] font-medium tracking-wide uppercase mb-8 ring-1 ring-brand/20">
          GitHub for playlists · Now in public beta
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-foreground leading-[1.05] mb-8 text-balance max-w-[22ch]">
          One library. Every service. No compromise.
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-[58ch] mb-12 text-pretty">
          Sync your music across Spotify, Apple Music, YouTube Music, Gaana and Amazon Music without moving a single file. Build the master collection that lives everywhere you do.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button className="group flex items-center gap-2 py-2 pr-5 pl-3 bg-brand text-primary-foreground text-sm font-semibold rounded-full ring-1 ring-brand hover:bg-brand-dark transition-colors">
            <span className="size-5 bg-background rounded-full grid place-items-center">
              <span className="size-1.5 bg-brand rounded-full" />
            </span>
            Start syncing free
          </button>
          <button className="py-2 px-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View live demo →
          </button>
        </div>
      </div>
    </section>
  );
}

function PlatformStrip() {
  return (
    <div className="max-w-5xl mx-auto px-6 mt-4 mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: p.colorVar }}
            />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPreview() {
  const tracks = [
    { n: "01", title: "Starlight Echoes", artist: "Solaris", platforms: ["spotify", "apple", "yt"] },
    { n: "02", title: "Midnight City Lights", artist: "Neon Drift", platforms: ["spotify", "apple", "yt", "amazon"], active: true },
    { n: "03", title: "Ocean Floor Dreams", artist: "Submerged", platforms: ["spotify", "yt"] },
    { n: "04", title: "Paper Planes", artist: "Mira Vale", platforms: ["spotify", "apple", "gaana"] },
    { n: "05", title: "Velvet Static", artist: "Hollow Coast", platforms: ["apple", "yt", "amazon"] },
  ];

  const colorMap: Record<string, string> = {
    spotify: "var(--spotify)",
    apple: "var(--apple)",
    yt: "var(--yt)",
    amazon: "var(--amazon)",
    gaana: "var(--gaana)",
  };

  return (
    <section id="dashboard" className="relative pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="glass-card ring-1 ring-border rounded-3xl p-4 md:p-8 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src={coverResonance}
                alt="Late Night Resonance playlist cover"
                className="size-16 rounded-xl object-cover ring-1 ring-border"
              />
              <div className="text-left">
                <h3 className="text-lg font-medium text-foreground">Late Night Resonance</h3>
                <p className="text-sm text-muted-foreground">48 tracks · Synced to 5 platforms</p>
              </div>
            </div>
            <div className="hidden sm:flex -space-x-2">
              {platforms.slice(0, 4).map((p) => (
                <span
                  key={p.name}
                  className="size-8 rounded-full ring-2 ring-card grid place-items-center text-[10px] font-bold text-background"
                  style={{ backgroundColor: p.colorVar }}
                >
                  {p.name[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {tracks.map((t) => (
              <div
                key={t.n}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  t.active ? "bg-white/5" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`text-xs font-mono w-6 ${
                      t.active ? "text-brand" : "text-muted-foreground/60"
                    }`}
                  >
                    {t.n}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-sm truncate ${
                        t.active ? "text-foreground font-medium" : "text-foreground/90"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {t.platforms.map((p) => (
                    <span
                      key={p}
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: colorMap[p] }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

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
      features: ["Up to 3 connected platforms", "Basic sync frequency", "Public playlist sharing", "Up to 500 tracks managed"],
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
      features: ["Up to 6 accounts", "Collaborative playlists", "Shared AI engine", "Priority migration support"],
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

function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="glass-card ring-1 ring-border rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 mixer-gradient pointer-events-none" />
          <h2 className="relative text-3xl md:text-5xl font-semibold text-foreground leading-tight mb-4 text-balance">
            Your sound, finally unified.
          </h2>
          <p className="relative text-muted-foreground mb-8 max-w-[48ch] mx-auto">
            Join the curators building the master collection across every streaming service.
          </p>
          <button className="relative inline-flex items-center gap-2 py-3 pr-6 pl-4 bg-brand text-primary-foreground text-sm font-semibold rounded-full hover:bg-brand-dark transition-colors">
            <span className="size-5 bg-background rounded-full grid place-items-center">
              <span className="size-1.5 bg-brand rounded-full" />
            </span>
            Start syncing free
          </button>
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
        <PlatformStrip />
        <DashboardPreview />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
