import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { ArrowLeft, MessageCircle, Mail, Phone, Clock, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/help-support")({ component: HelpSupportPage });

const faqs = [
  {
    id: 1,
    question: "How do I top up my wallet?",
    answer: "Go to the Payments section and tap 'Top Up Wallet'. Choose your preferred payment method (Card, Bank Transfer, or USSD) and enter your desired amount.",
  },
  {
    id: 2,
    question: "Why is my transaction pending?",
    answer: "Transactions are usually completed within minutes. Bank transfers via USSD may take 5-10 minutes. Check your transaction history for status updates.",
  },
  {
    id: 3,
    question: "How do I report a problem?",
    answer: "Use the 'Report Issue' form below to describe your problem in detail. Our support team will review and respond within 24 hours.",
  },
  {
    id: 4,
    question: "Can I cancel a transaction?",
    answer: "Completed transactions cannot be cancelled. If you believe there was an error, contact our support team with your transaction ID.",
  },
  {
    id: 5,
    question: "How secure is my data?",
    answer: "We use industry-standard encryption (SSL/TLS) to protect your data. Your financial information is never stored in plain text.",
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    answer: "We accept Debit/Credit Cards, Bank Transfers via USSD, and Direct Bank Transfers. All transactions are processed securely.",
  },
];

function HelpSupportPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitIssue = () => {
    if (!email || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Issue submitted! We'll respond within 24 hours");
      setMessage("");
      setEmail("");
    }, 1200);
  };

  return (
    <>
      <TopBar title="HELP & SUPPORT" />
      
      <button 
        onClick={() => navigate({ to: "/profile" })} 
        className="tile-press mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-6">
        {/* Quick Contact */}
        <div className="grid grid-cols-2 gap-3">
          <a href="mailto:support@campusconnect.com" className="tile-press glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-muted/30">
            <Mail className="h-5 w-5 text-primary" />
            <p className="text-xs font-semibold text-center">Email Support</p>
            <p className="text-xs text-muted-foreground text-center truncate">support@campusconnect.com</p>
          </a>
          <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
            <Phone className="h-5 w-5 text-accent" />
            <p className="text-xs font-semibold text-center">Call Us</p>
            <p className="text-xs text-muted-foreground text-center">+234 800 123 4567</p>
          </div>
        </div>

        {/* Availability */}
        <div className="glass rounded-2xl p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-neon shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold">SUPPORT HOURS</p>
            <p className="text-xs text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM WAT</p>
            <p className="text-xs text-muted-foreground">Weekend: 10:00 AM - 4:00 PM WAT</p>
          </div>
        </div>

        {/* Report Issue Form */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">REPORT AN ISSUE</h2>
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={4}
              className="w-full resize-none rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSubmitIssue}
              disabled={!email || !message || loading}
              className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">FREQUENTLY ASKED QUESTIONS</h2>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full rounded-xl bg-muted/30 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="tile-press w-full text-left"
                >
                  <div className="glass rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{faq.question}</p>
                        {expandedFaq === faq.id && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{faq.answer}</p>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                          expandedFaq === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">No FAQs match your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="glass rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">OTHER RESOURCES</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p>📋 <a href="#" className="text-primary hover:underline">View Terms of Service</a></p>
            <p>🔒 <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
            <p>❓ <a href="#" className="text-primary hover:underline">Community Forum</a></p>
          </div>
        </div>
      </div>
    </>
  );
}
