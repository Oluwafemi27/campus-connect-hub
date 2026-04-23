import { cn } from "@/lib/utils";

const operators = [
  {
    id: "mtn",
    label: "MTN",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/MTN-Logo.png",
    bg: "bg-yellow-400",
  },
  {
    id: "airtel",
    label: "Airtel",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Airtel-Logo.png",
    bg: "bg-white",
  },
  {
    id: "glo",
    label: "Glo",
    logo: "https://seeklogo.com/images/G/globacom-glo-logo-9C8E1A2D7B-seeklogo.com.png",
    bg: "bg-white",
  },
  {
    id: "9mobile",
    label: "9mobile",
    logo: "https://seeklogo.com/images/1/9mobile-logo-7E0F1B7B3E-seeklogo.com.png",
    bg: "bg-white",
  },
];

export function OperatorPicker({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {operators.map((op) => (
        <button
          key={op.id}
          onClick={() => onSelect(op.id)}
          className="tile-press flex flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl p-2 transition-all",
              op.bg,
              selected === op.id ? "scale-110 ring-2 ring-primary glow-primary" : "opacity-90",
            )}
          >
            <img src={op.logo} alt={`${op.label} logo`} className="h-full w-full object-contain" loading="lazy" />
          </div>
          <span className="text-[10px] font-semibold">{op.label}</span>
        </button>
      ))}
    </div>
  );
}
