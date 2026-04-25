import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Phone, Wifi, Tv, Router, History, ChevronRight, CheckCircle2 } from "lucide-react";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import techSymposiumImg from "@/assets/tech-symposium.jpg";
import campusOfferImg from "@/assets/campus-offer.jpg";
import routerZonesImg from "@/assets/router-zones.jpg";

export const Route = createFileRoute("/")({ component: HomePage });

type Tile = {
  to: "/airtime" | "/data" | "/tv" | "/connect-router" | "/history";
  icon: typeof Phone;
  label: string;
  badge: string | null;
  grad: string;
  check?: boolean;
};
const tiles: Tile[] = [
  {
    to: "/airtime",
    icon: Phone,
    label: "Recharge Airtime",
    badge: "NEW",
    grad: "from-primary/30 to-accent/20",
  },
  {
    to: "/data",
    icon: Wifi,
    label: "Buy Mobile Data",
    badge: null,
    grad: "from-accent/30 to-primary/20",
  },
  {
    to: "/tv",
    icon: Tv,
    label: "TV Subscription",
    badge: "NEW",
    grad: "from-neon/25 to-primary/20",
  },
  {
    to: "/connect-router",
    icon: Router,
    label: "Connect to Campus Router",
    badge: null,
    grad: "from-primary/30 to-neon/20",
    check: true,
  },
  {
    to: "/history",
    icon: History,
    label: "Transaction History",
    badge: "POPULAR",
    grad: "from-gold/25 to-accent/20",
  },
];

function HomePage() {
  const { isAuthenticated, isLoading } = useAuthGuard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ to: "/login", replace: true });
    return null;
  }

  return (
    <>
      <TopBar />
      <WalletCard />

      <h1 className="mb-4 text-2xl font-bold">
        Welcome back, <span className="gradient-text-gold">Student!</span>
      </h1>

      <div className="grid grid-cols-3 gap-3">
        {tiles.map(({ to, icon: Icon, label, badge, grad, check }, i) => (
          <Link
            key={to}
            to={to}
            className="tile-press glass relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-2 text-center animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div
              className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${grad} opacity-60`}
            />
            {badge && (
              <span className="absolute -top-1.5 -right-1.5 rounded-full bg-gradient-to-r from-accent to-primary px-2 py-0.5 text-[8px] font-bold text-primary-foreground">
                {badge}
              </span>
            )}
            {check && <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-neon" />}
            <Icon className="h-7 w-7 text-primary" />
            <span className="text-[10px] font-semibold leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider">FEATURE SLIDESHOW</h2>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { t: "Tech Symposium", s: "Oct 15-17", img: techSymposiumImg },
            { t: "Campus Offer", s: "50% off Mobile Data", img: campusOfferImg },
            { t: "New Router Zones", s: "Block C live now", img: routerZonesImg },
          ].map((c, i) => (
            <div
              key={i}
              className="carousel-card glass tile-press min-w-[180px] rounded-2xl p-4 overflow-hidden flex flex-col"
            >
              <img
                src={c.img}
                alt={c.t}
                className="carousel-image mb-3 h-20 w-full rounded-xl object-cover"
                loading="lazy"
              />
              <p className="text-[10px] tracking-widest text-muted-foreground">CAMPUS</p>
              <p className="text-sm font-bold">{c.t}</p>
              <p className="text-xs text-muted-foreground">{c.s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-bold tracking-wider">RESOURCES & ALERTS</h2>
        <div className="glass space-y-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon" />
            </span>
            <div>
              <p className="text-xs font-semibold">Router Status</p>
              <p className="text-[10px] text-muted-foreground">Online (Good)</p>
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold">Campus Announcements</p>
            <p className="text-[10px] text-muted-foreground">No new announcements</p>
          </div>
        </div>
      </div>
    </>
  );
}
