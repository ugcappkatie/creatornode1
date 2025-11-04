"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { TopBar } from "@/components/topbar/TopBar";
import { KPIGroup } from "@/components/metrics/KPIGroup";
import { EarningsChart } from "@/components/charts/EarningsChart";
import { GoalWidget } from "@/components/widgets/GoalWidget";
import { ActiveProjects } from "@/components/widgets/ActiveProjects";
import { Inspo } from "@/components/widgets/Inspo";

type TimePeriod = "This Month" | "Last Month" | "This Year";

export default function Home() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("This Month");

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <TopBar timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
          <div className="space-y-5">
            <KPIGroup timePeriod={timePeriod} />
            <div className="grid grid-cols-4 gap-4">
              <EarningsChart />
              <GoalWidget />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <ActiveProjects />
              <Inspo />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
