"use client";

import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

export function NcDonutChart({ dados, total }: { dados: { nome: string; valor: number; cor: string }[]; total: number }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <defs>
            <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#14283A" floodOpacity="0.12" />
            </filter>
          </defs>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={3}
            cornerRadius={4}
            filter="url(#donutShadow)"
          >
            {dados.map((entry, i) => (
              <Cell key={i} fill={entry.cor} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[24px] font-semibold text-[#14283A] tracking-tight">{total}</p>
        <p className="text-[10px] text-[#8A8578] tracking-wide uppercase">Total</p>
      </div>
    </div>
  );
}
