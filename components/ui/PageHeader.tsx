import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-start gap-2.5">
        <span className="w-[3px] h-8 bg-gradient-to-b from-[#C9A050] to-[#E4D6B0] rounded-full mt-0.5 shrink-0" />
        <div>
          <h1 className="text-[19px] font-semibold text-[#14283A] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#8A8578]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
