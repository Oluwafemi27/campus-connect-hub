import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { CreditCard, Smartphone, Zap, DollarSign, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/topup")({ component: TopUpPage });

const topupMethods = [
  { id: "card", label: "Debit/Credit Card", icon: CreditCard, desc: "Instant funding" },
  { id: "ussd", label: "Bank Transfer (USSD)", icon: Smartphone, desc: "Via your bank" },
  { id: "bank", label: "Direct Bank Transfer", icon: Zap, desc: "Manual transfer" },
];

const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

function TopUpPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleProceed = () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!selectedAmount && !customAmount) {
      toast.error("Please select or enter an amount");
      return;
    }

    const amount = selectedAmount || parseInt(customAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error("Minimum amount is ₦100");
      return;
    }

    toast.success(`Processing ₦${amount.toLocaleString()} via ${topupMethods.find(m => m.id === selectedMethod)?.label}`);
    setTimeout(() => {
      navigate({ to: "/payments" });
    }, 1500);
  };

  return (
    <>
      <TopBar title="TOP UP WALLET" />
      
      <button 
        onClick={() => navigate({ to: "/payments" })} 
        className="tile-press mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">SELECT PAYMENT METHOD</h2>
          <div className="space-y-2">
            {topupMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`tile-press w-full rounded-xl p-4 text-left transition-all ${
                    selectedMethod === method.id
                      ? "glass bg-primary/20 ring-2 ring-primary glow-primary"
                      : "glass hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedMethod === method.id ? "bg-primary/30" : "bg-muted/30"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground">SELECT AMOUNT</h2>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={`tile-press rounded-xl py-3 text-xs font-bold transition-all ${
                  selectedAmount === amount
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "glass hover:bg-muted/30"
                }`}
              >
                ₦{(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <label className="text-sm font-bold tracking-widest text-muted-foreground">OR ENTER CUSTOM AMOUNT</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold">₦</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="Enter amount"
              className="w-full rounded-xl bg-muted/30 py-3 pl-8 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              min="100"
            />
          </div>
          <p className="text-xs text-muted-foreground">Minimum: ₦100 | No maximum limit</p>
        </div>

        {/* Summary */}
        {(selectedAmount || customAmount) && (
          <div className="glass-strong rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold">₦{(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-muted/20 pt-2">
              <span className="text-muted-foreground">Processing Fee:</span>
              <span className="font-bold">₦0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-muted/20 pt-2">
              <span>Total:</span>
              <span className="text-primary">₦{(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary transition-all hover:shadow-lg disabled:opacity-50"
          disabled={!selectedMethod || (!selectedAmount && !customAmount)}
        >
          Proceed to Payment
        </button>

        {/* Info Box */}
        <div className="rounded-xl bg-muted/20 p-3 space-y-1.5 text-xs">
          <p className="font-semibold text-muted-foreground">⚡ Top-Up Information</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Instant processing for card payments</li>
            <li>Bank transfers processed within 5-10 minutes</li>
            <li>Funds go directly to your Campus Connect Wallet</li>
            <li>All transactions are secure and encrypted</li>
          </ul>
        </div>
      </div>
    </>
  );
}
