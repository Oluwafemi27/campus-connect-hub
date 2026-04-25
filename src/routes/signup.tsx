import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill required fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(form.email, form.password);
      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }
      toast.success("Account created!");
      navigate({ to: "/" });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { k: "name" as const, icon: User, label: "FULL NAME", type: "text", ph: "Alex Johnson" },
    { k: "email" as const, icon: Mail, label: "EMAIL", type: "email", ph: "alex@campus.edu" },
    { k: "phone" as const, icon: Phone, label: "PHONE", type: "tel", ph: "080..." },
    { k: "password" as const, icon: Lock, label: "PASSWORD", type: "password", ph: "••••••••" },
  ];

  return (
    <div className="signup-container mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
      </div>

      <div className="signup-header mb-6 flex flex-col items-center text-center animate-fade-up">
        <img src={logoImg} alt="Campus Connect" className="mb-4 h-16 w-16 object-contain sm:h-20 sm:w-20" />
        <h1 className="text-2xl font-bold gradient-text sm:text-3xl">Join Campus Connect</h1>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Create your student account in seconds</p>
      </div>

      <form onSubmit={onSubmit} className="signup-form glass-strong space-y-2 rounded-3xl p-4 animate-fade-up sm:space-y-3 sm:p-6" style={{ animationDelay: "0.1s" }}>
        {fields.map(({ k, icon: Icon, label, type, ph }) => (
          <div key={k} className="form-field space-y-1">
            <label className="text-[10px] font-medium tracking-widest text-muted-foreground">{label}</label>
            <div className="form-input-wrapper glass flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
              <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
              <input
                type={type}
                value={form[k]}
                onChange={set(k)}
                placeholder={ph}
                className="form-input flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={loading}
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="submit-btn tile-press group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent to-primary px-6 py-3 font-semibold text-primary-foreground glow-accent disabled:opacity-60 sm:py-3.5"
        >
          <span className="absolute inset-0 animate-shimmer" />
          {loading ? "Creating..." : "Create Account"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="signup-link mt-6 text-center text-xs text-muted-foreground sm:text-sm">
        Already a member?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
