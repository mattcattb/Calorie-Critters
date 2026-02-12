import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PET_TEMPLATES, type PetTemplateId } from "@calorie-critters/shared";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "../components/ui";
import { useSession } from "../lib/auth";
import { PetAvatar, usePet } from "../pet";

export const Route = createFileRoute("/pet")({
  component: PetPage,
});

function PetPage() {
  const { data: session, isPending } = useSession();
  const { petBundle, isLoading, isInteracting, isUpdating, interact, updatePet } = usePet();
  const [nameDraft, setNameDraft] = useState("");
  const [templateDraft, setTemplateDraft] = useState<PetTemplateId>(PET_TEMPLATES[0].id);

  useEffect(() => {
    if (!petBundle) return;
    setNameDraft(petBundle.pet.name);
    setTemplateDraft(petBundle.pet.templateId);
  }, [petBundle]);

  const selectedTemplate = useMemo(
    () => PET_TEMPLATES.find((template) => template.id === templateDraft) ?? PET_TEMPLATES[0],
    [templateDraft],
  );
  const previewTemplate = useMemo(
    () => ({
      ...selectedTemplate,
      greetingLines: [...selectedTemplate.greetingLines],
      emotes: { ...selectedTemplate.emotes },
    }),
    [selectedTemplate],
  );

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !petBundle) {
    return (
      <Card>
        <CardContent className="p-3 text-sm text-muted-foreground">Loading your companion...</CardContent>
      </Card>
    );
  }

  const { pet, snapshot } = petBundle;

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h2 className="page-title">Pet Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize your companion here, then see it across the whole app.</p>
      </section>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{nameDraft.trim() || pet.name}</CardTitle>
          <Badge variant="primary">{selectedTemplate.species}</Badge>
        </CardHeader>
        <CardContent className="space-y-4 p-2">
          <div className="flex flex-wrap items-start gap-4 rounded-[var(--radius-md)] border border-border/80 bg-surface-2 p-4">
            <PetAvatar
              template={previewTemplate}
              mood={snapshot.mood}
              animation={snapshot.animation}
              className="h-28 w-28 shrink-0"
            />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {selectedTemplate.name} · {selectedTemplate.personality}
              </p>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              <p className="rounded-[var(--radius-sm)] border border-border/80 bg-surface px-3 py-2 text-sm text-foreground/90">
                {snapshot.bubbleText ?? previewTemplate.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field-grid">
              <Label htmlFor="petName">Pet Name</Label>
              <Input
                id="petName"
                maxLength={40}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
              />
            </div>

            <div className="field-grid">
              <Label htmlFor="petTemplate">Pet Type</Label>
              <Select
                id="petTemplate"
                value={templateDraft}
                onChange={(event) => setTemplateDraft(event.target.value as typeof templateDraft)}
              >
                {PET_TEMPLATES.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} ({candidate.species})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Button
            className="w-full sm:w-auto"
            disabled={isUpdating}
            onClick={() =>
              updatePet({
                name: nameDraft.trim() || pet.name,
                templateId: templateDraft,
              })
            }
          >
            {isUpdating ? "Saving..." : "Save Companion"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-2">
          <h3 className="section-title">Companion Vibe</h3>
          <div className="rounded-[var(--radius-sm)] border border-border/75 bg-surface-2 px-3 py-3 text-sm text-muted-foreground">
            {selectedTemplate.name} is currently <span className="font-semibold text-foreground">{pet.mood}</span>.
            Interactions and your daily logs shift the mood over time.
          </div>

          <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
            <Button
              variant="outline"
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("greet", "/pet")}
            >
              Greet
            </Button>
            <Button
              variant="outline"
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("pat", "/pet")}
            >
              Pat
            </Button>
            <Button
              variant="outline"
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("feed", "/pet")}
            >
              Feed
            </Button>
            <Button
              disabled={isInteracting || !snapshot.canInteract}
              onClick={() => interact("play", "/pet")}
            >
              Play
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
