import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup attempt:", { name, email, phone, password, confirmPassword });
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text-gold">Campus Connect</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="auth-field-group">
            <label htmlFor="name" className="auth-field-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Student"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="auth-field-input"
            />
          </div>

          <div className="auth-field-group">
            <label htmlFor="email" className="auth-field-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="auth-field-input"
            />
          </div>

          <div className="auth-field-group">
            <label htmlFor="phone" className="auth-field-label">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+234 800 0000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="auth-field-input"
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
              autoComplete="new-password"
              className="auth-field-input"
            />
          </div>

          <div className="auth-field-group">
            <label htmlFor="confirmPassword" className="auth-field-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="auth-field-input"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
