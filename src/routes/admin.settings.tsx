import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Globe, KeyRound, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Switch } from "@/components/ui/switch";
import {
  getOperatorSettings,
  updateOperatorSettings,
  getAdminSetting,
  updateAdminSetting,
  type OperatorSettings,
} from "@/lib/admin-service";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const operators = [
  {
    id: "mtn" as const,
    label: "MTN",
    logo: "https://cdn.brandfetch.io/mtn.com/w/512",
    bg: "bg-yellow-400",
  },
  {
    id: "airtel" as const,
    label: "Airtel",
    logo: "https://cdn.brandfetch.io/africa.airtel.com/w/512/h/512",
    bg: "bg-red-500",
  },
  {
    id: "glo" as const,
    label: "Glo",
    logo: "https://cdn.builder.io/api/v1/image/assets%2Ffb3867edf290471c88a21d0137a8b8ca%2F813c182419e14b34bcc4b6ec8fe7f5a8?format=webp&width=800&height=1200",
    bg: "bg-white",
  },
  {
    id: "9mobile" as const,
    label: "9mobile",
    logo: "https://cdn.builder.io/api/v1/image/assets%2Ffb3867edf290471c88a21d0137a8b8ca%2F2d7158d1ac304d2891ea5005414f965a?format=webp&width=800&height=800",
    bg: "bg-white",
  },
];

function AdminSettings() {
  useAdminGuard();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Platform settings
  const [maintenance, setMaintenance] = useState(false);
  const [twofa, setTwofa] = useState(true);
  const [signup, setSignup] = useState(true);

  // Operator settings
  const [operatorStatus, setOperatorStatus] = useState<OperatorSettings>({
    mtn: true,
    airtel: true,
    glo: true,
    "9mobile": true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load operator settings
        const operators = await getOperatorSettings();
        setOperatorStatus(operators);

        // Load platform settings
        const maintenanceVal = await getAdminSetting("maintenance_mode");
        setMaintenance(maintenanceVal === "true");

        const twofaVal = await getAdminSetting("require_admin_2fa");
        setTwofa(twofaVal !== "false"); // Default to true

        const signupVal = await getAdminSetting("allow_signups");
        setSignup(signupVal !== "false"); // Default to true
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleOperator = async (id: keyof OperatorSettings) => {
    const newStatus = {
      ...operatorStatus,
      [id]: !operatorStatus[id],
    };
    setOperatorStatus(newStatus);

    const success = await updateOperatorSettings(newStatus);
    if (success) {
      toast.success(`${id.toUpperCase()} ${newStatus[id] ? "enabled" : "disabled"}`);
    } else {
      // Revert on failure
      setOperatorStatus(operatorStatus);
      toast.error("Failed to update setting");
    }
  };

  const toggleMaintenance = async () => {
    const newValue = !maintenance;
    setMaintenance(newValue);

    const success = await updateAdminSetting("maintenance_mode", String(newValue));
    if (success) {
      toast.success(newValue ? "Maintenance mode enabled" : "Maintenance mode disabled");
    } else {
      setMaintenance(!newValue);
      toast.error("Failed to update setting");
    }
  };

  const toggleTwofa = async () => {
    const newValue = !twofa;
    setTwofa(newValue);

    const success = await updateAdminSetting("require_admin_2fa", String(newValue));
    if (success) {
      toast.success(newValue ? "Admin 2FA required" : "Admin 2FA optional");
    } else {
      setTwofa(!newValue);
      toast.error("Failed to update setting");
    }
  };

  const toggleSignup = async () => {
    const newValue = !signup;
    setSignup(newValue);

    const success = await updateAdminSetting("allow_signups", String(newValue));
    if (success) {
      toast.success(newValue ? "Sign-ups enabled" : "Sign-ups disabled");
    } else {
      setSignup(!newValue);
      toast.error("Failed to update setting");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <div className="glass rounded-2xl p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <div className="glass space-y-4 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">PLATFORM</p>
        <SettingRow
          icon={Globe}
          label="Maintenance mode"
          hint="Block customer access"
          onToggle={toggleMaintenance}
          checked={maintenance}
        />
        <SettingRow
          icon={KeyRound}
          label="Allow new sign-ups"
          hint="Public registration"
          onToggle={toggleSignup}
          checked={signup}
        />
      </div>

      <div className="glass space-y-4 rounded-2xl p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">SECURITY</p>
        <SettingRow
          icon={Lock}
          label="Require admin 2FA"
          hint="Mandatory for all admins"
          onToggle={toggleTwofa}
          checked={twofa}
        />
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
                  {operatorStatus[op.id] ? "Active" : "Disabled"}
                </p>
              </div>
              <Switch
                checked={operatorStatus[op.id]}
                onCheckedChange={() => toggleOperator(op.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-2">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">
          ⚙️ SETTINGS INFO
        </p>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span>•</span>
            <span>Platform settings are saved to Supabase in real-time</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Operator settings control which networks appear in the app</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Maintenance mode blocks all non-admin access</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Changes take effect immediately</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  checked,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
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
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
