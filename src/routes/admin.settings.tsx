import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Globe, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [twofa, setTwofa] = useState(true);
  const [signup, setSignup] = useState(true);

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <div className="glass space-y-3 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">PLATFORM</p>
        <Row icon={Globe} label="Maintenance mode" hint="Block customer access">
          <Toggle on={maintenance} onChange={setMaintenance} />
        </Row>
        <Row icon={KeyRound} label="Allow new sign-ups" hint="Public registration">
          <Toggle on={signup} onChange={setSignup} />
        </Row>
      </div>

      <div className="glass space-y-3 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">SECURITY</p>
        <Row icon={Lock} label="Require admin 2FA" hint="Mandatory for all admins">
          <Toggle on={twofa} onChange={setTwofa} />
        </Row>
        <button onClick={() => toast.success("Audit log opened")} className="tile-press flex w-full items-center gap-3 rounded-xl bg-muted/20 px-3 py-3 text-left">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold">View audit log</p>
            <p className="text-[10px] text-muted-foreground">Privileged actions history</p>
          </div>
        </button>
      </div>

      <button onClick={() => toast.success("Settings saved")} className="tile-press w-full rounded-xl bg-gradient-to-r from-gold to-amber-700 py-3 text-sm font-bold text-gold-foreground">
        Save Changes
      </button>
    </div>
  );
}

function Row({ icon: Icon, label, hint, children }: { icon: React.ComponentType<{ className?: string }>; label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  );
}
