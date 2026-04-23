import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { Home, Smartphone, CreditCard, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/devices", icon: Smartphone, label: "Devices" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/map", icon: MapPin, label: "Map" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function AppShell() {
  const location = useLocation();
  const hideNav = ["/login", "/signup", "/connect-router"].includes(location.pathname);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col">
      {/* ambient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-neon/15 blur-3xl" />
      </div>

      <main key={location.pathname} className="animate-fade-up flex-1 px-5 pt-6 pb-28">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 px-3 pb-3">
          <div className="flex items-center justify-around rounded-2xl border border-white/15 bg-background/85 px-2 py-2 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            {tabs.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "tile-press relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-xs",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 -z-10 rounded-xl bg-primary/15 glow-primary" />
                  )}
                  <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
