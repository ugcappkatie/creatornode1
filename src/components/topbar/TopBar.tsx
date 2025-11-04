"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BellIcon } from "@radix-ui/react-icons";

type TimePeriod = "This Month" | "Last Month" | "This Year";

export function TopBar({ timePeriod, onTimePeriodChange }: { timePeriod: TimePeriod; onTimePeriodChange: (p: TimePeriod) => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-[36px] font-semibold leading-tight">Dashboard</h1>
        <p className="text-neutral-500">Plan, prioritise and create content with ease.</p>
      </div>
      <div className="flex items-center gap-3">
        <BellIcon className="h-5 w-5 text-neutral-600" />
        <select
          value={timePeriod}
          onChange={(e) => onTimePeriodChange(e.target.value as TimePeriod)}
          className="rounded-full border border-[#e5e5e5] bg-white text-sm px-4 py-2 text-neutral-700 hover:bg-neutral-50"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
        <Link href="/projects" className="rounded-full bg-black text-white text-sm px-4 py-2 shadow-sm hover:bg-neutral-800 transition-colors">
          Project Board
        </Link>
      </div>
    </div>
  );
}
