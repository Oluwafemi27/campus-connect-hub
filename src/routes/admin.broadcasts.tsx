import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/broadcasts")({ component: AdminBroadcasts });

function AdminBroadcasts() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  const send = () => {
    if (!title || !body) { toast.error("Fill in title & message"); return; }
    toast.success("Broadcast scheduled");
    setTitle(""); setBody("");
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Broadcasts</h1>

      <div className="glass space-y-3 rounded-2xl p-4">
        <div>
          <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground">TITLE</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Outage notice" className="w-full rounded-xl bg-muted/30 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
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
              <button key={a.id} onClick={() => setAudience(a.id)} className={`tile-press flex-1 rounded-xl py-2 text-xs font-semibold ${audience === a.id ? "bg-primary text-primary-foreground glow-primary" : "glass text-muted-foreground"}`}>{a.label}</button>
            ))}
          </div>
        </div>
        <button onClick={send} className="tile-press flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground glow-primary">
          <Send className="h-4 w-4" /> Send Broadcast
        </button>
      </div>

      <div className="glass flex h-40 flex-col items-center justify-center gap-2 rounded-2xl text-center">
        <Megaphone className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-semibold">No past broadcasts</p>
        <p className="text-xs text-muted-foreground">Sent messages will appear here.</p>
      </div>
    </div>
  );
}
