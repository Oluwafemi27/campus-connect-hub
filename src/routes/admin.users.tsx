import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, UserPlus, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { getUsers, searchUsers, type User } from "@/lib/admin-service";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"All" | "Active" | "Suspended" | "Pending">("All");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = q ? await searchUsers(q) : await getUsers();
        let filtered = data;
        if (status !== "All") {
          filtered = data.filter((u) => u.status === status.toLowerCase());
        }
        setUsers(filtered);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [q, status]);

  const exportCSV = () => {
    const csv = [
      ["ID", "Name", "Email", "Phone", "Status", "Joined"].join(","),
      ...users.map((u) =>
        [
          u.id,
          u.name || "",
          u.email,
          u.phone || "",
          u.status,
          new Date(u.created_at).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("User list exported");
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => toast.success("Invite link copied")}
          className="tile-press flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground glow-primary"
        >
          <UserPlus className="h-3.5 w-3.5" /> Invite
        </button>
      </div>

      <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, ID…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2 text-xs">
        {(["All", "Active", "Suspended", "Pending"] as const).map((t, i) => (
          <button
            key={t}
            onClick={() => setStatus(t)}
            className={`tile-press rounded-full px-3 py-1.5 font-semibold ${
              status === t ? "bg-primary/20 text-primary" : "glass text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass rounded-2xl">
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold">No users found</p>
            <p className="text-xs text-muted-foreground">Registered users will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-border/40">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-primary/5">
              <div className="flex-1">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                user.status === "active" ? "bg-neon/20 text-neon" :
                user.status === "suspended" ? "bg-destructive/20 text-destructive" :
                "bg-muted/20 text-muted-foreground"
              }`}>
                {user.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={exportCSV}
        disabled={users.length === 0}
        className="tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs disabled:opacity-50"
      >
        <span className="font-semibold">Export user list (CSV)</span>
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
