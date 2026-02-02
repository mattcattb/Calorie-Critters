import { Link } from "@tanstack/react-router";
import { buttonStyles, Button } from "./ui";
import { signOut } from "../lib/auth";

interface NavbarProps {
  isAuthenticated: boolean;
  isPending?: boolean;
  userEmail?: string | null;
}

export function Navbar({ isAuthenticated, isPending, userEmail }: NavbarProps) {
  return (
    <header className="border-b border-border bg-surface/70 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-xl font-semibold text-foreground">
          Nicotine Tracker
        </Link>
        <div className="flex items-center gap-4">
          {isPending ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
                activeProps={{
                  className: buttonStyles({
                    variant: "secondary",
                    size: "sm",
                  }),
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/stats"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
                activeProps={{
                  className: buttonStyles({
                    variant: "secondary",
                    size: "sm",
                  }),
                }}
              >
                Stats
              </Link>
              <Link
                to="/settings"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
                activeProps={{
                  className: buttonStyles({
                    variant: "secondary",
                    size: "sm",
                  }),
                }}
              >
                Settings
              </Link>
              {userEmail ? (
                <span className="text-sm text-muted-foreground">
                  {userEmail}
                </span>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
                activeProps={{
                  className: buttonStyles({
                    variant: "secondary",
                    size: "sm",
                  }),
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={buttonStyles({ size: "sm", variant: "primary" })}
                activeProps={{
                  className: buttonStyles({
                    size: "sm",
                    variant: "secondary",
                  }),
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
