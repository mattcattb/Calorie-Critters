import { Link } from "@tanstack/react-router";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  buttonStyles,
} from "../ui";
import androidBadge from "../../assets/store-android.svg";
import macBadge from "../../assets/store-mac.svg";

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <Badge variant="primary">Early access</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            A calmer, mobile-style way to track nicotine.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            One-tap logging, clear daily signals, and a live estimate powered by
            your usage history.
          </p>
          <div className="flex flex-wrap gap-3">
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
        </div>

        <Card className="enter-rise">
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Simple cards, trend line, and quick logging.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current estimate
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                1.84 <span className="text-sm text-muted-foreground">mg</span>
              </p>
              <p className="text-xs text-muted-foreground">to baseline: 3h 20m</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Entries (24h)</p>
                <p className="mt-1 text-lg font-semibold text-primary">6</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Spent today</p>
                <p className="mt-1 text-lg font-semibold">$8.40</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-surface/80 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <Badge variant="neutral">Mobile apps</Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Android and Mac are in progress.
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Use web today, then continue with native apps once they launch.
            Sync stays simple across devices.
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
