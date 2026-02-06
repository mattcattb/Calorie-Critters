import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { buttonStyles, Button } from "./ui";
import { signOut } from "../lib/auth";

interface NavbarProps {
  isAuthenticated: boolean;
  isPending?: boolean;
  userEmail?: string | null;
}

export function Navbar({ isAuthenticated, isPending, userEmail }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 isolate border-b border-border/70 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Nicflow
        </Link>
        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Home
              </Link>
              <Link
                to="/stats"
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Stats
              </Link>
              <Link
                to="/settings"
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Settings
              </Link>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {isPending ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                Profile
              </Button>
              {isOpen ? (
                <div className="absolute right-0 top-12 z-[60] w-64 rounded-2xl border border-border bg-surface-elevated p-3 shadow-lg">
                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-semibold">
                      {userEmail ?? "User"}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Link
                      to="/"
                      className="rounded-lg border border-border bg-background/55 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-primary/10"
                      onClick={() => setIsOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/stats"
                      className="rounded-lg border border-border bg-background/55 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-primary/10"
                      onClick={() => setIsOpen(false)}
                    >
                      Stats
                    </Link>
                    <Link
                      to="/settings"
                      className="rounded-lg border border-border bg-background/55 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-primary/10"
                      onClick={() => setIsOpen(false)}
                    >
                      Settings
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="justify-start"
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
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
                Sign in
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
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
