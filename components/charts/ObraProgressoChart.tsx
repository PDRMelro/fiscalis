"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

export function ObraProgressoChart({ dados }: { dados: { nome: string; progresso: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados} margin={{ left: -20 }}>
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C3A54" />
            <stop offset="100%" stopColor="#0E1D2B" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EDEBE2" />
        <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "#8A8578" }} axisLine={{ stroke: "#E4E1D6" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8A8578" }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Bar dataKey="progresso" fill="url(#barFill)" radius={[6, 6, 0, 0]} barSize={44}>
          {dados.map((_, i) => (
            <Cell key={i} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
