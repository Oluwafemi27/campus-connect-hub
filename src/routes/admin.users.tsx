import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, UserPlus, MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [q, setQ] = useState("");
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => toast.success("Invite link copied")} className="tile-press flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground glow-primary">
          <UserPlus className="h-3.5 w-3.5" /> Invite
        </button>
      </div>

      <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, ID…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>

      <div className="flex gap-2 text-xs">
        {["All", "Active", "Suspended", "Pending"].map((t, i) => (
          <button key={t} className={`tile-press rounded-full px-3 py-1.5 font-semibold ${i === 0 ? "bg-primary/20 text-primary" : "glass text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="glass rounded-2xl">
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-semibold">No users yet</p>
          <p className="text-xs text-muted-foreground">Registered users will appear here.</p>
        </div>
      </div>

      <button className="tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs">
        <span className="font-semibold">Export user list (CSV)</span>
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
