import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { OperatorPicker } from "@/components/app/OperatorPicker";
import { Contact } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/airtime")({ component: AirtimePage });

const amounts = [100, 200, 500, 1000, 2000, 5000];

function AirtimePage() {
  useAuthGuard();
  const [op, setOp] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | null>(null);

  const proceed = () => {
    if (!phone || !amount) { toast.error("Enter phone & pick amount"); return; }
    toast.success(`₦${amount} airtime queued for ${phone}`);
  };

  return (
    <>
      <TopBar />
      <WalletCard />
      <h1 className="mb-3 text-xl font-bold">Welcome back, <span className="gradient-text-gold">Student!</span></h1>
      <p className="mb-3 text-xs tracking-widest text-muted-foreground">SELECT OPERATOR TO BUY AIRTIME</p>
      <OperatorPicker selected={op} onSelect={setOp} />

      <p className="mt-6 mb-2 text-xs tracking-widest text-muted-foreground">ENTER PHONE NUMBER</p>
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

      <div className="mt-5 grid grid-cols-3 gap-3">
        {amounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`tile-press glass rounded-xl py-3 text-sm font-bold ${amount === a ? "ring-2 ring-primary glow-primary text-primary" : ""}`}
          >
            ₦{a.toLocaleString()}
          </button>
        ))}
      </div>

      <button
        onClick={proceed}
        className="tile-press relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-amber-700 py-4 font-bold text-gold-foreground glow-primary"
      >
        <span className="absolute inset-0 animate-shimmer" />
        Proceed
      </button>
    </>
  );
}
