import { useEffect, useMemo, useState } from "react";
import type { PetAnimation, PetMood, PetTemplate } from "@calorie-critters/shared";
import { cn } from "../lib/cn";

function animationClass(animation: PetAnimation): string {
  switch (animation) {
    case "wave":
      return "pet-wiggle";
    case "happy":
      return "pet-bounce";
    case "thinking":
      return "pet-nod";
    case "sleep":
      return "pet-snooze";
    case "blink":
      return "pet-blink";
    default:
      return "pet-float";
  }
}

function eyeHeight(mood: PetMood): number {
  if (mood === "sleepy") return 1.2;
  if (mood === "calm") return 1.8;
  return 2.8;
}

function spriteCandidates(templateId: string, mood: PetMood, animation: PetAnimation): string[] {
  return [
    `/pet-art/${templateId}/${mood}-${animation}.png`,
    `/pet-art/${templateId}/${mood}.png`,
    `/pet-art/${templateId}/default.png`,
    `/pet-art/${templateId}.png`,
  ];
}

export function PetAvatar({
  template,
  mood,
  animation,
  className,
}: {
  template: PetTemplate;
  mood: PetMood;
  animation: PetAnimation;
  className?: string;
}) {
  const eyes = eyeHeight(mood);
  const isTuxedoCat = template.id === "ink_cat";
  const eyeColor = isTuxedoCat ? "#6f7b37" : "hsl(var(--ink))";
  const sprites = useMemo(
    () => spriteCandidates(template.id, mood, animation),
    [animation, mood, template.id],
  );
  const [spriteIndex, setSpriteIndex] = useState(0);

  useEffect(() => {
    setSpriteIndex(0);
  }, [sprites]);

  return (
    <div className={cn("relative h-24 w-24", animationClass(animation), className)}>
      {sprites[spriteIndex] ? (
        <img
          src={sprites[spriteIndex]}
          alt={template.name}
          className="h-full w-full object-contain drop-shadow-[0_6px_10px_hsl(336_24%_42%/0.2)]"
          onError={() => setSpriteIndex((prev) => prev + 1)}
        />
      ) : (
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_6px_10px_hsl(336_24%_42%/0.2)]">
          <path d="M22 40 L30 12 L44 30 Z" fill={template.primaryColor} />
          <path d="M78 40 L70 12 L56 30 Z" fill={template.primaryColor} />
          <path
            d="M20 53 C20 35, 33 24, 50 24 C67 24, 80 35, 80 53 C80 73, 66 86, 50 86 C34 86, 20 73, 20 53 Z"
            fill={template.primaryColor}
          />
          <path
            d="M33 61 C33 51, 40 45, 50 45 C60 45, 67 51, 67 61 C67 71, 60 77, 50 77 C40 77, 33 71, 33 61 Z"
            fill={template.accentColor}
          />
          {isTuxedoCat ? <ellipse cx="50" cy="73" rx="11.5" ry="6.5" fill="#ffffff" /> : null}
          <ellipse cx="41" cy="54" rx="3.4" ry={eyes} fill={eyeColor} />
          <ellipse cx="59" cy="54" rx="3.4" ry={eyes} fill={eyeColor} />
          <path d="M47 61 L53 61 L50 65 Z" fill="hsl(var(--ink))" />
          <path d="M44 68 Q50 73 56 68" fill="none" stroke="hsl(var(--ink))" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}
