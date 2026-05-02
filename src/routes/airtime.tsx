import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { OperatorPicker } from "@/components/app/OperatorPicker";
import { Contact, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAirtimesServer, purchaseAirtimeServer, type Airtime } from "@/server/glad-tidings";

export const Route = createFileRoute("/airtime")({ component: AirtimePage });

function AirtimePage() {
  useAuthGuard();
  const [op, setOp] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [airtimes, setAirtimes] = useState<Airtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchAirtimes = async () => {
      try {
        setLoading(true);
        const data = await getAirtimesServer();
        setAirtimes(data);
      } catch (error) {
        toast.error("Failed to load airtimes");
      } finally {
        setLoading(false);
      }
    };

    fetchAirtimes();
  }, []);

  const handlePurchase = async () => {
    if (!phone || !picked) {
      toast.error("Enter phone & pick amount");
      return;
    }

    try {
      setPurchasing(true);
      await purchaseAirtimeServer(picked, phone);
      toast.success("Airtime purchase initiated");
      setPicked(null);
      setPhone("");
    } catch (error) {
      toast.error("Failed to purchase airtime");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <>
      <TopBar />
      <WalletCard />
      <h1 className="mb-3 text-xl font-bold">
        Welcome back, <span className="gradient-text-gold">Student!</span>
      </h1>
      <p className="mb-3 text-xs tracking-widest text-muted-foreground">
        SELECT OPERATOR TO BUY AIRTIME
      </p>
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
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : airtimes.length > 0 ? (
          airtimes.map((airtime) => (
            <button
              key={airtime.id}
              onClick={() => setPicked(airtime.id)}
              className={`tile-press glass rounded-xl py-3 text-sm font-bold ${picked === airtime.id ? "ring-2 ring-primary glow-primary text-primary" : ""}`}
            >
              ₦{airtime.amount.toLocaleString()}
            </button>
          ))
        ) : (
          <p className="col-span-3 text-center text-sm text-muted-foreground">
            No airtimes available
          </p>
        )}
      </div>

      <button
        onClick={handlePurchase}
        disabled={purchasing}
        className="tile-press relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-amber-700 py-4 font-bold text-gold-foreground glow-primary disabled:opacity-50"
      >
        <span className="absolute inset-0 animate-shimmer" />
        {purchasing ? "Processing..." : "Proceed"}
      </button>
    </>
  );
}
