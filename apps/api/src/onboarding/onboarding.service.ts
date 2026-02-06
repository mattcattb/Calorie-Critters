import { eq } from "drizzle-orm";
import type { UpdateProfileInput, UserProfile } from "@nicflow/shared";
import { NotFoundException } from "../common/errors";
import { db } from "../db";
import { user } from "../db/schema";

const profileSelect = {
  sex: user.sex,
  weight: user.weight,
  weightUnit: user.weightUnit,
  onboardingCompleted: user.onboardingCompleted,
};

const getProfile = async (userId: string): Promise<UserProfile> => {
  const [profile] = await db
    .select(profileSelect)
    .from(user)
    .where(eq(user.id, userId));
  return profile ?? { onboardingCompleted: false };
};

export const onboardingService = {
  getProfile,

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const updates: Record<string, unknown> = {};

    if (input.sex !== undefined) updates.sex = input.sex;
    if (input.weight !== undefined) updates.weight = input.weight;
    if (input.weightUnit !== undefined) updates.weightUnit = input.weightUnit;

    const shouldComplete =
      input.onboardingCompleted ??
      Boolean(input.sex && input.weight && input.weightUnit);

    if (input.onboardingCompleted !== undefined || shouldComplete) {
      updates.onboardingCompleted = shouldComplete;
    }

    if (Object.keys(updates).length === 0) {
      return getProfile(userId);
    }

    const [updated] = await db
      .update(user)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning(profileSelect);

    if (!updated) {
      throw new NotFoundException("User not found");
    }

    return updated;
  },
};
