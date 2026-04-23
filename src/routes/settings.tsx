import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ChevronRight, Moon, Globe, Shield, HelpCircle, Trash2, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  useAuthGuard();
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="SETTINGS" showBack />
      <div className="mb-5">
        <h1 className="text-2xl font-bold"><span className="gradient-text">Settings</span></h1>
        <p className="text-xs text-muted-foreground">Customize your experience</p>
      </div>

      <Section title="APPEARANCE">
        <Item icon={Moon} label="Dark mode" trailing={<span className="text-[10px] tracking-widest text-neon">ON</span>} />
        <Item icon={Globe} label="Language" trailing={<span className="text-xs text-muted-foreground">English</span>} />
      </Section>

      <Section title="PRIVACY">
        <Item icon={Shield} label="Privacy & data" />
        <Item icon={Info} label="Permissions" />
      </Section>

      <Section title="ABOUT">
        <Item icon={HelpCircle} label="Help center" onClick={() => navigate({ to: "/messages" })} />
        <Item icon={Info} label="App version" trailing={<span className="text-xs text-muted-foreground">1.0.0</span>} />
      </Section>

      <button
        onClick={() => toast.error("This will permanently delete your account")}
        className="tile-press glass mt-4 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-destructive"
      >
        <div className="flex items-center gap-3"><Trash2 className="h-4 w-4" /> Delete account</div>
        <ChevronRight className="h-4 w-4" />
      </button>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs tracking-widest text-muted-foreground">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ icon: Icon, label, trailing, onClick }: { icon: typeof Moon; label: string; trailing?: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="tile-press glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-primary" /><span>{label}</span></div>
      {trailing ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}
