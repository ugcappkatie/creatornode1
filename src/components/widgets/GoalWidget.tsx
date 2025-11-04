"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { formatCurrency } from "@/lib/utils";

export function GoalWidget() {
  type ProjectLike = { compensation?: number; signedDate?: string; status?: string };
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthName = now.toLocaleDateString(undefined, { month: "long" });

  const [projects, setProjects] = useState<ProjectLike[]>([]);
  const [editing, setEditing] = useState(false);
  const [targetInput, setTargetInput] = useState<string>("");

  const goalKey = `cc_goal_${year}_${String(month + 1).padStart(2, "0")}`;
  const [target, setTarget] = useState<number>(() => {
    try { const raw = localStorage.getItem(goalKey); if (raw) return Number(raw) || 1500; } catch {}
    return 1500;
  });

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
    
    window.addEventListener("projectsUpdated", handleUpdate);
    return () => window.removeEventListener("projectsUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(goalKey, String(target)); } catch {}
  }, [target, goalKey]);

  const completed = useMemo(() => {
    let sum = 0;
    for (const p of projects) {
      if (!p || !p.signedDate) continue;
      const d = new Date(p.signedDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      sum += typeof p.compensation === "number" ? p.compensation : 0;
    }
    return sum;
  }, [projects, month, year]);

  const percent = Math.max(0, Math.min(100, Math.round((completed / Math.max(1, target)) * 100)));

  const radius = 42;
  const cx = 50, cy = 50;
  const startX = cx - radius, startY = cy;
  const endX = cx + radius, endY = cy;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  const circumference = Math.PI * radius;
  const progressLength = (circumference * percent) / 100;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{monthName} Goal</CardTitle>
        <button
          onClick={() => { setTargetInput(String(target)); setEditing(true); }}
          className="h-9 w-9 rounded-full border border-[#e5e5e5] text-neutral-600 hover:bg-neutral-50 inline-flex items-center justify-center"
          aria-label="Edit goal"
          title="Edit goal"
        >
          <Pencil2Icon className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[420px]">
            <svg viewBox="0 0 100 60" className="w-full h-auto">
              <path d={arcPath} stroke="#eee" strokeWidth="10" fill="none" strokeLinecap="round" />
              <path d={arcPath} stroke="#dcf9b4" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${progressLength} ${circumference}`} />
            </svg>
          </div>
          <div className="-mt-10 text-center">
            <div className="text-[36px] font-bold">{formatCurrency(completed)}</div>
            <div className="text-[18px] text-neutral-500">of {formatCurrency(target)}</div>
          </div>
          <div className="mt-4 flex items-center gap-6 text-[14px]">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#dcf9b4]"></span>Completed</span>
            <span className="inline-flex items-center gap-2 text-neutral-500"><span className="h-3 w-3 rounded-full bg-neutral-200"></span>Remaining</span>
          </div>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={() => setEditing(false)} />
            <div className="relative bg-white rounded-[12px] border border-[#efefef] p-4 w-[360px]">
              <div className="text-[15px] font-semibold mb-2">Edit {monthName} Goal</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] text-neutral-600 mb-1">Target</label>
                  <input type="number" min={0} className="w-full rounded-[10px] border border-[#e5e5e5] px-3 py-2 text-[14px]" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditing(false)} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">Cancel</button>
                  <button onClick={() => { const v = Number(targetInput); if (!isNaN(v) && v >= 0) setTarget(v); setEditing(false); }} className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
