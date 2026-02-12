import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../components/ui";
import { usePet } from "./pet-context";
import { PetAvatar } from "./pet-avatar";

type PetPresenceStripProps = {
  compact?: boolean;
};

export function PetPresenceStrip({ compact = false }: PetPresenceStripProps) {
  const location = useLocation();
  const { petBundle, isLoading, isInteracting, interact } = usePet();

  if (isLoading || !petBundle) return null;

  const { pet, template, snapshot } = petBundle;
  const route = location.pathname;

  return (
    <section className="rounded-[var(--radius-md)] border-2 border-border/80 bg-surface-2 p-3">
      <div className="flex items-center gap-3">
        <PetAvatar
          template={template}
          mood={snapshot.mood}
          animation={snapshot.animation}
          className={compact ? "h-16 w-16 shrink-0" : "h-20 w-20 shrink-0"}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {pet.name} is here with you
          </p>
          <p className="micro-text text-muted-foreground">
            {template.species} · {pet.mood} · Energy {pet.energy}
          </p>
          <p className="micro-text text-foreground/85">
            {snapshot.bubbleText ?? `${template.name} is hanging out nearby.`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isInteracting || !snapshot.canInteract}
          onClick={() => interact("pat", route)}
        >
          Pat
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isInteracting || !snapshot.canInteract}
          onClick={() => interact("play", route)}
        >
          Play
        </Button>
        <Link to="/pet">
          <Button size="sm">Customize</Button>
        </Link>
      </div>
    </section>
  );
}
