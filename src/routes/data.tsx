import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { OperatorPicker } from "@/components/app/OperatorPicker";
import { BarChart3, Calendar, Contact, Tag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/data")({ component: DataPage });

const plans = [
  { icon: BarChart3, label: "DAILY: 1GB (24 Hrs)", price: 350, badge: null },
  { icon: Calendar, label: "WEEKLY: 2GB (7 Days)", price: 500, badge: null },
  { icon: Tag, label: "MONTHLY: 5GB (30 Days)", price: 1500, badge: null },
  { icon: Tag, label: "MEGA: 10GB (30 Days)", price: 3000, badge: "NEW" },
];

function DataPage() {
  useAuthGuard();
  const [op, setOp] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <>
      <TopBar />
      <WalletCard />
      <h1 className="mb-3 text-xl font-bold">
        Welcome back, <span className="gradient-text-gold">Student!</span>
      </h1>
      <p className="mb-3 text-xs tracking-widest text-muted-foreground">SELECT OPERATOR FOR DATA</p>
      <OperatorPicker selected={op} onSelect={setOp} />

      <p className="mt-6 mb-2 text-xs tracking-widest text-muted-foreground">SELECT DATA PLAN</p>
      <div className="space-y-2">
        {plans.map((p, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            className={`tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 ${picked === i ? "ring-2 ring-primary glow-primary" : ""}`}
          >
            <div className="flex items-center gap-3">
              <p.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">
                {p.label} • ₦{p.price.toLocaleString()}
              </span>
            </div>
            {p.badge && (
              <span className="rounded-full bg-destructive px-2 py-0.5 text-[9px] font-bold">
                {p.badge}
              </span>
            )}
            <span className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              Buy
            </span>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-xs tracking-widest text-muted-foreground">ENTER PHONE NUMBER</p>
      <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="080..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button className="tile-press flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
          <Contact className="h-4 w-4 text-primary" />
        </button>
      </div>

      <button
        onClick={() => {
          if (picked === null || !phone) {
            toast.error("Pick a plan & enter phone");
            return;
          }
          toast.success("Data bundle queued");
        }}
        className="tile-press relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-amber-700 py-4 font-bold text-gold-foreground glow-primary"
      >
        <span className="absolute inset-0 animate-shimmer" />
        PROCEED
      </button>
    </>
  );
}
