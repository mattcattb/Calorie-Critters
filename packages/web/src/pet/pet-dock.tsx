import { useMemo } from "react";
import { useLocation } from "@tanstack/react-router";
import { Button } from "../components/ui";
import { usePet } from "./pet-context";
import { PetAvatar } from "./pet-avatar";

export function PetDock() {
  const location = useLocation();
  const { petBundle, isLoading, isInteracting, interact } = usePet();

  const shouldHide = useMemo(() => {
    const hiddenRoutes = ["/login", "/signup"];
    return hiddenRoutes.includes(location.pathname);
  }, [location.pathname]);

  if (shouldHide || isLoading || !petBundle) return null;

  const { pet, template, snapshot } = petBundle;
  const route = location.pathname;

  return (
    <aside className="pointer-events-auto fixed bottom-4 left-4 z-50 w-[312px] rounded-[var(--radius-lg)] border border-border/85 bg-surface p-4 shadow-soft backdrop-blur-sm sm:bottom-5 sm:left-5">
      <div className="flex items-start gap-3">
        <PetAvatar
          template={template}
          mood={snapshot.mood}
          animation={snapshot.animation}
          className="h-20 w-20 shrink-0"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="truncate text-sm font-semibold text-foreground">{pet.name}</p>
              <p className="micro-text text-muted-foreground">
                {template.species} · {pet.mood}
              </p>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {pet.stage}
            </span>
          </div>

          <p className="rounded-[var(--radius-sm)] border border-border/80 bg-surface-2 px-3 py-2 text-xs leading-snug text-foreground/90">
            {snapshot.bubbleText ?? `${template.name} is hanging out nearby.`}
          </p>

          <div className="grid grid-cols-2 gap-2">
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
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("play", route)}
            >
              Play
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
