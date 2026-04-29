import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Globe, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const operators = [
  {
    id: "mtn",
    label: "MTN",
    logo: "https://cdn.brandfetch.io/mtn.com/w/512",
    bg: "bg-yellow-400",
  },
  {
    id: "airtel",
    label: "Airtel",
    logo: "https://cdn.brandfetch.io/africa.airtel.com/w/512/h/512",
    bg: "bg-red-500",
  },
  {
    id: "glo",
    label: "Glo",
    logo: "https://cdn.builder.io/api/v1/image/assets%2Ffb3867edf290471c88a21d0137a8b8ca%2F813c182419e14b34bcc4b6ec8fe7f5a8?format=webp&width=800&height=1200",
    bg: "bg-white",
  },
  {
    id: "9mobile",
    label: "9mobile",
    logo: "https://cdn.builder.io/api/v1/image/assets%2Ffb3867edf290471c88a21d0137a8b8ca%2F2d7158d1ac304d2891ea5005414f965a?format=webp&width=800&height=1200",
    bg: "bg-white",
  },
];

function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [twofa, setTwofa] = useState(true);
  const [signup, setSignup] = useState(true);
  const [operatorStatus, setOperatorStatus] = useState({
    mtn: true,
    airtel: true,
    glo: true,
    "9mobile": true,
  });

  const toggleOperator = (id: string) => {
    setOperatorStatus((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <div className="glass space-y-4 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">PLATFORM</p>
        <SettingRow icon={Globe} label="Maintenance mode" hint="Block customer access">
          <Switch checked={maintenance} onCheckedChange={setMaintenance} />
        </SettingRow>
        <SettingRow icon={KeyRound} label="Allow new sign-ups" hint="Public registration">
          <Switch checked={signup} onCheckedChange={setSignup} />
        </SettingRow>
      </div>

      <div className="glass space-y-4 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">SECURITY</p>
        <SettingRow icon={Lock} label="Require admin 2FA" hint="Mandatory for all admins">
          <Switch checked={twofa} onCheckedChange={setTwofa} />
        </SettingRow>
        <button
          onClick={() => toast.success("Audit log opened")}
          className="tile-press flex w-full items-center gap-3 rounded-xl bg-muted/20 px-3 py-3 text-left transition-colors hover:bg-muted/30"
        >
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold">View audit log</p>
            <p className="text-[10px] text-muted-foreground">Privileged actions history</p>
          </div>
        </button>
      </div>

      <div className="glass space-y-4 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">
          MOBILE OPERATORS
        </p>
        <div className="space-y-3">
          {operators.map((op) => (
            <div
              key={op.id}
              className="flex items-center gap-3 rounded-lg bg-muted/10 p-3 transition-colors hover:bg-muted/20"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg p-2 ${op.bg}`}
              >
                <img
                  src={op.logo}
                  alt={`${op.label} logo`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                  width={48}
                  height={48}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{op.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {operatorStatus[op.id as keyof typeof operatorStatus] ? "Active" : "Disabled"}
                </p>
              </div>
              <Switch
                checked={operatorStatus[op.id as keyof typeof operatorStatus]}
                onCheckedChange={() => toggleOperator(op.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => toast.success("Settings saved")}
        className="tile-press w-full rounded-xl bg-gradient-to-r from-gold to-amber-700 py-3 text-sm font-bold text-gold-foreground transition-all hover:shadow-lg"
      >
        Save Changes
      </button>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
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
