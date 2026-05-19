import { PET_TEMPLATES, type PetTemplate } from "@calorie-critters/shared";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Button, Card, CardContent, CardTitle } from "../components/ui";
import { useSession } from "../lib/auth";
import { PetAvatar } from "../pet";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const spotlightPets = [
  { template: cloneTemplate(PET_TEMPLATES[0]), mood: "excited", animation: "happy" },
  { template: cloneTemplate(PET_TEMPLATES[1]), mood: "calm", animation: "blink" },
  { template: cloneTemplate(PET_TEMPLATES[2]), mood: "curious", animation: "wave" },
  { template: cloneTemplate(PET_TEMPLATES[3]), mood: "sleepy", animation: "sleep" },
] as const;

function cloneTemplate(template: (typeof PET_TEMPLATES)[number]): PetTemplate {
  return {
    ...template,
    greetingLines: [...template.greetingLines],
    emotes: { ...template.emotes },
  };
}

function HomePage() {
  const { data: session, isPending } = useSession();

  if (!isPending && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,hsl(245_79%_62%),hsl(266_84%_61%))] px-5 py-6 text-white shadow-sticker sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -left-8 top-8 h-32 w-32 rounded-full bg-white/18 blur-sm" />
        <div className="pointer-events-none absolute -right-7 bottom-7 h-28 w-28 rounded-full bg-white/16 blur-sm" />

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center rounded-full border border-white/35 bg-white/16 px-4 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.16em]">
            Built for quick daily check-ins
          </div>

          <div className="max-w-[36rem] space-y-3">
            <h1 className="text-4xl font-black leading-[0.94] sm:text-5xl">
              Track calories with your bubble buddy crew.
            </h1>
            <p className="max-w-[31rem] text-sm text-white/90 sm:text-base">
              Fast logging, simple goals, and a companion that grows with your consistency.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" effect="glow" className="min-w-[11rem] border-indigo-700 bg-indigo-700 text-white">
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[9.5rem] border-white/30 bg-white/15 text-white hover:bg-white/25"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="rounded-[2.2rem] border-indigo-100/90 bg-white p-2">
          <CardContent className="space-y-4 p-3">
            <CardTitle>Meet your critters</CardTitle>

            <div className="grid gap-3 sm:grid-cols-2">
              {spotlightPets.map(({ template, mood, animation }) => (
                <article
                  key={template.id}
                  className="flex items-center gap-3 rounded-[1.45rem] border border-indigo-100 bg-[linear-gradient(180deg,#ffffff,#f4f7ff)] p-3"
                >
                  <div className="shrink-0 rounded-[1.2rem] border border-indigo-100 bg-white p-2">
                    <PetAvatar template={template} mood={mood} animation={animation} className="h-16 w-16" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black leading-none text-slate-800">{template.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{template.species}</p>
                    <p className="rounded-full bg-indigo-50 px-2.5 py-1 text-[0.66rem] font-black uppercase tracking-[0.12em] text-indigo-700">
                      {template.personality}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.2rem] border-indigo-100/90 bg-white p-2">
          <CardContent className="space-y-3 p-3">
            <CardTitle>Quick Start</CardTitle>

            <Link to="/login" className="block">
              <Button className="h-14 w-full justify-between rounded-[1.2rem] px-5" effect="sheen">
                Continue Session
                <span aria-hidden="true">→</span>
              </Button>
            </Link>

            <Link to="/signup" className="block">
              <Button variant="outline" className="h-14 w-full justify-between rounded-[1.2rem] px-5">
                Start New Account
                <span aria-hidden="true">→</span>
              </Button>
            </Link>

            <div className="rounded-[1.2rem] border border-indigo-100 bg-indigo-50/65 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-600">
              Login and signup are the fastest routes to dashboard, goals, and history pages.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
