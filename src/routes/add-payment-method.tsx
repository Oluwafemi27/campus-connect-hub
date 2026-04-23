import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { ArrowLeft, CreditCard, Building2, Smartphone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/add-payment-method")({ component: AddPaymentMethodPage });

type PaymentMethodType = "card" | "bank" | "ussd";

interface PaymentMethod {
  type: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const paymentMethods: PaymentMethod[] = [
  {
    type: "card",
    label: "Debit/Credit Card",
    description: "Visa, Mastercard, or Verve",
    icon: CreditCard,
  },
  {
    type: "bank",
    label: "Bank Account",
    description: "Direct bank transfer",
    icon: Building2,
  },
  {
    type: "ussd",
    label: "USSD (Bank Transfer)",
    description: "Via USSD code",
    icon: Smartphone,
  },
];

function AddPaymentMethodPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [step, setStep] = useState<"select" | "form" | "verify">("select");
  const [loading, setLoading] = useState(false);

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setStep("form");
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("select");
      setSelectedMethod(null);
    } else {
      navigate({ to: "/payments" });
    }
  };

  const handleAddCard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("verify");
      toast.success("Card added successfully!");
      setTimeout(() => navigate({ to: "/payments" }), 2000);
    }, 1500);
  };

  return (
    <>
      <TopBar title="PAYMENT METHOD" />

      <button
        onClick={handleBack}
        className="tile-press mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {step === "select" && (
        <div className="space-y-4 animate-fade-up">
          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">SELECT PAYMENT METHOD</p>
            <p className="text-sm">Choose how you'd like to add funds to your Campus Connect Wallet</p>
          </div>

          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.type}
                  onClick={() => handleMethodSelect(method.type)}
                  className="tile-press w-full rounded-xl bg-muted/20 p-4 text-left transition-all hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">WHY LINK A PAYMENT METHOD?</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span>✓</span> <span>Easy wallet top-ups anytime</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span> <span>Multiple payment options</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span> <span>Secure and encrypted</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span> <span>No hidden charges</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {step === "form" && selectedMethod === "card" && (
        <div className="space-y-4 animate-fade-up">
          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">CARD INFORMATION</p>
            <p className="text-sm">Enter your card details securely</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold block mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold block mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <input type="checkbox" id="save" className="w-4 h-4 rounded" defaultChecked />
              <label htmlFor="save" className="text-muted-foreground cursor-pointer">
                Save this card for faster payments
              </label>
            </div>
          </div>

          <button
            onClick={handleAddCard}
            disabled={loading}
            className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            {loading ? "Adding Card..." : "Add Card"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Your card details are encrypted and stored securely
          </p>
        </div>
      )}

      {step === "form" && selectedMethod === "bank" && (
        <div className="space-y-4 animate-fade-up">
          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">BANK TRANSFER DETAILS</p>
            <p className="text-sm">Transfer funds using the details below</p>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3 bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Account Name</p>
              <p className="font-semibold text-sm">Campus Connect Hub</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Account Number</p>
              <p className="font-mono font-bold text-sm">1234567890</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
              <p className="font-semibold text-sm">First Bank Nigeria</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bank Code</p>
              <p className="font-mono font-bold text-sm">011</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Your Reference/Name</label>
            <input
              type="text"
              placeholder="Enter your name or ID (for confirmation)"
              className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleAddCard}
            disabled={loading}
            className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            {loading ? "Confirming..." : "Confirm Bank Transfer"}
          </button>

          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">PROCESSING TIME</p>
            <p className="text-xs">Most transfers are confirmed within 5-10 minutes. You'll receive a notification once your transfer is confirmed.</p>
          </div>
        </div>
      )}

      {step === "form" && selectedMethod === "ussd" && (
        <div className="space-y-4 animate-fade-up">
          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">USSD TRANSFER</p>
            <p className="text-sm">Use USSD code to transfer funds</p>
          </div>

          <div className="glass rounded-2xl p-6 text-center space-y-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">Dial this code from your phone:</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold font-mono tracking-widest">*326#</p>
              <p className="text-xs text-muted-foreground">Then select "Campus Connect Hub"</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Amount (Optional)</label>
            <input
              type="number"
              placeholder="₦5,000"
              className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty to set amount during USSD prompt</p>
          </div>

          <button
            onClick={handleAddCard}
            disabled={loading}
            className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            {loading ? "Confirming..." : "Confirm USSD Transfer"}
          </button>

          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">HOW IT WORKS</p>
            <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
              <li>Dial *326# from your phone</li>
              <li>Select "Campus Connect Hub" or "CTH"</li>
              <li>Enter your amount</li>
              <li>Confirm the transaction</li>
              <li>Your wallet will be credited instantly</li>
            </ol>
          </div>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-4 animate-fade-up text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Payment Method Added</h2>
          <p className="text-sm text-muted-foreground">Your payment method has been successfully linked to your account.</p>
          <p className="text-xs text-muted-foreground">Redirecting to payments...</p>
        </div>
      )}
    </>
  );
}
