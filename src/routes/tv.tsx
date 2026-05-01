import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { toast } from "sonner";
import {
  getTVSubscriptions,
  purchaseTVSubscription,
  type TVSubscription,
} from "@/lib/glad-tidings";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/tv")({ component: TvPage });

function TvPage() {
  useAuthGuard();
  const [card, setCard] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<TVSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const data = await getTVSubscriptions();
        setSubscriptions(data);
        if (data.length > 0) {
          setPicked(data[0].id);
        }
      } catch (error) {
        toast.error("Failed to load TV subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handlePurchase = async () => {
    if (!card || !picked) {
      toast.error("Enter card & pick subscription");
      return;
    }

    try {
      setPurchasing(true);
      await purchaseTVSubscription(picked, card);
      toast.success("TV subscription purchase initiated");
      setPicked(null);
      setCard("");
    } catch (error) {
      toast.error("Failed to purchase TV subscription");
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
      <p className="mb-3 text-xs tracking-widest text-muted-foreground">SELECT TV SUBSCRIPTION</p>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setPicked(sub.id)}
              className={`tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 ${picked === sub.id ? "ring-2 ring-primary glow-primary" : ""}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold">{sub.name}</span>
                <span className="text-xs text-muted-foreground">
                  {sub.provider} • {sub.duration}
                </span>
              </div>
              <span className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                ₦{sub.price.toLocaleString()}
              </span>
            </button>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">No TV subscriptions available</p>
        )}
      </div>

      <p className="mt-5 mb-2 text-xs tracking-widest text-muted-foreground">
        ENTER SMART CARD / IUC NUMBER
      </p>
      <div className="glass rounded-xl px-4 py-3">
        <input
          value={card}
          onChange={(e) => setCard(e.target.value)}
          placeholder="1234 5678 9012"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
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
