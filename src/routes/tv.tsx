import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { toast } from "sonner";

export const Route = createFileRoute("/tv")({ component: TvPage });

const providers = [
  {
    id: "dstv",
    label: "DStv",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/DStv_logo.svg/320px-DStv_logo.svg.png",
    bg: "bg-white",
  },
  {
    id: "gotv",
    label: "GOtv",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/GOtv_logo.svg/320px-GOtv_logo.svg.png",
    bg: "bg-white",
  },
  {
    id: "startimes",
    label: "StarTimes",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/StarTimes_logo.png/320px-StarTimes_logo.png",
    bg: "bg-white",
  },
  {
    id: "showmax",
    label: "Showmax",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Showmax_logo.svg/320px-Showmax_logo.svg.png",
    bg: "bg-black",
  },
];
const amounts = [5000, 10000, 15000];

function TvPage() {
  const [provider, setProvider] = useState("dstv");
  const [card, setCard] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [recurring, setRecurring] = useState(false);

  return (
    <>
      <TopBar />
      <WalletCard />
      <h1 className="mb-3 text-xl font-bold">Welcome back, <span className="gradient-text-gold">Student!</span></h1>
      <p className="mb-3 text-xs tracking-widest text-muted-foreground">SELECT TV PROVIDER TO SUBSCRIBE</p>

      <div className="grid grid-cols-2 gap-3">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`tile-press glass flex h-24 flex-col items-center justify-center rounded-2xl ${provider === p.id ? "ring-2 ring-primary glow-primary" : ""}`}
          >
            <div className={`flex h-12 w-20 items-center justify-center overflow-hidden rounded-lg p-1.5 ${p.bg}`}>
              <img src={p.logo} alt={`${p.label} logo`} className="h-full w-full object-contain" loading="lazy" />
            </div>
            <span className="mt-2 text-xs font-semibold">{p.label}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-xs tracking-widest text-muted-foreground">ENTER SMART CARD / IUC NUMBER</p>
      <div className="glass rounded-xl px-4 py-3">
        <input value={card} onChange={(e) => setCard(e.target.value)} placeholder="1234 5678 9012" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {amounts.map((a) => (
          <button key={a} onClick={() => setAmount(a)} className={`tile-press glass rounded-xl py-3 text-sm font-bold ${amount === a ? "ring-2 ring-primary glow-primary text-primary" : ""}`}>
            ₦{a.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs tracking-widest text-muted-foreground">RECURRING SUBSCRIPTION?</span>
        <button onClick={() => setRecurring(!recurring)} className={`relative h-6 w-11 rounded-full transition-colors ${recurring ? "bg-primary" : "bg-muted"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${recurring ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <button
        onClick={() => { if (!card || !amount) { toast.error("Enter card & pick amount"); return; } toast.success(`${provider.toUpperCase()} subscription queued`); }}
        className="tile-press relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-amber-700 py-4 font-bold text-gold-foreground glow-primary"
      >
        <span className="absolute inset-0 animate-shimmer" />
        PROCEED
      </button>
    </>
  );
}
