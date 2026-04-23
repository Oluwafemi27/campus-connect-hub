import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Check, CheckCheck, Clock, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

type MessageStatus = "pending" | "replied";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatar: string;
  message: string;
  sentAt: Date;
  status: MessageStatus;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  sentAt: Date;
  isAdmin: boolean;
}

function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      userId: "user123",
      userName: "Chioma O.",
      userEmail: "chioma@university.edu",
      avatar: "👩‍🎓",
      message: "I'm having trouble connecting to the router. The connection keeps dropping every few minutes.",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "pending",
      replies: [],
    },
    {
      id: "2",
      userId: "user456",
      userName: "Tunde A.",
      userEmail: "tunde@university.edu",
      avatar: "👨‍🎓",
      message: "When will the data top-up feature be available? I'm eager to try it!",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: "replied",
      replies: [
        {
          id: "reply1",
          text: "Hi Tunde! The data top-up feature is now live. You can access it from the Payments section. Thank you for your patience!",
          sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isAdmin: true,
        },
      ],
    },
    {
      id: "3",
      userId: "user789",
      userName: "Amara U.",
      userEmail: "amara@university.edu",
      avatar: "👩‍🎓",
      message: "Can I request a feature to download my transaction history as PDF?",
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: "pending",
      replies: [],
    },
  ]);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  const handleReply = () => {
    if (!replyText.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }

    if (!selectedMessage) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      text: replyText,
      sentAt: new Date(),
      isAdmin: true,
    };

    setMessages(messages.map(m => 
      m.id === selectedMessage.id 
        ? { ...m, replies: [...m.replies, newReply], status: "replied" as const }
        : m
    ));

    toast.success("Reply sent!");
    setReplyText("");
    setShowReplyForm(false);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
    toast.success("Message deleted");
  };

  const pendingCount = messages.filter(m => m.status === "pending").length;
  const repliedCount = messages.filter(m => m.status === "replied").length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Messages & Support</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-primary">{pendingCount}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">Replied</p>
          <p className="text-2xl font-bold text-accent">{repliedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground mb-3">ALL MESSAGES ({messages.length})</h2>
          
          {messages.length > 0 ? (
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
                    <span className="text-lg">{msg.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{msg.userName}</p>
                        <div className="shrink-0">
                          {msg.status === "pending" ? (
                            <Clock className="h-4 w-4 text-orange-500" />
                          ) : (
                            <CheckCheck className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(msg.sentAt)}</p>
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
                  <span className="text-3xl">{selectedMessage.avatar}</span>
                  <div>
                    <p className="font-bold text-sm">{selectedMessage.userName}</p>
                    <p className="text-xs text-muted-foreground">{selectedMessage.userEmail}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(selectedMessage.sentAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleDeleteMessage(selectedMessage.id);
                    setSelectedMessageId(null);
                  }}
                  className="tile-press p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* User Message */}
                <div className="flex gap-2 justify-start">
                  <span className="text-lg">{selectedMessage.avatar}</span>
                  <div className="bg-muted/30 rounded-xl p-3 max-w-xs">
                    <p className="text-sm">{selectedMessage.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(selectedMessage.sentAt)}</p>
                  </div>
                </div>

                {/* Admin Replies */}
                {selectedMessage.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2 justify-end">
                    <div className="bg-primary/20 rounded-xl p-3 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-primary">Admin</span>
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-sm">{reply.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(reply.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {!showReplyForm ? (
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
                      className="tile-press flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-2 font-bold text-primary-foreground glow-primary hover:shadow-lg"
                    >
                      <Send className="h-4 w-4" />
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
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 h-full flex items-center justify-center text-center">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Select a message to view details</p>
                <p className="text-xs text-muted-foreground mt-1">Messages from users will appear in the list</p>
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
            <span>Pending messages are marked with a clock icon</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Replied messages show a check mark and conversation thread</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Users receive notifications when you reply to their messages</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
