import type { LucideIcon } from "lucide-react";

type Tone = "neutral" | "warn" | "ok";

const TONES: Record<Tone, { text: string; bg: string; fg: string; bar: string }> = {
  neutral: { text: "text-[#14283A]", bg: "#EAF0F5", fg: "#14283A", bar: "#14283A" },
  warn: { text: "text-[#C4791E]", bg: "#FBEAD9", fg: "#C4791E", bar: "#C9A050" },
  ok: { text: "text-[#2C6B45]", bg: "#E3EEE6", fg: "#2C6B45", bar: "#2C6B45" },
};

export function StatCard({
  label,
  value,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  const t = TONES[tone];
  return (
    <div className="relative bg-white border border-[#E4E1D6] rounded-xl px-5 py-4 flex-1 min-w-[150px] overflow-hidden shadow-[0_1px_2px_rgba(20,40,58,0.04)] hover:shadow-[0_4px_14px_rgba(20,40,58,0.08)] transition-shadow">
      <span className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: t.bar }} />
      <div className="flex items-start justify-between">
        <p className="text-[12px] text-[#8A8578]">{label}</p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: t.bg, color: t.fg }}
          >
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className={`text-[28px] font-semibold mt-1 tracking-tight ${t.text}`}>{value}</p>
    </div>
  );
}
