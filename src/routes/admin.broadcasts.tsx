import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Send, Trash2, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/broadcasts")({ component: AdminBroadcasts });

interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: string;
  sentAt: Date;
  recipientCount: number;
}

function AdminBroadcasts() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: "1",
      title: "Scheduled Maintenance",
      body: "Our routers will undergo maintenance on Friday from 2-4 AM. We apologize for any inconvenience.",
      audience: "router",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      recipientCount: 1250,
    },
    {
      id: "2",
      title: "New Feature Released",
      body: "We've just launched airtime and data purchase directly from the app! Check it out now.",
      audience: "all",
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recipientCount: 4850,
    },
  ]);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const send = () => {
    if (!title || !body) {
      toast.error("Fill in title & message");
      return;
    }

    const newBroadcast: Broadcast = {
      id: Date.now().toString(),
      title,
      body,
      audience,
      sentAt: new Date(),
      recipientCount: audience === "all" ? 5000 : audience === "active" ? 3200 : 1250,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    toast.success(`Broadcast sent to ${newBroadcast.recipientCount.toLocaleString()} recipients`);
    setTitle("");
    setBody("");
    setAudience("all");
  };

  const deleteBroadcast = (id: string) => {
    setBroadcasts(broadcasts.filter(b => b.id !== id));
    toast.success("Broadcast deleted");
  };

  const resendBroadcast = (broadcast: Broadcast) => {
    toast.success(`Re-sending broadcast to ${broadcast.recipientCount.toLocaleString()} recipients`);
  };

  const formatDate = (date: Date) => {
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
    const labels = { all: "All Users", active: "Active Only", router: "Router Users" };
    return labels[id as keyof typeof labels] || id;
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Broadcasts</h1>

      <div className="glass space-y-3 rounded-2xl p-4">
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">TITLE</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Important update for users" className="w-full rounded-xl bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">MESSAGE</p>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write a clear, concise update for your users…" className="w-full resize-none rounded-xl bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">AUDIENCE</p>
          <div className="flex gap-2">
            {[
              { id: "all", label: "All Users" },
              { id: "active", label: "Active" },
              { id: "router", label: "Router" },
            ].map((a) => (
              <button key={a.id} onClick={() => setAudience(a.id)} className={`tile-press flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${audience === a.id ? "bg-primary text-primary-foreground glow-primary" : "glass text-muted-foreground hover:bg-muted/30"}`}>{a.label}</button>
            ))}
          </div>
        </div>
        <button onClick={send} className="tile-press flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground glow-primary hover:shadow-lg transition-all">
          <Send className="h-4 w-4" /> Send Broadcast
        </button>
      </div>

      {/* Broadcasts History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">BROADCAST HISTORY</h2>

        {broadcasts.length > 0 ? (
          <div className="space-y-2">
            {broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-2">{broadcast.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{broadcast.body}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-muted/20 pt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-muted/20 px-2 py-1 rounded">{getAudienceLabel(broadcast.audience)}</span>
                    <span>{broadcast.recipientCount.toLocaleString()} recipients</span>
                    <span>{formatDate(broadcast.sentAt)}</span>
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
                      onClick={() => deleteBroadcast(broadcast.id)}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBroadcast(null)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">{selectedBroadcast.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBroadcast.body}</p>

            <div className="space-y-2 text-sm border-t border-muted/20 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience:</span>
                <span className="font-semibold">{getAudienceLabel(selectedBroadcast.audience)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipients:</span>
                <span className="font-semibold">{selectedBroadcast.recipientCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-semibold">{selectedBroadcast.sentAt.toLocaleString()}</span>
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
