import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";

export const Route = createFileRoute("/change-password")({ component: ChangePasswordPage });

function ChangePasswordPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    return requirements;
  };

  const requirements = validatePassword(newPassword);
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!allRequirementsMet) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password changed successfully");
      navigate({ to: "/profile" });
    }, 1200);
  };

  const Requirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${met ? "bg-primary/30" : "bg-muted/30"}`}
      >
        {met && <CheckCircle2 className="h-3 w-3 text-primary" />}
      </div>
      <span className={met ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggleShow,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggleShow: () => void;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl bg-muted/30 px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <TopBar title="CHANGE PASSWORD" />

      <button
        onClick={() => navigate({ to: "/profile" })}
        className="tile-press mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground">SECURITY TIP</p>
          <p className="text-sm">
            Use a unique password you don't use on other websites. Include uppercase, lowercase,
            numbers, and symbols.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
          />

          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew(!showNew)}
          />

          {newPassword && (
            <div className="glass rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">PASSWORD REQUIREMENTS</p>
              <div className="space-y-1.5">
                <Requirement met={requirements.length} label="At least 8 characters" />
                <Requirement met={requirements.uppercase} label="One uppercase letter" />
                <Requirement met={requirements.lowercase} label="One lowercase letter" />
                <Requirement met={requirements.number} label="One number" />
              </div>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
          />

          {confirmPassword && newPassword !== confirmPassword && (
            <div className="text-xs text-destructive flex items-center gap-2">
              <span>✗</span>
              <span>Passwords do not match</span>
            </div>
          )}

          {confirmPassword && newPassword === confirmPassword && (
            <div className="text-xs text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Passwords match</span>
            </div>
          )}

          <button
            type="submit"
            disabled={
              !currentPassword || !allRequirementsMet || newPassword !== confirmPassword || loading
            }
            className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </>
  );
}
