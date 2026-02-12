import { Link } from "@tanstack/react-router";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "../components/ui";
import { usePet } from "./pet-context";
import { PetAvatar } from "./pet-avatar";

export function PetSceneCard() {
  const { petBundle, isLoading, isInteracting, interact } = usePet();

  if (isLoading || !petBundle) {
    return (
      <Card>
        <CardContent className="p-3 text-sm text-muted-foreground">Loading your companion...</CardContent>
      </Card>
    );
  }

  const { pet, template, snapshot } = petBundle;

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Companion Space</CardTitle>
        <Badge variant="primary">{template.species}</Badge>
      </CardHeader>

      <CardContent className="space-y-4 p-2">
        <section className="rounded-[var(--radius-md)] border border-border/80 bg-surface-2 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <PetAvatar
                template={template}
                mood={snapshot.mood}
                animation={snapshot.animation}
                className="h-28 w-28 shrink-0"
              />
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-foreground">{pet.name}</h4>
                <p className="text-sm text-muted-foreground">{template.personality}</p>
                <p className="rounded-[var(--radius-sm)] border border-border/75 bg-surface px-3 py-2 text-sm text-foreground/90">
                  {snapshot.bubbleText ?? template.description}
                </p>
              </div>
            </div>

            <Link to="/pet">
              <Button variant="outline" size="sm">
                Open Pet Page
              </Button>
            </Link>
          </div>

          <div className="mt-4 rounded-[var(--radius-sm)] border border-border/75 bg-surface px-3 py-2 text-xs text-muted-foreground">
            {template.name} feels <span className="font-semibold text-foreground">{pet.mood}</span> right now.
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("greet", "/dashboard")}
            >
              Greet
            </Button>
            <Button
              variant="outline"
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("pat", "/dashboard")}
            >
              Pat
            </Button>
            <Button
              variant="outline"
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("feed", "/dashboard")}
            >
              Feed
            </Button>
            <Button
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("play", "/dashboard")}
            >
              Play
            </Button>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
