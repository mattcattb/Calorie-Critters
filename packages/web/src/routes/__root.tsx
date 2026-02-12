import { createRootRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@calorie-critters/shared";
import { AppIcon, Button } from "../components/ui";
import { useSession, signOut } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { isProfileOnboardingComplete } from "../lib/onboarding";
import { PetProvider } from "../pet";
import { LogFoodModal } from "../log/log-food-modal";
import { LogFoodModalProvider, useLogFoodModal } from "../log/log-food-modal-context";

export const Route = createRootRoute({
  component: RootLayout,
});

type NavItem = {
  label: string;
  to: "/dashboard" | "/history" | "/goals" | "/settings";
  icon: (active: boolean) => JSX.Element;
};

function iconTone(active: boolean): string {
  return active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))";
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <AppIcon size="xl">
      <path d="M4 10.5L12 4L20 10.5" stroke={iconTone(active)} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10V19H17.5V10" stroke={iconTone(active)} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </AppIcon>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <AppIcon size="xl">
      <circle cx="12" cy="12" r="8" stroke={iconTone(active)} strokeWidth="2.2" />
      <path d="M12 8V12L14.8 13.6" stroke={iconTone(active)} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </AppIcon>
  );
}

function GoalsIcon({ active }: { active: boolean }) {
  return (
    <AppIcon size="xl">
      <circle cx="12" cy="12" r="7.8" stroke={iconTone(active)} strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke={iconTone(active)} strokeWidth="2" />
      <circle cx="12" cy="12" r="1.7" fill={iconTone(active)} />
    </AppIcon>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <AppIcon size="xl">
      <path d="M10.8 3.7L13.2 3.7L13.8 5.5C14.2 5.6 14.6 5.8 15 6L16.7 5.2L18.4 6.9L17.6 8.6C17.9 9 18.1 9.4 18.2 9.8L20 10.4V12.8L18.2 13.4C18.1 13.8 17.9 14.2 17.6 14.6L18.4 16.3L16.7 18L15 17.2C14.6 17.5 14.2 17.7 13.8 17.8L13.2 19.6H10.8L10.2 17.8C9.8 17.7 9.4 17.5 9 17.2L7.3 18L5.6 16.3L6.4 14.6C6.1 14.2 5.9 13.8 5.8 13.4L4 12.8V10.4L5.8 9.8C5.9 9.4 6.1 9 6.4 8.6L5.6 6.9L7.3 5.2L9 6C9.4 5.8 9.8 5.6 10.2 5.5L10.8 3.7Z" stroke={iconTone(active)} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="11.6" r="2.4" stroke={iconTone(active)} strokeWidth="2" />
    </AppIcon>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: (active) => <HomeIcon active={active} /> },
  { label: "History", to: "/history", icon: (active) => <HistoryIcon active={active} /> },
  { label: "Goals", to: "/goals", icon: (active) => <GoalsIcon active={active} /> },
  { label: "Settings", to: "/settings", icon: (active) => <SettingsIcon active={active} /> },
];

function isActivePath(currentPath: string, targetPath: NavItem["to"]): boolean {
  return currentPath.startsWith(targetPath);
}

function tabClass(): string {
  return "inline-flex h-11 w-11 shrink-0 items-center justify-center";
}

function RootLayout() {
  return (
    <LogFoodModalProvider>
      <RootLayoutContent />
    </LogFoodModalProvider>
  );
}

function RootLayoutContent() {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const { openLog } = useLogFoodModal();
  const isOnboardingRoute = location.pathname === "/onboarding";

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<UserProfile | null>("/api/profile"),
    enabled: Boolean(session && !isPending),
  });

  useEffect(() => {
    if (!session || isPending || profileQuery.isPending) {
      return;
    }

    const pathname = location.pathname;
    const isAuthRoute = pathname === "/login" || pathname === "/signup";
    const isComplete = isProfileOnboardingComplete(profileQuery.data);

    if (isAuthRoute) {
      navigate({ to: isComplete ? "/dashboard" : "/onboarding", replace: true });
      return;
    }

    if (!isComplete && !isOnboardingRoute && !isAuthRoute) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }

    if (isComplete && isOnboardingRoute) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [
    isPending,
    location.pathname,
    navigate,
    profileQuery.data,
    profileQuery.isPending,
    session,
  ]);

  return (
    <PetProvider>
      <div className={isOnboardingRoute ? "min-h-screen w-full" : "mx-auto min-h-screen w-full max-w-[860px] px-3 py-4 sm:px-5 sm:py-5"}>
        {isOnboardingRoute ? null : (
          <header className="page-shell sticky top-3 z-40 mb-4 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg text-primary-foreground">
                  ☺
                </span>
                <span className="font-display text-xl font-black tracking-tight text-primary">CALORIE CRITTERS</span>
              </Link>

              {isPending ? null : session ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign in</Button>
                </Link>
              )}
            </div>
          </header>
        )}

        <main className={session && !isOnboardingRoute ? "pb-32" : ""}>
          <Outlet />
        </main>
      </div>

      {session && !isOnboardingRoute ? (
        <div className="fixed inset-x-0 bottom-5 z-50 px-3 sm:px-5">
          <nav className="mx-auto flex w-full max-w-[560px] items-center justify-between rounded-[2.25rem] border border-indigo-100 bg-white/94 px-5 py-1.5 shadow-2xl backdrop-blur-xl">
            {NAV_ITEMS.slice(0, 2).map((item) => {
              const active = isActivePath(location.pathname, item.to);
              return (
                <Link key={item.to} to={item.to} className={tabClass()} aria-label={item.label}>
                  {item.icon(active)}
                </Link>
              );
            })}

            <button
              type="button"
              aria-label="Log Food"
              onClick={openLog}
              className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border-4 border-white bg-indigo-600 text-white shadow-[0_14px_26px_hsl(245_78%_60%/0.45)]"
            >
              <AppIcon size="xl" className="h-9 w-9">
                <path d="M12 5.5V18.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M5.5 12H18.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              </AppIcon>
            </button>

            {NAV_ITEMS.slice(2).map((item) => {
              const active = isActivePath(location.pathname, item.to);
              return (
                <Link key={item.to} to={item.to} className={tabClass()} aria-label={item.label}>
                  {item.icon(active)}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}

      {session && !isOnboardingRoute ? <LogFoodModal /> : null}
    </PetProvider>
  );
}
