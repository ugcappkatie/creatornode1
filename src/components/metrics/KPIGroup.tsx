"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownIcon } from "@radix-ui/react-icons";

type TimePeriod = "This Month" | "Last Month" | "This Year";

type Project = {
  signedDate?: string;
  status?: string;
  dueDate?: string;
  compensation?: number;
};

export function KPIGroup({ timePeriod }: { timePeriod: TimePeriod }) {
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

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    let start: Date, end: Date;

    if (period === "This Month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === "Last Month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }
    return { start, end };
  };

  const getPreviousPeriodRange = (period: TimePeriod) => {
    const now = new Date();
    let start: Date, end: Date;

    if (period === "This Month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "Last Month") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      end = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
    } else {
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    }
    return { start, end };
  };

  const { start, end } = getDateRange(timePeriod);
  const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(timePeriod);

  const isInRange = (dateStr: string, rangeStart: Date, rangeEnd: Date) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= rangeStart && d <= rangeEnd;
  };

  const currentProjects = useMemo(() => projects.filter((p) => isInRange(p.signedDate || "", start, end)), [projects, start, end]);
  const previousProjects = useMemo(() => projects.filter((p) => isInRange(p.signedDate || "", prevStart, prevEnd)), [projects, prevStart, prevEnd]);

  const totalProjects = currentProjects.length;
  const prevTotalProjects = previousProjects.length;
  const totalChange = totalProjects - prevTotalProjects;

  const activeProjects = currentProjects.filter((p) => p.status && p.status !== "Completed").length;
  const prevActiveProjects = previousProjects.filter((p) => p.status && p.status !== "Completed").length;
  const activeChange = activeProjects - prevActiveProjects;

  const completedProjects = currentProjects.filter((p) => p.status === "Completed").length;
  const prevCompletedProjects = previousProjects.filter((p) => p.status === "Completed").length;
  const completedChange = completedProjects - prevCompletedProjects;

  const now = new Date();
  const overdueProjects = projects.filter((p) => {
    if (!p.dueDate || p.status === "Completed") return false;
    const due = new Date(p.dueDate);
    return due < now;
  }).length;

  const ComparisonBadge = ({ change }: { change: number }) => {
    if (change === 0) return null;
    const isIncrease = change > 0;
    return (
      <div className={`inline-flex items-center gap-1 text-xs ${isIncrease ? "text-green-600" : "text-red-600"}`}>
        {isIncrease ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
            <path d="M2 8L5 5L7.5 7.5L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 4H10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <ArrowDownIcon className="h-3 w-3" />
        )}
        <span>{isIncrease ? "Increased from last month" : `Decreased from ${timePeriod === "This Month" ? "last month" : timePeriod === "Last Month" ? "previous month" : "last year"}`}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="p-5">
        <div className="text-sm text-neutral-600 mb-2">Total Projects</div>
        <div className="text-[48px] font-semibold leading-none mb-2">{totalProjects}</div>
        <ComparisonBadge change={totalChange} />
      </Card>
      <Card className="p-5">
        <div className="text-sm text-neutral-600 mb-2">Active Projects</div>
        <div className="text-[48px] font-semibold leading-none mb-2">{activeProjects}</div>
        <ComparisonBadge change={activeChange} />
      </Card>
      <Card className="p-5">
        <div className="text-sm text-neutral-600 mb-2">Completed Projects</div>
        <div className="text-[48px] font-semibold leading-none mb-2">{completedProjects}</div>
        <ComparisonBadge change={completedChange} />
      </Card>
      <Card className="p-5">
        <div className="text-sm text-neutral-600 mb-2">Overdue Invoices</div>
        <div className="text-[48px] font-semibold leading-none mb-2">{overdueProjects}</div>
      </Card>
    </div>
  );
}
