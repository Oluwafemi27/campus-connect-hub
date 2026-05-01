import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  UserPlus,
  MoreVertical,
  Loader2,
  Shield,
  UserX,
  UserCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  searchUsers,
  updateUserStatus,
  subscribeToUsers,
  type User,
} from "@/lib/admin-service";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"All" | "Active" | "Suspended" | "Pending">("All");

  const fetchUsers = useCallback(async () => {
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
  }, [q, status]);

  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime user updates
    const subscription = subscribeToUsers(() => {
      fetchUsers();
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchUsers]);

  const updateUserStatusHandler = async (
    userId: string,
    newStatus: "active" | "suspended" | "pending",
  ) => {
    const success = await updateUserStatus(userId, newStatus);
    if (success) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      toast.success(
        `User ${newStatus === "active" ? "activated" : newStatus === "suspended" ? "suspended" : "marked pending"}`,
      );
    } else {
      toast.error("Failed to update user status");
    }
  };

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
        ].join(","),
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

  const getStatusIcon = (userStatus: string) => {
    switch (userStatus) {
      case "active":
        return <UserCheck className="h-3.5 w-3.5 text-neon" />;
      case "suspended":
        return <UserX className="h-3.5 w-3.5 text-destructive" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {users.length} user{users.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => toast.success("Invite link copied")}
            className="tile-press flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground glow-primary"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite
          </button>
        </div>
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
        {(["All", "Active", "Suspended", "Pending"] as const).map((t) => (
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
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass rounded-2xl">
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold">No users found</p>
            <p className="text-xs text-muted-foreground">
              {q ? "Try a different search term" : "Registered users will appear here"}
            </p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-border/40">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-primary/5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name || "Unnamed User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.status === "active"
                      ? "bg-neon/20 text-neon"
                      : user.status === "suspended"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  {getStatusIcon(user.status)}
                  {user.status}
                </span>

                {/* Quick actions dropdown could go here */}
                <button
                  onClick={() => {
                    if (user.status === "active") {
                      updateUserStatusHandler(user.id, "suspended");
                    } else if (user.status === "suspended" || user.status === "pending") {
                      updateUserStatusHandler(user.id, "active");
                    }
                  }}
                  className="tile-press p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  title={user.status === "active" ? "Suspend user" : "Activate user"}
                >
                  {user.status === "active" ? (
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
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
