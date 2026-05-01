import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Send, Check, CheckCheck, Clock, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { supabase } from "@/lib/supabase";
import {
  getSupportMessages,
  getSupportReplies,
  createSupportReply,
  updateMessageStatus,
  subscribeToSupportMessages,
  type SupportMessage,
  type SupportReply,
} from "@/lib/admin-service";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

function AdminMessages() {
  useAdminGuard();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replies, setReplies] = useState<Record<string, SupportReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getSupportMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReplies = useCallback(async (messageId: string) => {
    try {
      const data = await getSupportReplies(messageId);
      setReplies((prev) => ({ ...prev, [messageId]: data }));
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    }
  }, []);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates for support messages
    const subscription = subscribeToSupportMessages(() => {
      fetchMessages();
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (selectedMessageId && !replies[selectedMessageId]) {
      fetchReplies(selectedMessageId);
    }
  }, [selectedMessageId, replies, fetchReplies]);

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }

    if (!selectedMessage) return;

    setSending(true);
    try {
      const newReply = await createSupportReply(selectedMessage.id, replyText.trim());

      if (newReply) {
        setReplies((prev) => ({
          ...prev,
          [selectedMessage.id]: [...(prev[selectedMessage.id] || []), newReply],
        }));

        // Update local message status
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id ? { ...m, status: "in_progress" as const } : m,
          ),
        );

        toast.success("Reply sent!");
        setReplyText("");
        setShowReplyForm(false);
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    // In a real app, you'd have a delete function
    // For now, just remove from local state
    setMessages(messages.filter((m) => m.id !== id));
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
    toast.success("Message dismissed");
  };

  const handleResolveMessage = async (id: string) => {
    const success = await updateMessageStatus(id, "resolved");
    if (success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "resolved" as const } : m)),
      );
      toast.success("Message resolved");
    } else {
      toast.error("Failed to resolve message");
    }
  };

  const pendingCount = messages.filter((m) => m.status === "open").length;
  const inProgressCount = messages.filter((m) => m.status === "in_progress").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-primary" />;
      case "resolved":
        return <CheckCheck className="h-4 w-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-orange-500";
      case "in_progress":
        return "text-primary";
      case "resolved":
        return "text-emerald-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Messages & Support</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-emerald-500">{resolvedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground mb-3">
            ALL MESSAGES ({messages.length})
          </h2>

          {loading ? (
            <div className="glass flex h-32 flex-col items-center justify-center gap-2 rounded-2xl">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={`tile-press w-full text-left p-3 rounded-xl transition-all ${
                    selectedMessageId === msg.id
                      ? "glass bg-primary/20 ring-2 ring-primary"
                      : "glass hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-semibold">
                        {msg.subject?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{msg.subject}</p>
                        {getStatusIcon(msg.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="glass rounded-2xl p-4 space-y-4 h-full flex flex-col max-h-96 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-muted/20 pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-lg font-semibold">
                      {selectedMessage.subject?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{selectedMessage.subject}</p>
                    <p className={`text-xs ${getStatusColor(selectedMessage.status)} capitalize`}>
                      {selectedMessage.status.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(selectedMessage.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectedMessage.status !== "resolved" && (
                    <button
                      onClick={() => handleResolveMessage(selectedMessage.id)}
                      className="tile-press p-2 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      title="Mark as resolved"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="tile-press p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* User Message */}
                <div className="flex gap-2 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-semibold">
                      {selectedMessage.subject?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 max-w-xs">
                    <p className="text-sm">{selectedMessage.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(selectedMessage.created_at)}
                    </p>
                  </div>
                </div>

                {/* Admin Replies */}
                {(replies[selectedMessage.id] || []).map((reply) => (
                  <div key={reply.id} className="flex gap-2 justify-end">
                    <div className="bg-primary/20 rounded-xl p-3 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-primary">Admin</span>
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-sm">{reply.reply_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(reply.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {selectedMessage.status !== "resolved" &&
                (!showReplyForm ? (
                  <button
                    onClick={() => setShowReplyForm(true)}
                    className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-2.5 text-sm font-bold text-primary-foreground glow-primary hover:shadow-lg"
                  >
                    Reply to Message
                  </button>
                ) : (
                  <div className="space-y-2 border-t border-muted/20 pt-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply…"
                      rows={3}
                      className="w-full resize-none rounded-xl bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReply}
                        disabled={sending || !replyText.trim()}
                        className="tile-press flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-2 font-bold text-primary-foreground glow-primary hover:shadow-lg disabled:opacity-50"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Reply
                      </button>
                      <button
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyText("");
                        }}
                        className="tile-press px-4 rounded-xl bg-muted/30 py-2 font-bold hover:bg-muted/40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 h-full flex items-center justify-center text-center">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Select a message to view details
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Messages from users will appear in the list
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="glass rounded-2xl p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">💬 MESSAGING INFO</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span>•</span>
            <span>Users can send messages through the Messages page</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Pending messages are marked with an orange clock icon</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Replied messages show a conversation thread</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Use the checkmark to mark messages as resolved</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
