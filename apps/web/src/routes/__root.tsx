import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Navbar } from "../components/navbar";
import { useSession } from "../lib/auth";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { data: session, isPending } = useSession();

  return (
    <div className="min-h-screen">
      <Navbar
        isAuthenticated={Boolean(session)}
        isPending={isPending}
        userEmail={session?.user.email}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
