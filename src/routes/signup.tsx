import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
    const { error } = await signUp(form.email, form.password);
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to create account");
      return;
    }
    toast.success("Account created!");
    navigate({ to: "/" });
  };

  const fields = [
    { k: "name" as const, icon: User, label: "FULL NAME", type: "text", ph: "Alex Johnson" },
    { k: "email" as const, icon: Mail, label: "EMAIL", type: "email", ph: "alex@campus.edu" },
    { k: "phone" as const, icon: Phone, label: "PHONE", type: "tel", ph: "080..." },
    { k: "password" as const, icon: Lock, label: "PASSWORD", type: "password", ph: "••••••••" },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
      </div>

      <div className="mb-6 flex flex-col items-center text-center animate-fade-up">
        <img src="/src/assets/logo.png" alt="Campus Connect" className="mb-4 h-20 w-20 object-contain" />
        <h1 className="text-3xl font-bold gradient-text">Join Campus Connect</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create your student account in seconds</p>
      </div>

      <form onSubmit={onSubmit} className="glass-strong space-y-3 rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {fields.map(({ k, icon: Icon, label, type, ph }) => (
          <div key={k} className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-widest text-muted-foreground">{label}</label>
            <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
              <Icon className="h-4 w-4 text-primary" />
              <input
                type={type}
                value={form[k]}
                onChange={set(k)}
                placeholder={ph}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="tile-press group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent to-primary px-6 py-3.5 font-semibold text-primary-foreground glow-accent disabled:opacity-60"
        >
          <span className="absolute inset-0 animate-shimmer" />
          {loading ? "Creating..." : "Create Account"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
