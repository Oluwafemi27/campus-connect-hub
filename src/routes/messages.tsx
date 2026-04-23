import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { MailOpen, Send } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({ component: MessagesPage });

function MessagesPage() {
  useAuthGuard();
  const [text, setText] = useState("");

  return (
    <>
      <TopBar title="MESSAGES" showBack />
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Inbox <span className="gradient-text-gold">& Support</span></h1>
        <p className="text-xs text-muted-foreground">Chat with the Campus Connect team</p>
      </div>

      <div className="glass-strong flex flex-col items-center justify-center rounded-2xl p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-primary/20 glow-accent">
          <MailOpen className="h-7 w-7 text-accent" />
        </div>
        <p className="text-sm font-bold">Your inbox is empty</p>
        <p className="mt-1 text-xs text-muted-foreground">Start a conversation with support below.</p>
      </div>

      <h2 className="mt-6 mb-3 text-xs tracking-widest text-muted-foreground">SEND A MESSAGE</h2>
      <div className="glass rounded-2xl p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message…"
          rows={4}
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={() => { if (!text.trim()) { toast.error("Write a message first"); return; } toast.success("Message sent"); setText(""); }}
          className="tile-press relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground glow-primary"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </div>
    </>
  );
}
