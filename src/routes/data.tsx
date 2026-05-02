import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { OperatorPicker } from "@/components/app/OperatorPicker";
import { BarChart3, Calendar, Contact, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getDataBundlesServer, purchaseDataBundleServer, type DataBundle } from "@/server/glad-tidings";

export const Route = createFileRoute("/data")({ component: DataPage });

function DataPage() {
  useAuthGuard();
  const [op, setOp] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [bundles, setBundles] = useState<DataBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const data = await getDataBundlesServer();
        setBundles(data);
      } catch (error) {
        toast.error("Failed to load data bundles");
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const getIcon = (name: string) => {
    if (name.toLowerCase().includes("daily")) return BarChart3;
    if (name.toLowerCase().includes("weekly")) return Calendar;
    return Tag;
  };

  const handlePurchase = async () => {
    if (!picked || !phone) {
      toast.error("Pick a plan & enter phone");
      return;
    }

    try {
      setPurchasing(true);
      await purchaseDataBundleServer(picked, phone);
      toast.success("Data bundle purchase initiated");
      setPicked(null);
      setPhone("");
    } catch (error) {
      toast.error("Failed to purchase data bundle");
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
      <p className="mb-3 text-xs tracking-widest text-muted-foreground">SELECT OPERATOR FOR DATA</p>
      <OperatorPicker selected={op} onSelect={setOp} />

      <p className="mt-6 mb-2 text-xs tracking-widest text-muted-foreground">SELECT DATA PLAN</p>
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : bundles.length > 0 ? (
          bundles.map((bundle) => {
            const Icon = getIcon(bundle.name);
            return (
              <button
                key={bundle.id}
                onClick={() => setPicked(bundle.id)}
                className={`tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 ${picked === bundle.id ? "ring-2 ring-primary glow-primary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">
                    {bundle.name} • ₦{bundle.price.toLocaleString()}
                  </span>
                </div>
                <span className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                  Buy
                </span>
              </button>
            );
          })
        ) : (
          <p className="text-center text-sm text-muted-foreground">No data bundles available</p>
        )}
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
        onClick={handlePurchase}
        disabled={purchasing}
        className="tile-press relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-amber-700 py-4 font-bold text-gold-foreground glow-primary disabled:opacity-50"
      >
        <span className="absolute inset-0 animate-shimmer" />
        {purchasing ? "Processing..." : "PROCEED"}
      </button>
    </>
  );
}
