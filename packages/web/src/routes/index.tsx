import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Button, Card, CardContent, CardTitle } from "../components/ui";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session, isPending } = useSession();

  if (!isPending && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-[var(--radius-lg)] border border-border/85 bg-surface-2 p-6 shadow-soft sm:p-8">
        <div className="space-y-4">
          <h1 className="page-title max-w-xl text-foreground">Simple tracking with your calorie buddy.</h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Log meals fast, stay on target, and keep the flow focused.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup">
              <Button effect="glow">Start Tracking</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      <Card>
        <CardContent className="space-y-4 p-2">
          <CardTitle>In this version</CardTitle>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li>Bottom-tab app flow</li>
            <li>One-tap log food modal</li>
            <li>Dedicated history, goals, settings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
