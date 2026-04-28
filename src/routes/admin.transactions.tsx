import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getTransactions, type Transaction } from "@/lib/admin-service";

export const Route = createFileRoute("/admin/transactions")({ component: AdminTx });

const tabs = ["All", "Airtime", "Data", "TV", "Router"] as const;

function AdminTx() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof tabs[number]>("All");
  const [stats, setStats] = useState({
    volume: 0,
    success: "0%",
    failed: 0,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const data = await getTransactions();
        let filtered = data;

        if (filter !== "All") {
          filtered = data.filter((t) => t.type === filter.toLowerCase());
        }

        setTransactions(filtered);

        // Calculate stats
        const totalVolume = data.reduce((sum, t) => sum + t.amount, 0);
        const completed = data.filter((t) => t.status === "completed").length;
        const failed = data.filter((t) => t.status === "failed").length;
        const successRate = data.length > 0 ? Math.round((completed / data.length) * 100) : 0;

        setStats({
          volume: totalVolume,
          success: `${successRate}%`,
          failed,
        });
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filter]);

  const exportTransactions = () => {
    const csv = [
      ["ID", "User ID", "Type", "Amount", "Status", "Date"].join(","),
      ...transactions.map((t) =>
        [
          t.id,
          t.user_id,
          t.type,
          `₦${t.amount}`,
          t.status,
          new Date(t.created_at).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Transactions exported");
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          onClick={exportTransactions}
          disabled={transactions.length === 0}
          className="tile-press flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-amber-700 px-3 py-2 text-xs font-bold text-gold-foreground disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Volume", v: `₦${stats.volume.toLocaleString()}` },
          { l: "Success", v: stats.success },
          { l: "Failed", v: stats.failed },
        ].map((s) => (
          <div key={s.l} className="glass rounded-xl p-3">
            <p className="text-[10px] tracking-widest text-muted-foreground">{s.l.toUpperCase()}</p>
            <p className="mt-1 text-lg font-black">{loading ? "—" : s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`tile-press shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === t ? "bg-primary/20 text-primary" : "glass text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass flex h-56 flex-col items-center justify-center gap-2 rounded-2xl text-center">
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass flex h-56 flex-col items-center justify-center gap-2 rounded-2xl text-center">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold">No transactions yet</p>
          <p className="text-xs text-muted-foreground">Customer transactions will be listed here.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-border/40">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-primary/5">
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize">{tx.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">₦{tx.amount.toLocaleString()}</p>
                <span className={`inline-block text-xs font-semibold rounded px-2 py-0.5 ${
                  tx.status === "completed" ? "bg-neon/20 text-neon" :
                  tx.status === "failed" ? "bg-destructive/20 text-destructive" :
                  "bg-muted/20 text-muted-foreground"
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
