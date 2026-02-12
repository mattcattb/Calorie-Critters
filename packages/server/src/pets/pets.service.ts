import { eq } from "drizzle-orm";
import {
  PET_MOODS,
  PET_STAGES,
  PET_TEMPLATE_IDS,
  PET_TEMPLATES,
  type PetInteractionType,
  type PetMood,
  type PetStage,
  type PetTemplate,
  type PetTemplateId,
  type UserPet,
  type UserPetBundle,
  type PetAnimation,
  type PetStateSnapshot,
} from "@calorie-critters/shared";
import { db } from "../db";
import { petEvent, userPet } from "../db/schema";
import type { RecordPetEventInput, UpdateUserPetInput } from "./pets.schema";

type UserPetRow = typeof userPet.$inferSelect;

const DEFAULT_TEMPLATE = PET_TEMPLATES[0];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toSeed(value: string): number {
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  return seed;
}

function pickBySeed(lines: readonly string[], seedKey: string): string {
  if (lines.length === 0) return "";
  const seed = toSeed(seedKey);
  return lines[seed % lines.length] ?? lines[0];
}

function normalizeTemplateId(raw: string): PetTemplateId {
  if (PET_TEMPLATE_IDS.includes(raw as PetTemplateId)) {
    return raw as PetTemplateId;
  }
  return DEFAULT_TEMPLATE.id;
}

function normalizeMood(raw: string): PetMood {
  if (PET_MOODS.includes(raw as PetMood)) {
    return raw as PetMood;
  }
  return "curious";
}

function normalizeStage(raw: string): PetStage {
  if (PET_STAGES.includes(raw as PetStage)) {
    return raw as PetStage;
  }
  return "baby";
}

function getTemplate(templateId: PetTemplateId): PetTemplate {
  const template =
    PET_TEMPLATES.find((item) => item.id === templateId) ?? DEFAULT_TEMPLATE;

  return {
    ...template,
    greetingLines: [...template.greetingLines],
    emotes: { ...template.emotes },
  };
}

