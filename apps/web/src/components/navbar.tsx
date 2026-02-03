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
    <header className="border-b border-border bg-surface/70 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-xl font-semibold text-foreground">
          Nicotine Tracker
        </Link>
        <div className="flex items-center gap-4">
          {isPending ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                Profile
              </Button>
              {isOpen ? (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border bg-surface/95 p-3 shadow-lg">
                  <div className="rounded-xl border border-border bg-background/60 p-3">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-semibold">
                      {userEmail ?? "User"}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Link
                      to="/"
                      className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-primary/10"
                      onClick={() => setIsOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/stats"
                      className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-primary/10"
                      onClick={() => setIsOpen(false)}
                    >
                      Stats
                    </Link>
                    <Link
                      to="/settings"
                      className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-primary/10"
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
