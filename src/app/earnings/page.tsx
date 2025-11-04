"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PlusIcon, TrashIcon, TriangleUpIcon, CalendarIcon, TargetIcon, Cross2Icon } from "@radix-ui/react-icons";

type TimeFrame = "This Month" | "Last Month" | "Last 90 Days" | "This Year" | "All Time";
type PaymentStatus = "Pending" | "Received";

type Earning = {
  id: string;
  projectId?: string;
  projectName: string;
  amount: number;
  date: string;
  status: "pending" | "received";
  source: string;
};

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: "active" | "completed" | "paused";
};

type Project = {
  id: string;
  name: string;
  compensation: number;
  signedDate: string;
  paymentStatus?: PaymentStatus;
};

export default function EarningsPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddEarningOpen, setIsAddEarningOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [editingEarning, setEditingEarning] = useState<Earning | null>(null);
  const [pendingDeleteEarningId, setPendingDeleteEarningId] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("This Month");

  const getDateRange = (frame: TimeFrame) => {
    const now = new Date();
    let start: Date, end: Date;

    if (frame === "This Month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (frame === "Last Month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (frame === "Last 90 Days") {
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      end = new Date(now);
    } else if (frame === "This Year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      start = new Date(0);
      end = new Date(9999, 11, 31);
    }
    return { start, end };
  };

  const filteredEarnings = useMemo(() => {
    if (timeFrame === "All Time") return earnings;
    const { start, end } = getDateRange(timeFrame);
    return earnings.filter(e => {
      const earningDate = new Date(e.date);
      return earningDate >= start && earningDate <= end;
    });
  }, [earnings, timeFrame]);

  const summary = useMemo(() => {
    const receivedEarnings = filteredEarnings
      .filter(e => e.status === "received")
      .reduce((sum, earning) => sum + earning.amount, 0);
    
    const pendingEarnings = filteredEarnings
      .filter(e => e.status === "pending")
      .reduce((sum, earning) => sum + earning.amount, 0);

    const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    
    const activeGoals = goals.filter(g => g.status === "active");
    const totalGoalTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalGoalProgress = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const goalProgressPercentage = totalGoalTarget > 0 ? (totalGoalProgress / totalGoalTarget) * 100 : 0;

    return {
      totalEarnings,
      receivedEarnings,
      pendingEarnings,
      totalGoalTarget,
      totalGoalProgress,
      goalProgressPercentage,
      activeGoalsCount: activeGoals.length,
    };
  }, [filteredEarnings, goals]);

  useEffect(() => {
    const loadData = () => {
      try {
        const rawEarnings = localStorage.getItem("cc_earnings");
        if (rawEarnings) {
          const parsedEarnings = JSON.parse(rawEarnings) as Earning[];
          setEarnings(parsedEarnings);
        }
        
        const rawGoals = localStorage.getItem("cc_goals");
        if (rawGoals) {
          const parsedGoals = JSON.parse(rawGoals) as Goal[];
          setGoals(parsedGoals);
        }

        const rawProjects = localStorage.getItem("cc_projects");
        if (rawProjects) {
          const parsedProjects = JSON.parse(rawProjects) as Project[];
          setProjects(parsedProjects);
        }
      } catch {}
    };

    loadData();

    const handleProjectsUpdate = () => {
      try {
        const rawProjects = localStorage.getItem("cc_projects");
        if (rawProjects) {
          const parsedProjects = JSON.parse(rawProjects) as Project[];
          setProjects(parsedProjects);
        }
      } catch {}
    };

    window.addEventListener("projectsUpdated", handleProjectsUpdate);
    return () => window.removeEventListener("projectsUpdated", handleProjectsUpdate);
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;
    
    const projectEarnings: Earning[] = projects
      .filter(p => p.compensation > 0)
      .map(p => {
        const status: "pending" | "received" = p.paymentStatus === "Received" ? "received" : "pending";
        const source = p.paymentStatus === "Received" ? "Direct Payment" : "Project";
        
        return {
          id: `proj_${p.id}`,
          projectId: p.id,
          projectName: p.name,
          amount: p.compensation,
          date: p.signedDate,
          status,
          source,
        };
      });

    try {
      const rawEarnings = localStorage.getItem("cc_earnings");
      const manualEarnings = rawEarnings 
        ? (JSON.parse(rawEarnings) as Earning[]).filter(e => !e.id.startsWith("proj_"))
        : [];

      const existingProjectIds = new Set(projectEarnings.map(e => e.projectId));
      const uniqueManualEarnings = manualEarnings.filter(e => !existingProjectIds.has(e.projectId));
      
      const merged = [...uniqueManualEarnings, ...projectEarnings];
      setEarnings(merged);
      try {
        localStorage.setItem("cc_earnings", JSON.stringify(merged));
      } catch {}
    } catch {}
  }, [projects]);

  const persistEarnings = (newEarnings: Earning[]) => {
    setEarnings(newEarnings);
    localStorage.setItem("cc_earnings", JSON.stringify(newEarnings));
  };

  const persistGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem("cc_goals", JSON.stringify(newGoals));
  };

  const handleAddEarning = (earning: Omit<Earning, "id">) => {
    const newEarning: Earning = {
      ...earning,
      id: `e${Date.now()}`,
    };
    persistEarnings([...earnings, newEarning]);
  };

  const handleUpdateEarningStatus = (earningId: string, newStatus: "pending" | "received") => {
    const earning = earnings.find(e => e.id === earningId);
    if (earning && earning.id.startsWith("proj_")) {
      try {
        const rawProjects = localStorage.getItem("cc_projects");
        if (rawProjects) {
          const parsedProjects = JSON.parse(rawProjects) as Project[];
          const updatedProjects = parsedProjects.map(p => {
            if (p.id === earning.projectId) {
              return {
                ...p,
                paymentStatus: (newStatus === "received" ? "Received" : "Pending") as PaymentStatus,
              };
            }
            return p;
          });
          localStorage.setItem("cc_projects", JSON.stringify(updatedProjects));
          window.dispatchEvent(new CustomEvent("projectsUpdated"));
        }
      } catch {}
    }
    
    const updatedEarnings = earnings.map(e => 
      e.id === earningId ? { ...e, status: newStatus } : e
    );
    persistEarnings(updatedEarnings);
    setEditingEarning(null);
  };

  const handleDeleteEarning = (earningId: string) => {
    const earning = earnings.find(e => e.id === earningId);
    if (earning && earning.id.startsWith("proj_")) {
      try {
        const rawProjects = localStorage.getItem("cc_projects");
        if (rawProjects) {
          const parsedProjects = JSON.parse(rawProjects) as Project[];
          const updatedProjects = parsedProjects.map(p => {
            if (p.id === earning.projectId) {
              return {
                ...p,
                paymentStatus: "Pending" as PaymentStatus,
              };
            }
            return p;
          });
          localStorage.setItem("cc_projects", JSON.stringify(updatedProjects));
          window.dispatchEvent(new CustomEvent("projectsUpdated"));
        }
      } catch {}
    } else {
      const updatedEarnings = earnings.filter(e => e.id !== earningId);
      persistEarnings(updatedEarnings);
    }
    setPendingDeleteEarningId(null);
  };

  const handleAddGoal = (goal: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goal,
      id: `g${Date.now()}`,
    };
    persistGoals([...goals, newGoal]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[36px] font-semibold leading-tight">Earnings & Goals</h1>
              <p className="text-neutral-500">Track your earnings and set goals</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
                className="rounded-full border border-[#e5e5e5] bg-white text-sm px-4 py-2 text-neutral-700 hover:bg-neutral-50"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
              <div className="flex items-center rounded-full border border-[#DCDCDC] bg-white p-1">
                <button
                  onClick={() => router.push("/projects")}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-transparent text-black hover:bg-gray-50"
                >
                  Project Board
                </button>
                <button
                  onClick={() => router.push("/leads")}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-transparent text-black hover:bg-gray-50"
                >
                  Leads
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-[#E5CCF7] text-black"
                >
                  Earnings & Goals
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalEarnings)}</p>
                </div>
                <TriangleUpIcon className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Received</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.receivedEarnings)}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.pendingEarnings)}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-orange-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Goal Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.goalProgressPercentage.toFixed(0)}%</p>
                </div>
                <TargetIcon className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padded={false}>
              <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold">Recent Earnings</div>
                  <div className="text-xs text-neutral-500">
                    {filteredEarnings.length} total earnings · {formatCurrency(summary.totalEarnings)} total value
                  </div>
                </div>
                <button
                  onClick={() => setIsAddEarningOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-[#F7FFBF] text-black hover:bg-[#F0F7A3] px-4 py-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Earning
                </button>
              </div>
              <div className="p-4 space-y-3">
                {filteredEarnings.slice(0, 5).map((earning) => (
                  <div 
                    key={earning.id} 
                    onClick={() => setEditingEarning(earning)}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{earning.projectName}</p>
                      <p className="text-xs text-neutral-600">{formatDate(earning.date)} · {earning.source}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(earning.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          earning.status === "received" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {earning.status}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteEarningId(earning.id);
                        }}
                        className="text-neutral-500 hover:text-rose-600 transition-colors"
                        aria-label="Delete earning"
                        title="Delete earning"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredEarnings.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No earnings recorded yet
                  </div>
                )}
              </div>
            </Card>

            <Card padded={false}>
              <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold">Goals & Targets</div>
                  <div className="text-xs text-neutral-500">
                    {summary.activeGoalsCount} active goals · {formatCurrency(summary.totalGoalTarget)} total target
                  </div>
                </div>
                <button
                  onClick={() => setIsAddGoalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-[#F7FFBF] text-black hover:bg-[#F0F7A3] px-4 py-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Goal
                </button>
              </div>
              <div className="p-4 space-y-4">
                {goals.map((goal) => {
                  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{goal.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          goal.status === "completed" 
                            ? "bg-green-100 text-green-700"
                            : goal.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-neutral-600 mb-1">
                          <span>{formatCurrency(goal.currentAmount)}</span>
                          <span>{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Due: {formatDate(goal.deadline)} · {progressPercentage.toFixed(0)}% complete
                      </p>
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No goals set yet
                  </div>
                )}
              </div>
            </Card>
          </div>

          {isAddEarningOpen && (
            <AddEarningModal
              onClose={() => setIsAddEarningOpen(false)}
              onCreate={handleAddEarning}
            />
          )}

          {editingEarning && (
            <EditEarningModal
              earning={editingEarning}
              onClose={() => setEditingEarning(null)}
              onUpdate={(earningId, newStatus) => {
                handleUpdateEarningStatus(earningId, newStatus);
              }}
            />
          )}

          {pendingDeleteEarningId && (
            <ConfirmDeleteModal
              message="Are you sure you want to delete this earning?"
              onCancel={() => setPendingDeleteEarningId(null)}
              onConfirm={() => {
                handleDeleteEarning(pendingDeleteEarningId);
              }}
            />
          )}

          {isAddGoalOpen && (
            <AddGoalModal
              onClose={() => setIsAddGoalOpen(false)}
              onCreate={handleAddGoal}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function AddEarningModal({ onClose, onCreate }: { onClose: () => void; onCreate: (earning: Omit<Earning, "id">) => void }) {
  const [projectName, setProjectName] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"pending" | "received">("pending");
  const [source, setSource] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[420px]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Add Earning</div>
          <div className="text-xs text-neutral-500">Record a new earning</div>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({
              projectName,
              amount,
              date,
              status,
              source: source || "Manual Entry",
            });
            onClose();
          }}
        >
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Project Name</label>
            <input
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Date</label>
              <input
                type="date"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Status</label>
              <select
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={status}
                onChange={(e) => setStatus(e.target.value as "pending" | "received")}
              >
                <option value="pending">Pending</option>
                <option value="received">Received</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Source</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Direct Payment"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
              Cancel
            </button>
            <button type="submit" className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">
              Add Earning
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EditEarningModal({ earning, onClose, onUpdate }: { earning: Earning; onClose: () => void; onUpdate: (earningId: string, newStatus: "pending" | "received") => void }) {
  const [status, setStatus] = useState<"pending" | "received">(earning.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[420px]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Edit Earning</div>
          <div className="text-xs text-neutral-500">{earning.projectName}</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Payment Status</label>
            <select
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={status}
              onChange={(e) => setStatus(e.target.value as "pending" | "received")}
            >
              <option value="pending">Pending</option>
              <option value="received">Received</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
              Cancel
            </button>
            <button
              onClick={() => {
                onUpdate(earning.id, status);
              }}
              className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]"
            >
              Update Status
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ConfirmDeleteModal({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onCancel} />
      <Card className="relative w-[420px]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Confirm deletion</div>
          <div className="text-sm text-neutral-600">{message}</div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">Cancel</button>
          <button onClick={onConfirm} className="rounded-[10px] bg-rose-600 text-white px-4 py-2 text-[14px]">Delete</button>
        </div>
      </Card>
    </div>
  );
}

function AddGoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (goal: Omit<Goal, "id">) => void }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [deadline, setDeadline] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[420px]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Add Goal</div>
          <div className="text-xs text-neutral-500">Set a new financial goal</div>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({
              name,
              targetAmount,
              currentAmount,
              deadline,
              status: "active",
            });
            onClose();
          }}
        >
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Goal Name</label>
            <input
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Target Amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Current Amount</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Deadline</label>
            <input
              type="date"
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
              Cancel
            </button>
            <button type="submit" className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">
              Add Goal
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
