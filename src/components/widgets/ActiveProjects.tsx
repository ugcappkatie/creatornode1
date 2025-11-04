"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type ProjectStatus = "Plan & Film" | "To Edit" | "In Approval" | "Completed";
type Project = {
  id: string;
  name: string;
  compensation: number;
  dueDate: string;
  leadSource: string;
  status: ProjectStatus;
};

function daysUntil(dueDateIso: string) {
  const due = new Date(dueDateIso);
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = startOfDue.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function dueLabel(dueDateIso: string) {
  const d = daysUntil(dueDateIso);
  if (d < 0) return `${Math.abs(d)} days overdue`;
  if (d === 0) return "due today";
  return `in ${d} days`;
}

function dueBadge(dueDateIso: string) {
  const text = dueLabel(dueDateIso);
  const d = daysUntil(dueDateIso);
  const className = d < 0
    ? "bg-rose-50 text-rose-700"
    : d === 0
    ? "bg-amber-50 text-amber-700"
    : "bg-lime-50 text-lime-700";
  return { text, className };
}

export function ActiveProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

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

  const activeSorted = useMemo(() => {
    const active = projects.filter((p) => p.status !== "Completed");
    return active.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [projects]);
  
  const activeSum = useMemo(() => activeSorted.reduce((acc, p) => acc + (p.compensation || 0), 0), [activeSorted]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Active Projects</CardTitle>
          <div className="text-xs text-neutral-500">{activeSorted.length} active projects ({formatCurrency(activeSum)})</div>
        </div>
        <Link href="/projects" className="text-xs rounded-full bg-black text-white px-3 py-1">View all</Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-neutral-100">
          {activeSorted.slice(0, 4).map((p) => {
            const d = dueBadge(p.dueDate);
            return (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-neutral-500">Next Step: {p.status}</div>
                </div>
                <div className="flex items-center gap-3">
                  {p.compensation > 0 && (
                    <span className="text-xs rounded-full bg-neutral-100 px-2 py-1">{formatCurrency(p.compensation)}</span>
                  )}
                  <span className={`text-xs rounded-full px-2 py-1 ${d.className}`}>{d.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
