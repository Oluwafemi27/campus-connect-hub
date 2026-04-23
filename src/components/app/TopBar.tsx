import { Link } from "@tanstack/react-router";
import { Mail, Settings, Bell, ArrowLeft } from "lucide-react";

export function TopBar({ title = "CAMPUS CONNECT", showBack = false }: { title?: string; showBack?: boolean }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBack ? (
          <Link to="/" className="tile-press glass flex h-9 w-9 items-center justify-center rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 animate-orbit rounded-full border border-primary/40" />
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary to-accent glow-primary" />
          </div>
        )}
        <span className="text-sm font-bold tracking-[0.18em] gradient-text">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {[Mail, Settings, Bell].map((Icon, i) => (
          <button
            key={i}
            className="tile-press glass relative flex h-9 w-9 items-center justify-center rounded-full"
          >
            <Icon className="h-4 w-4" />
            {i === 2 && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WalletCard() {
  return (
    <div className="glass-strong relative mb-5 overflow-hidden rounded-2xl p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-widest text-muted-foreground">WALLET BALANCE</p>
          <p className="mt-1 text-3xl font-bold gradient-text-gold">₦0.00</p>
          <p className="text-[10px] text-muted-foreground">Top up to get started</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-amber-700 text-2xl glow-primary">
          🪙
        </div>
      </div>
    </div>
  );
}
