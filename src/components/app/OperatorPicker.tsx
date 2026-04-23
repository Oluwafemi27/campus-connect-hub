import { cn } from "@/lib/utils";

const operators = [
  {
    id: "mtn",
    label: "MTN",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/New-mtn-logo.png/320px-New-mtn-logo.png",
    bg: "bg-yellow-400",
  },
  {
    id: "airtel",
    label: "Airtel",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Bharti_Airtel_Limited_logo.svg/320px-Bharti_Airtel_Limited_logo.svg.png",
    bg: "bg-white",
  },
  {
    id: "glo",
    label: "Glo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Globacom_logo.png/320px-Globacom_logo.png",
    bg: "bg-white",
  },
  {
    id: "9mobile",
    label: "9mobile",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/9mobile_logo.png/320px-9mobile_logo.png",
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
