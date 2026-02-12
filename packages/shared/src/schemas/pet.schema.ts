import { z } from "zod";
import {
  PET_TEMPLATE_IDS,
  PET_STAGES,
  PET_MOODS,
  PET_INTERACTION_TYPES,
} from "../constants";

export const petTemplateIdSchema = z.enum(PET_TEMPLATE_IDS);
export const petStageSchema = z.enum(PET_STAGES);
export const petMoodSchema = z.enum(PET_MOODS);
export const petInteractionTypeSchema = z.enum(PET_INTERACTION_TYPES);

export const updateUserPetSchema = z
  .object({
    name: z.string().trim().min(1).max(40).optional(),
    templateId: petTemplateIdSchema.optional(),
    stage: petStageSchema.optional(),
    mood: petMoodSchema.optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field is required",
  });

export const recordPetEventSchema = z.object({
  type: petInteractionTypeSchema,
  route: z.string().trim().max(120).optional(),
  payload: z.record(z.unknown()).optional(),
});

export type UpdateUserPetInput = z.infer<typeof updateUserPetSchema>;
export type RecordPetEventInput = z.infer<typeof recordPetEventSchema>;
