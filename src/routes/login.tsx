import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      if (errorMessage.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check and try again.");
      } else if (errorMessage.includes("Email not confirmed")) {
        setError("Please confirm your email address before logging in.");
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text-gold">Campus Connect</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="auth-field-group">
            <label htmlFor="email" className="auth-field-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-field-input"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="auth-field-group">
            <label htmlFor="password" className="auth-field-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-field-input"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
