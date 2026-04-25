import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { ChevronRight, Edit2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <>
      <TopBar title="PROFILE" />
      <div className="glass-strong relative mb-5 overflow-hidden rounded-2xl p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/15" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">Welcome,</p>
            <p className="text-2xl font-bold gradient-text-gold">Student!</p>
          </div>
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground glow-primary">
              👤
            </div>
            <button className="tile-press absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-gold-foreground">
              <Edit2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <Section title="PERSONAL INFORMATION">
        {[
          ["Name", "—"],
          ["Email", "—"],
          ["Phone Number", "—"],
        ].map(([k, v]) => (
          <Row key={k} label={k} value={v} />
        ))}
      </Section>

      <Section title="ACCOUNT & SECURITY">
        <Link to="/change-password" className="tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm">
          <span>Change Password</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/security-questions" className="tile-press glass mt-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm">
          <span>Security Questions</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </Section>

      <Section title="PAYMENT METHODS">
        <Link to="/add-payment-method" className="tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm hover:bg-muted/30 transition-colors">
          <span>Link New Card / Account</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="glass-strong mt-2 rounded-xl bg-gradient-to-br from-gold/30 to-amber-700/20 p-4">
          <p className="text-xs text-muted-foreground">Campus Connect Wallet</p>
          <p className="text-2xl font-bold gradient-text-gold">₦0.00</p>
        </div>
      </Section>

      <Section title="HELP & SUPPORT">
        <Link to="/help-support" className="tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm">
          <span>Help & Support</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs tracking-widest text-muted-foreground">{title}</p>
      <div>{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass mb-2 flex items-center justify-between rounded-xl px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
