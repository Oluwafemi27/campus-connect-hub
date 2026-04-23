import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Welcome back!");
      navigate({ to: "/" });
    }, 900);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="mb-8 flex flex-col items-center text-center animate-fade-up">
        <img src="/src/assets/logo.png" alt="Campus Connect" className="mb-4 h-20 w-20 object-contain" />
        <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your Campus Connect account</p>
      </div>

      <form onSubmit={onSubmit} className="glass-strong space-y-4 rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">EMAIL</label>
          <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
            <Mail className="h-4 w-4 text-primary" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@campus.edu"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">PASSWORD</label>
          <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
            <Lock className="h-4 w-4 text-primary" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="accent-primary" /> Remember me
          </label>
          <button type="button" className="text-primary hover:underline">Forgot password?</button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="tile-press group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-primary-foreground glow-primary disabled:opacity-60"
        >
          <span className="absolute inset-0 animate-shimmer" />
          {loading ? "Signing in..." : "Sign In"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
