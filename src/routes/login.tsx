import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, actionLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }
      toast.success("Welcome back!");
      navigate({ to: "/" });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="login-container mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="login-header mb-8 flex flex-col items-center text-center animate-fade-up">
        <img src={logoImg} alt="Campus Connect" className="mb-4 h-16 w-16 object-contain sm:h-20 sm:w-20" />
        <h1 className="text-2xl font-bold gradient-text sm:text-3xl">Welcome Back</h1>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Sign in to your Campus Connect account</p>
      </div>

      <form onSubmit={onSubmit} className="login-form glass-strong space-y-3 rounded-3xl p-4 animate-fade-up sm:space-y-4 sm:p-6" style={{ animationDelay: "0.1s" }}>
        <div className="email-field space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">EMAIL</label>
          <div className="email-input-wrapper glass flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
            <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@campus.edu"
              className="email-input flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={actionLoading}
            />
          </div>
        </div>

        <div className="password-field space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">PASSWORD</label>
          <div className="password-input-wrapper glass flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
            <Lock className="h-4 w-4 flex-shrink-0 text-primary" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="password-input flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={actionLoading}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="toggle-password flex-shrink-0 text-muted-foreground hover:text-foreground"
              disabled={actionLoading}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="remember-section flex items-center justify-between text-xs">
          <label className="remember-checkbox flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="accent-primary" disabled={actionLoading} /> Remember me
          </label>
          <button type="button" className="forgot-password text-primary hover:underline" disabled={actionLoading}>Forgot password?</button>
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="submit-btn tile-press group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-primary-foreground glow-primary disabled:opacity-60 sm:py-3.5"
        >
          <span className="absolute inset-0 animate-shimmer" />
          {actionLoading ? "Signing in..." : "Sign In"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="login-link mt-6 text-center text-xs text-muted-foreground sm:text-sm">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
