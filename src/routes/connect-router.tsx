import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Lock, ArrowRight, Wifi, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AtomicParticles } from "@/components/app/AtomicParticles";

export const Route = createFileRoute("/connect-router")({ component: ConnectPage });

function ConnectPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const onConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Enter your router password");
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      toast.success("Connected to Campus Router");
      setTimeout(() => navigate({ to: "/" }), 1500);
    }, 1800);
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 py-8">
      {/* 3D atomic particle field */}
      <AtomicParticles className="pointer-events-none fixed inset-0 -z-10 h-screen w-full" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/10 to-background/70" />

      <Link
        to="/"
        className="tile-press glass mb-6 flex h-9 w-9 items-center justify-center rounded-full self-start"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <h1 className="text-center text-3xl font-bold leading-tight gradient-text animate-fade-up">
        Connect to Router
        <br />
        Mobile Data
      </h1>

      <form
        onSubmit={onConnect}
        className="glass-strong mt-8 rounded-3xl p-6 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
        noValidate
      >
        <h2 className="text-center text-xl font-bold text-primary">Secure Authentication</h2>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter your password to establish a quantum-encrypted link.
        </p>

        <div className="glass mt-5 flex items-center gap-3 rounded-xl px-4 py-3">
          <Lock className="h-4 w-4 text-primary" />
          <input
            type="password"
            name="router-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-neon/10 px-3 py-2 text-[11px] text-neon">
          <ShieldCheck className="h-3.5 w-3.5" />
          End-to-end encrypted. Your password is never stored.
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            type="submit"
            disabled={connecting || connected}
            className="tile-press relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-neon glow-primary disabled:opacity-80"
          >
            <span
              className={`absolute inset-0 rounded-full border-2 border-primary/40 ${connecting ? "animate-orbit" : ""}`}
            />
            <span
              className={`absolute -inset-2 rounded-full border border-accent/40 ${connecting ? "animate-orbit" : ""}`}
              style={{ animationDirection: "reverse" }}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
              {connected ? (
                <Wifi className="h-6 w-6 text-neon" />
              ) : connecting ? (
                <Wifi className="h-6 w-6 animate-pulse text-primary" />
              ) : (
                <ArrowRight className="h-6 w-6 text-foreground" />
              )}
            </div>
          </button>
          <p
            className={`mt-4 text-2xl font-black tracking-widest ${connected ? "text-neon" : "text-muted-foreground"}`}
          >
            {connected ? "CONNECTED" : connecting ? "CONNECTING..." : "TAP TO LINK"}
          </p>
        </div>
      </form>
    </div>
  );
}
