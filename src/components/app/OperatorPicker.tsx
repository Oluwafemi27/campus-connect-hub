import { cn } from "@/lib/utils";

const operators = [
  { id: "airtel", label: "Airtel", color: "bg-gradient-to-br from-red-500 to-red-700", emoji: "📡" },
  { id: "mtn", label: "MTN", color: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black", emoji: "🟡" },
  { id: "glo", label: "Glo", color: "bg-gradient-to-br from-green-500 to-green-700", emoji: "🟢" },
  { id: "9mobile", label: "9mobile", color: "bg-gradient-to-br from-emerald-500 to-teal-700", emoji: "9️⃣" },
];

export function OperatorPicker({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {operators.map((op) => (
        <button
          key={op.id}
          onClick={() => onSelect(op.id)}
          className={cn(
            "tile-press flex flex-col items-center gap-1.5",
          )}
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white transition-all",
              op.color,
              selected === op.id ? "scale-110 ring-2 ring-primary glow-primary" : "opacity-80",
            )}
          >
            {op.emoji}
          </div>
          <span className="text-[10px] font-semibold">{op.label}</span>
        </button>
      ))}
    </div>
  );
}
