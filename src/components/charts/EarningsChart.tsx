"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type ProjectLike = {
  compensation?: number;
  signedDate?: string;
  status?: string;
};

export function EarningsChart() {
  const [projects, setProjects] = useState<ProjectLike[]>([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc_projects");
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
    
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem("cc_projects");
        if (raw) setProjects(JSON.parse(raw));
      } catch {}
    };
    
    const handleCurrencyUpdate = () => {
      forceUpdate((prev) => prev + 1);
    };
    
    window.addEventListener("projectsUpdated", handleUpdate);
    window.addEventListener("currencyUpdated", handleCurrencyUpdate);
    return () => {
      window.removeEventListener("projectsUpdated", handleUpdate);
      window.removeEventListener("currencyUpdated", handleCurrencyUpdate);
    };
  }, []);

  const now = new Date();
  const monthName = now.toLocaleDateString(undefined, { month: "long" });
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const data = useMemo(() => {
    const daily: number[] = Array.from({ length: daysInMonth }, () => 0);
    for (const p of projects) {
      if (!p || !p.signedDate) continue;
      const d = new Date(p.signedDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const dayIdx = d.getDate() - 1;
      const amount = typeof p.compensation === "number" ? p.compensation : 0;
      daily[dayIdx] += amount;
    }
    return daily.map((amount, i) => ({ day: i + 1, amount }));
  }, [projects, daysInMonth, year, month]);

  const total = useMemo(() => data.reduce((acc, d) => acc + d.amount, 0), [data]);

  const monthShort = now.toLocaleDateString(undefined, { month: "short" });

  function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const CustomTooltip = (props: { active?: boolean; payload?: Array<{ value?: number }>; label?: string | number }) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    const amount = props.payload[0]?.value || 0;
    const label = props.label;
    return (
      <div className="rounded-[10px] bg-white border border-[#efefef] px-3 py-2 text-[12px]">
        <div className="font-medium">{ordinal(Number(label))} {monthShort}</div>
        <div className="text-lime-700">{formatCurrency(Number(amount))}</div>
      </div>
    );
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{monthName} Earnings Overview</CardTitle>
          <div className="text-[12px] text-neutral-500 mt-1">Total: {formatCurrency(total)}</div>
        </div>
        <span className="text-xs text-neutral-400">Keep up the great work!</span>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b3f36b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#b3f36b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} scale="point" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={34} />
              <Tooltip cursor={{ stroke: "#d1f2a5" }} content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#b3f36b" fill="url(#earn)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
