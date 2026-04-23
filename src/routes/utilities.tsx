import { createFileRoute } from "@tanstack/react-router";
import { TopBar, WalletCard } from "@/components/app/TopBar";
import { Droplet, Zap, Flame, Wifi } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/utilities")({ component: UtilitiesPage });

const services = [
  { icon: Zap, label: "Electricity", grad: "from-yellow-400 to-orange-600" },
  { icon: Droplet, label: "Water", grad: "from-blue-400 to-cyan-600" },
  { icon: Flame, label: "Gas", grad: "from-red-400 to-pink-600" },
  { icon: Wifi, label: "Internet", grad: "from-primary to-accent" },
];

function UtilitiesPage() {
  return (
    <>
      <TopBar title="UTILITIES" />
      <WalletCard />
      <h1 className="mb-4 text-xl font-bold">Pay <span className="gradient-text">Utility Bills</span></h1>
      <div className="grid grid-cols-2 gap-3">
        {services.map((s, i) => (
          <button key={i} onClick={() => toast.success(`${s.label} payment ready`)} className="tile-press glass flex flex-col items-center gap-2 rounded-2xl p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad}`}>
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold">{s.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
