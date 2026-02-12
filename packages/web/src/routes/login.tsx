import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, useToast } from "../components/ui";
import { signIn } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { isProfileOnboardingComplete } from "../lib/onboarding";
import type { UserProfile } from "@calorie-critters/shared";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        const message = result.error.message ?? "Login failed";
        console.error("Better Auth sign-in failed", {
          message: result.error.message ?? null,
          status: "status" in result.error ? result.error.status : null,
          code: "code" in result.error ? result.error.code : null,
          origin: window.location.origin,
          apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
        });
        setError(message);
        notify({
          type: "error",
          title: "Sign in failed",
          description: message,
        });
        setLoading(false);
        return;
      }

      try {
        const profile = await apiFetch<UserProfile | null>("/api/profile");
        if (isProfileOnboardingComplete(profile)) {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/onboarding" });
        }
      } catch {
        navigate({ to: "/onboarding" });
      }
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : "Unable to reach auth service";
      console.error("Better Auth sign-in request threw", {
        error: authError,
        origin: window.location.origin,
        apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
      });
      setError(message);
      notify({
        type: "error",
        title: "Sign in failed",
        description: message,
      });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-6 sm:py-10">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link to="/" className="transition hover:text-foreground">
              Back
            </Link>
            <Link to="/signup" className="transition hover:text-foreground">
              Create account
            </Link>
          </div>
          <CardTitle className="text-center text-[1.8rem]">Welcome Back</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Pick up where you left off with your critter.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[var(--radius-sm)] border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}
            <div className="field-grid">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>

            <div className="field-grid">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" effect="glow">
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New here? {" "}
              <Link to="/signup" className="font-semibold text-foreground hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
