import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, useToast } from "../components/ui";
import { signUp } from "../lib/auth";
import { honoClient } from "../lib/hono.client";
import { isProfileOnboardingComplete } from "../lib/onboarding";
import type { UserProfile } from "@calorie-critters/shared";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        const message = result.error.message ?? "Signup failed";
        console.error("Better Auth sign-up failed", {
          message: result.error.message ?? null,
          status: "status" in result.error ? result.error.status : null,
          code: "code" in result.error ? result.error.code : null,
          origin: window.location.origin,
          apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
        });
        setError(message);
        notify({
          type: "error",
          title: "Sign up failed",
          description: message,
        });
        setLoading(false);
        return;
      }

      try {
        const profile = await honoClient.profile.get<UserProfile | null>();
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
      console.error("Better Auth sign-up request threw", {
        error: authError,
        origin: window.location.origin,
        apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
      });
      setError(message);
      notify({
        type: "error",
        title: "Sign up failed",
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
            <Link to="/login" className="transition hover:text-foreground">
              Sign in
            </Link>
          </div>
          <CardTitle className="text-center text-[1.8rem]">Create Account</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Start your companion journey in under a minute.
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>

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
                placeholder="8+ characters"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" effect="glow">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account? {" "}
              <Link to="/login" className="font-semibold text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
