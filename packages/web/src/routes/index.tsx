import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Card, CardContent } from "../components/ui";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Track macros. Grow your critter.
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Hit your nutrition goals and watch your critter thrive.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Calorie Critters makes macro tracking fun. Log your meals, hit your
            protein/carb/fat targets, and keep your little companion happy and
            growing.
          </p>
          <div className="flex flex-wrap gap-3">
            {isPending ? null : session ? (
              <Link to="/dashboard">
                <Button effect="glow">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button effect="glow">Get started</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <Card className="enter-rise">
          <CardContent className="space-y-4 p-6">
            <div className="text-sm text-muted-foreground">What you get</div>
            <ul className="space-y-2 text-sm">
              <li>Log meals with custom food items</li>
              <li>Track calories, protein, carbs & fat</li>
              <li>Daily macro progress & summaries</li>
              <li>A cute critter that grows with your consistency</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
