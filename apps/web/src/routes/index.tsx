import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Card, CardContent, CardHeader, CardTitle, buttonStyles } from "../components/ui";
import androidBadge from "../assets/store-android.svg";
import macBadge from "../assets/store-mac.svg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="primary">Quit toolkit • early access</Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Track nicotine, rebuild routines, and stay in control.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Log cigarettes, vapes, zyns, and more. See how nicotine levels evolve
            in your body, spot cravings, and celebrate cleaner streaks.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className={buttonStyles({ size: "lg", effect: "sheen" })}
            >
              Start tracking
            </Link>
            <Link
              to="/login"
              className={buttonStyles({ size: "lg", variant: "outline" })}
            >
              Sign in
            </Link>
          </div>
          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface/60 p-3">
              <span className="text-foreground">Streak focus:</span> measure the
              time since your last hit.
            </div>
            <div className="rounded-lg border border-border bg-surface/60 p-3">
              <span className="text-foreground">Gentle nudges:</span> spot
              patterns and adjust routines.
            </div>
          </div>
        </div>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Tonight’s snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">
              A calm, purple-first view of your intake rhythm.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current level
              </div>
              <div className="mt-2 text-3xl font-semibold text-primary">
                1.8 mg
              </div>
              <div className="text-xs text-muted-foreground">
                trending down over 2h
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface/60 p-3">
                <div className="text-xs text-muted-foreground">Streak</div>
                <div className="text-lg font-semibold">14h 22m</div>
              </div>
              <div className="rounded-lg border border-border bg-surface/60 p-3">
                <div className="text-xs text-muted-foreground">Last 24h</div>
                <div className="text-lg font-semibold">3 entries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 rounded-3xl border border-border bg-surface/70 p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Badge variant="neutral">Coming soon</Badge>
          <h2 className="text-2xl font-semibold">Native apps are on the way.</h2>
          <p className="text-muted-foreground">
            We’re building Android and Mac experiences that stay lightweight and
            keep your quit data synced. Use the web app for now and be first to
            know when the downloads are live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#"
            className="transition hover:opacity-90"
            aria-label="Android app (coming soon)"
          >
            <img src={androidBadge} alt="Android app store placeholder" />
          </a>
          <a
            href="#"
            className="transition hover:opacity-90"
            aria-label="Mac app (coming soon)"
          >
            <img src={macBadge} alt="Mac app store placeholder" />
          </a>
        </div>
      </section>
    </div>
  );
}