function serializeUserPet(row: UserPetRow): UserPet {
  return {
    id: row.id,
    userId: row.userId,
    templateId: normalizeTemplateId(row.templateId),
    name: row.name,
    stage: normalizeStage(row.stage),
    mood: normalizeMood(row.mood),
    energy: clamp(row.energy, 0, 100),
    affection: clamp(row.affection, 0, 100),
    lastInteractedAt: toIso(row.lastInteractedAt),
    lastSeenAt: toIso(row.lastSeenAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function moodAnimation(mood: PetMood): PetAnimation {
  switch (mood) {
    case "happy":
      return "happy";
    case "excited":
      return "wave";
    case "sleepy":
      return "sleep";
    case "calm":
      return "blink";
    default:
      return "thinking";
  }
}

function moodBubble(mood: PetMood): string {
  switch (mood) {
    case "happy":
      return "Feeling great right now.";
    case "excited":
      return "Let's do something fun.";
    case "sleepy":
      return "A tiny nap would be perfect.";
    case "calm":
      return "Just vibing with you.";
    default:
      return "What should we do next?";
  }
}

function createSnapshot(
  pet: UserPet,
  template: PetTemplate,
  interactionType?: PetInteractionType,
): PetStateSnapshot {
  const canInteract = pet.energy > 5;
  let animation = moodAnimation(pet.mood);
  let bubbleText: string | null = moodBubble(pet.mood);

  if (interactionType === "greet") {
    animation = "wave";
    bubbleText = pickBySeed(
      template.greetingLines,
      `${pet.id}:${pet.updatedAt}:greet`,
    );
  } else if (interactionType === "pat") {
    animation = "happy";
    bubbleText = "That was nice. Thank you.";
  } else if (interactionType === "feed") {
    animation = "happy";
    bubbleText = "Yum. Energy restored.";
  } else if (interactionType === "play") {
    animation = "wave";
    bubbleText = "Zoom mode activated.";
  } else if (interactionType === "tap") {
    animation = "blink";
    bubbleText = "Boop detected.";
  }

  return {
    mood: pet.mood,
    animation,
    emote: template.emotes[pet.mood],
    bubbleText,
    canInteract,
  };
}

function applyInteraction(
  pet: UserPet,
  type: PetInteractionType,
): { mood: PetMood; energy: number; affection: number } {
  let mood = pet.mood;
  let energy = pet.energy;
  let affection = pet.affection;

  switch (type) {
    case "greet":
      mood = "happy";
      affection += 2;
      break;
    case "pat":
      mood = "happy";
      affection += 4;
      break;
    case "feed":
      mood = "excited";
      affection += 2;
      energy += 8;
      break;
    case "play":
      mood = "excited";
      affection += 3;
      energy -= 6;
      break;
    case "tap":
      mood = "curious";
      affection += 1;
      energy -= 1;
      break;
    case "idle_tick":
      energy -= 2;
      if (energy < 25) {
        mood = "sleepy";
      } else if (affection > 65) {
        mood = "calm";
      } else {
        mood = "curious";
      }
      break;
  }

  return {
    mood,
    energy: clamp(energy, 0, 100),
    affection: clamp(affection, 0, 100),
  };
}

async function getOrCreateUserPetRow(userId: string): Promise<UserPetRow> {
  const [existing] = await db
    .select()
    .from(userPet)
    .where(eq(userPet.userId, userId));

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(userPet)
    .values({
      userId,
      templateId: DEFAULT_TEMPLATE.id,
      name: DEFAULT_TEMPLATE.name,
      stage: "baby",
      mood: "curious",
      energy: 70,
      affection: 50,
      lastSeenAt: new Date(),
    })
    .returning();

  return created;
}

async function buildBundle(
  petRow: UserPetRow,
  interactionType?: PetInteractionType,
): Promise<UserPetBundle> {
  const pet = serializeUserPet(petRow);
  const template = getTemplate(pet.templateId);
  const snapshot = createSnapshot(pet, template, interactionType);
  return { pet, template, snapshot };
}

export async function getPetBundle(userId: string): Promise<UserPetBundle> {
  const petRow = await getOrCreateUserPetRow(userId);

  const [updated] = await db
    .update(userPet)
    .set({ lastSeenAt: new Date(), updatedAt: new Date() })
    .where(eq(userPet.id, petRow.id))
    .returning();

  return buildBundle(updated ?? petRow);
}

export async function updatePetDetails(
  userId: string,
  input: UpdateUserPetInput,
): Promise<UserPetBundle> {
  const petRow = await getOrCreateUserPetRow(userId);
  const nextTemplateId =
    input.templateId !== undefined ? input.templateId : petRow.templateId;

  const [updated] = await db
    .update(userPet)
    .set({
      name: input.name ?? petRow.name,
      templateId: nextTemplateId,
      stage: input.stage ?? petRow.stage,
      mood: input.mood ?? petRow.mood,
      updatedAt: new Date(),
    })
    .where(eq(userPet.id, petRow.id))
    .returning();

  return buildBundle(updated ?? petRow);
}

export async function recordPetEvent(
  userId: string,
  input: RecordPetEventInput,
): Promise<UserPetBundle> {
  const petRow = await getOrCreateUserPetRow(userId);
  const current = serializeUserPet(petRow);
  const next = applyInteraction(current, input.type);
  const now = new Date();

  const [updated] = await db
    .update(userPet)
    .set({
      mood: next.mood,
      energy: next.energy,
      affection: next.affection,
      lastInteractedAt: input.type === "idle_tick" ? petRow.lastInteractedAt : now,
      updatedAt: now,
    })
    .where(eq(userPet.id, petRow.id))
    .returning();

  const effective = updated ?? petRow;

  await db.insert(petEvent).values({
    userId,
    userPetId: effective.id,
    type: input.type,
    route: input.route ?? null,
    payload: input.payload ? JSON.stringify(input.payload) : null,
    createdAt: now,
  });

  return buildBundle(effective, input.type);
}
