import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Megaphone, Send, Trash2, RotateCcw, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { supabase } from "@/lib/supabase";
import {
  getBroadcasts,
  createBroadcast,
  deleteBroadcast as deleteBroadcastApi,
  sendBroadcast as sendBroadcastApi,
  subscribeToBroadcasts,
  type Broadcast,
} from "@/lib/admin-service";

export const Route = createFileRoute("/admin/broadcasts")({ component: AdminBroadcasts });

function AdminBroadcasts() {
  useAdminGuard();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "active" | "suspended">("all");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const data = await getBroadcasts();
      setBroadcasts(data);
    } catch (error) {
      console.error("Failed to fetch broadcasts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();

    // Subscribe to realtime updates
    const subscription = subscribeToBroadcasts(() => {
      fetchBroadcasts();
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchBroadcasts]);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Fill in title & message");
      return;
    }

    setSending(true);
    try {
      const newBroadcast = await createBroadcast({
        title: title.trim(),
        body: body.trim(),
        audience,
        status: "sent",
      });

      if (newBroadcast) {
        toast.success(
          `Broadcast sent to ${newBroadcast.recipient_count.toLocaleString()} recipients`,
        );
        // Immediately send it (mark as sent)
        await sendBroadcastApi(newBroadcast.id);
        setTitle("");
        setBody("");
        setAudience("all");
      } else {
        toast.error("Failed to create broadcast");
      }
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const deleteBroadcastHandler = async (id: string) => {
    const success = await deleteBroadcastApi(id);
    if (success) {
      toast.success("Broadcast deleted");
      setBroadcasts(broadcasts.filter((b) => b.id !== id));
      if (selectedBroadcast?.id === id) {
        setSelectedBroadcast(null);
      }
    } else {
      toast.error("Failed to delete broadcast");
    }
  };

  const resendBroadcast = async (broadcast: Broadcast) => {
    toast.success(
      `Re-sending broadcast to ${broadcast.recipient_count.toLocaleString()} recipients`,
    );
    // Could implement resend logic here
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getAudienceLabel = (id: string) => {
    const labels: Record<string, string> = {
      all: "All Users",
      active: "Active Only",
      suspended: "Suspended",
    };
    return labels[id] || id;
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Broadcasts</h1>

      <div className="glass space-y-3 rounded-2xl p-4">
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">TITLE</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Important update for users"
            className="w-full rounded-xl bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">MESSAGE</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write a clear, concise update for your users…"
            className="w-full resize-none rounded-xl bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">AUDIENCE</p>
          <div className="flex gap-2">
            {[
              { id: "all", label: "All Users" },
              { id: "active", label: "Active" },
              { id: "suspended", label: "Suspended" },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id as "all" | "active" | "suspended")}
                className={`tile-press flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                  audience === a.id
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "glass text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={send}
          disabled={sending || !title.trim() || !body.trim()}
          className="tile-press flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground glow-primary hover:shadow-lg transition-all disabled:opacity-50"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send Broadcast
            </>
          )}
        </button>
      </div>

      {/* Broadcasts History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">
          BROADCAST HISTORY ({broadcasts.length})
        </h2>

        {loading ? (
          <div className="glass flex h-32 flex-col items-center justify-center gap-2 rounded-2xl text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading broadcasts...</p>
          </div>
        ) : broadcasts.length > 0 ? (
          <div className="space-y-2">
            {broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm line-clamp-2">{broadcast.title}</p>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${
                          broadcast.status === "sent"
                            ? "bg-neon/20 text-neon"
                            : broadcast.status === "scheduled"
                              ? "bg-gold/20 text-gold"
                              : "bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {broadcast.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {broadcast.body}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-muted/20 pt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-muted/20 px-2 py-1 rounded">
                      {getAudienceLabel(broadcast.audience)}
                    </span>
                    <span>{broadcast.recipient_count?.toLocaleString() || 0} recipients</span>
                    <span>{formatDate(broadcast.sent_at || broadcast.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBroadcast(broadcast)}
                      className="tile-press hover:text-foreground transition-colors p-1"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => resendBroadcast(broadcast)}
                      className="tile-press hover:text-foreground transition-colors p-1"
                      title="Resend broadcast"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBroadcastHandler(broadcast.id)}
                      className="tile-press hover:text-destructive transition-colors p-1"
                      title="Delete broadcast"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass flex h-40 flex-col items-center justify-center gap-2 rounded-2xl text-center">
            <Megaphone className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-semibold">No broadcasts yet</p>
            <p className="text-xs text-muted-foreground">Send your first broadcast above</p>
          </div>
        )}
      </div>

      {/* Broadcast Details Modal */}
      {selectedBroadcast && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBroadcast(null)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">{selectedBroadcast.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedBroadcast.body}
            </p>

            <div className="space-y-2 text-sm border-t border-muted/20 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience:</span>
                <span className="font-semibold">
                  {getAudienceLabel(selectedBroadcast.audience)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipients:</span>
                <span className="font-semibold">
                  {selectedBroadcast.recipient_count?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold capitalize">{selectedBroadcast.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-semibold">
                  {selectedBroadcast.sent_at
                    ? new Date(selectedBroadcast.sent_at).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBroadcast(null)}
              className="tile-press w-full rounded-xl bg-muted/30 py-2 text-sm font-semibold hover:bg-muted/40 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
