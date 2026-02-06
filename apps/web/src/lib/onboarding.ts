import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@nicflow/shared";
import { api } from "./api";

export const useOnboardingProfile = (enabled: boolean) =>
  useQuery({
    queryKey: ["onboardingProfile"],
    queryFn: async () => {
      const res = await api.onboarding.$get();
      return res.json() as Promise<UserProfile>;
    },
    enabled,
  });
