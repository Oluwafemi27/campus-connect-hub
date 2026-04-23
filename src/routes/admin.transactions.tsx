import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/transactions")({ component: AdminTx });

const tabs = ["All", "Airtime", "Data", "TV", "Router"];

function AdminTx() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={() => toast.success("Export queued")} className="tile-press flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-amber-700 px-3 py-2 text-xs font-bold text-gold-foreground">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ l: "Volume", v: "₦0" }, { l: "Success", v: "0%" }, { l: "Failed", v: "0" }].map((s) => (
          <div key={s.l} className="glass rounded-xl p-3">
            <p className="text-[10px] tracking-widest text-muted-foreground">{s.l.toUpperCase()}</p>
            <p className="mt-1 text-lg font-black">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {tabs.map((t, i) => (
          <button key={t} className={`tile-press shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${i === 0 ? "bg-primary/20 text-primary" : "glass text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="glass flex h-56 flex-col items-center justify-center gap-2 rounded-2xl text-center">
        <Receipt className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-semibold">No transactions yet</p>
        <p className="text-xs text-muted-foreground">Customer transactions will be listed here.</p>
      </div>
    </div>
  );
}
