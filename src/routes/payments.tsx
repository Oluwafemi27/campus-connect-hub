import { createFileRoute } from "@tanstack/react-router";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { CreditCard, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/payments")({ component: PaymentsPage });

function PaymentsPage() {
  return (
    <>
      <TopBar title="PAYMENTS" />
      <WalletCard />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => toast.success("Top up flow coming soon")} className="tile-press glass flex flex-col items-center gap-1.5 rounded-2xl p-4">
          <ArrowDownLeft className="h-5 w-5 text-neon" />
          <span className="text-xs font-semibold">Top Up</span>
        </button>
        <button onClick={() => toast.success("Withdraw flow coming soon")} className="tile-press glass flex flex-col items-center gap-1.5 rounded-2xl p-4">
          <ArrowUpRight className="h-5 w-5 text-accent" />
          <span className="text-xs font-semibold">Withdraw</span>
        </button>
      </div>

      <p className="mt-6 mb-2 text-xs tracking-widest text-muted-foreground">PAYMENT METHODS</p>
      <button className="tile-press glass flex w-full items-center gap-3 rounded-2xl p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20"><Plus className="h-5 w-5 text-primary" /></div>
        <span className="text-sm font-semibold">Link new card or account</span>
      </button>

      <p className="mt-6 mb-2 text-xs tracking-widest text-muted-foreground">RECENT TRANSACTIONS</p>
      <div className="glass rounded-2xl p-6 text-center">
        <CreditCard className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No transactions yet.</p>
      </div>
    </>
  );
}
