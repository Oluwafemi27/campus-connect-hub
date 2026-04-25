import { cn } from "@/lib/utils";

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
    bg: "bg-white",
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

export function OperatorPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
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
            <img
              src={op.logo}
              alt={`${op.label} logo`}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
          <span className="text-[10px] font-semibold">{op.label}</span>
        </button>
      ))}
    </div>
  );
}
