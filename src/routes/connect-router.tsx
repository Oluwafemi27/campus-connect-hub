import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, Wifi, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/connect-router")({ component: ConnectPage });

function ConnectPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const onConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { toast.error("Enter your router password"); return; }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      toast.success("Connected to Campus Router");
      setTimeout(() => navigate({ to: "/" }), 1500);
    }, 1800);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 py-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-neon/20 blur-3xl" />
      </div>

      <Link to="/" className="tile-press glass mb-6 flex h-9 w-9 items-center justify-center rounded-full self-start">
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <h1 className="text-center text-3xl font-bold leading-tight gradient-text animate-fade-up">
        Connect to Router<br />Mobile Data
      </h1>

      <form onSubmit={onConnect} className="glass-strong mt-8 rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-center text-xl font-bold text-primary">Secure Authentication</h2>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter your password to establish a quantum-encrypted link.
        </p>

        <div className="glass mt-5 flex items-center gap-3 rounded-xl px-4 py-3">
          <Lock className="h-4 w-4 text-primary" />
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-medium">Show Password</span>
          <button
            type="button"
            onClick={() => setShow(!show)}
            className={`relative h-6 w-11 rounded-full transition-colors ${show ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${show ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            type="submit"
            disabled={connecting || connected}
            className="tile-press relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-neon glow-primary disabled:opacity-80"
          >
            <span className={`absolute inset-0 rounded-full border-2 border-primary/40 ${connecting ? "animate-orbit" : ""}`} />
            <span className={`absolute -inset-2 rounded-full border border-accent/40 ${connecting ? "animate-orbit" : ""}`} style={{ animationDirection: "reverse" }} />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
              {connected ? <Wifi className="h-6 w-6 text-neon" /> : connecting ? <Wifi className="h-6 w-6 animate-pulse text-primary" /> : <ArrowRight className="h-6 w-6 text-foreground" />}
            </div>
          </button>
          <p className={`mt-4 text-2xl font-black tracking-widest ${connected ? "text-neon" : "text-muted-foreground"}`}>
            {connected ? "CONNECTED" : connecting ? "CONNECTING..." : "TAP TO LINK"}
          </p>
        </div>
      </form>
    </div>
  );
}
