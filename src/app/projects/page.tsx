"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { 
  TrashIcon, 
  GridIcon, 
  ListBulletIcon, 
  CalendarIcon, 
  PlusIcon, 
  EnvelopeClosedIcon, 
  Cross2Icon,
  VideoIcon,
  ScissorsIcon,
  CheckCircledIcon,
  RocketIcon,
  DragHandleDots2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  DownloadIcon
} from "@radix-ui/react-icons";

type ProjectStatus = "Plan & Film" | "To Edit" | "In Approval" | "Completed";
type PaymentStatus = "Pending" | "Received";

type Project = {
  id: string;
  name: string;
  compensation: number;
  dueDate: string;
  leadSource: string;
  signedDate: string;
  status: ProjectStatus;
  paymentStatus?: PaymentStatus;
  clientEmail?: string;
  brief?: {
    text?: string;
    link?: string;
    file?: {
      name: string;
      data: string;
      type: string;
    };
  };
  script?: {
    text?: string;
    link?: string;
    file?: {
      name: string;
      data: string;
      type: string;
    };
  };
};

const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Adidas Originals",
    compensation: 275,
    dueDate: "2025-11-01",
    leadSource: "Inbound",
    signedDate: "2025-10-15",
    status: "Plan & Film",
  },
  {
    id: "p2",
    name: "Drunk Elephant",
    compensation: 125,
    dueDate: "2025-11-04",
    leadSource: "Fiverr",
    signedDate: "2025-10-20",
    status: "To Edit",
  },
  {
    id: "p3",
    name: "Pepsi Max",
    compensation: 250,
    dueDate: "2025-12-03",
    leadSource: "Vidsy",
    signedDate: "2025-10-10",
    status: "To Edit",
  },
  {
    id: "p4",
    name: "Dyson",
    compensation: 0,
    dueDate: "2025-10-25",
    leadSource: "Inbound",
    signedDate: "2025-10-01",
    status: "In Approval",
  },
];

function daysUntil(dueDateIso: string) {
  const due = new Date(dueDateIso);
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = startOfDue.getTime() - startOfToday.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

function classNamesForDue(dueDateIso: string) {
  const d = daysUntil(dueDateIso);
  if (d < 0) return { text: `${Math.abs(d)} days overdue`, className: "bg-rose-50 text-rose-700" };
  if (d === 0) return { text: "due today", className: "bg-amber-50 text-amber-700" };
  return { text: `${d} days`, className: "bg-lime-50 text-lime-700" };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "list" | "calendar">("board");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<ProjectStatus, Project[]> = {
      "Plan & Film": [],
      "To Edit": [],
      "In Approval": [],
      "Completed": [],
    };
    for (const p of projects) map[p.status].push(p);
    // Sort each status group by due date (nearest first)
    for (const status in map) {
      map[status as ProjectStatus].sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      });
    }
    return map;
  }, [projects]);

  const summary = useMemo(() => {
    const active = projects.filter((p) => p.status !== "Completed");
    const completed = projects.filter((p) => p.status === "Completed");
    const activeSum = active.reduce((acc, p) => acc + (p.compensation || 0), 0);
    const completedSum = completed.reduce((acc, p) => acc + (p.compensation || 0), 0);
    return {
      activeCount: active.length,
      completedCount: completed.length,
      activeSum,
      completedSum,
    };
  }, [projects]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc_projects");
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Partial<Project> & { paymentStatus?: string }>;
        const migrated = parsed.map((p) => {
          const oldPaymentStatus = p.paymentStatus as string | undefined;
          let newPaymentStatus: PaymentStatus = "Pending";
          if (oldPaymentStatus === "Payment received" || oldPaymentStatus === "Received") {
            newPaymentStatus = "Received";
          } else if (oldPaymentStatus === "Pending") {
            newPaymentStatus = "Pending";
          }
          return {
            ...p,
            signedDate: p.signedDate || p.dueDate || new Date().toISOString().slice(0, 10),
            paymentStatus: newPaymentStatus,
          };
        });
        setProjects(migrated as Project[]);
      }
    } catch {}
  }, []);

  function persist(next: Project[]) {
    setProjects(next);
    try {
      localStorage.setItem("cc_projects", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("projectsUpdated"));
    } catch {}
  }

  function handleAdd(project: Omit<Project, "id">) {
    const newProject: Project = { ...project, id: Math.random().toString(36).slice(2) };
    persist([newProject, ...projects]);
  }

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[36px] font-semibold leading-tight">Projects & Deals</h1>
              <p className="text-neutral-500">Organise your projects and content all in one place</p>
            </div>
            <div className="flex items-center rounded-full border border-[#DCDCDC] bg-white p-1">
              <button
                onClick={() => {}}
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-[#E5CCF7] text-black"
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
                onClick={() => router.push("/earnings")}
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-transparent text-black hover:bg-gray-50"
              >
                Earnings & Goals
              </button>
            </div>
          </div>

          <Card padded={false} className="mb-5">
            <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-semibold">Project Board</div>
                <div className="text-xs text-neutral-500">
                  {summary.activeCount} Active Projects ({formatCurrency(summary.activeSum)}) · {summary.completedCount} Completed Projects ({formatCurrency(summary.completedSum)})
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-[#DCDCDC] bg-white p-1">
                  <button 
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                      view === "board" 
                        ? "bg-[#E5CCF7] text-black" 
                        : "bg-transparent text-black hover:bg-gray-50"
                    )} 
                    onClick={() => setView("board")}
                  >
                    <GridIcon className="h-3 w-3" />
                    Board
                  </button>
                  <button 
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                      view === "list" 
                        ? "bg-[#E5CCF7] text-black" 
                        : "bg-transparent text-black hover:bg-gray-50"
                    )} 
                    onClick={() => setView("list")}
                  >
                    <ListBulletIcon className="h-3 w-3" />
                    List
                  </button>
                  <button 
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                      view === "calendar" 
                        ? "bg-[#E5CCF7] text-black" 
                        : "bg-transparent text-black hover:bg-gray-50"
                    )} 
                    onClick={() => setView("calendar")}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    Calendar
                  </button>
                </div>
                <button 
                  onClick={() => setIsAddOpen(true)} 
                  className="flex items-center gap-2 rounded-full bg-[#F7FFBF] text-black text-[12px] font-medium px-3 py-1.5 hover:bg-[#F0F7A3] transition-colors"
                >
                  <PlusIcon className="h-3 w-3" />
                  Add Project
                </button>
              </div>
            </div>

            {view === "board" && (
              <div className="p-4 grid grid-cols-4 gap-4">
                {(["Plan & Film", "To Edit", "In Approval", "Completed"] as ProjectStatus[]).map((status) => (
                  <KanbanColumn 
                    key={status} 
                    title={status} 
                    projects={byStatus[status]} 
                    draggingId={draggingId} 
                    onStatusChange={(id, next) => {
                      persist(projects.map(p => (p.id === id ? { ...p, status: next } : p)));
                    }} 
                    onDelete={(id) => setPendingDeleteId(id)} 
                    onCardDragStart={(id) => setDraggingId(id)} 
                    onCardDragEnd={() => {
                      setTimeout(() => setDraggingId(null), 0);
                    }} 
                    onOpen={(p) => setViewingProject(p)} 
                  />
                ))}
              </div>
            )}

            {view === "list" && (
              <ListView
                projects={projects}
                onStatusChange={(id, next) => persist(projects.map(p => (p.id === id ? { ...p, status: next } : p)))}
                onDelete={(id) => setPendingDeleteId(id)}
                onOpen={(p) => setViewingProject(p)}
              />
            )}

            {view === "calendar" && (
              <CalendarView projects={projects} onOpen={(p) => setViewingProject(p)} onDelete={(id) => setPendingDeleteId(id)} />
            )}
          </Card>

          {isAddOpen && (
            <AddProjectModal
              onClose={() => setIsAddOpen(false)}
              onCreate={(p) => {
                handleAdd(p);
                setIsAddOpen(false);
              }}
            />
          )}
          {pendingDeleteId && (
            <ConfirmModal
              message="Are you sure you want to delete this project?"
              onCancel={() => setPendingDeleteId(null)}
              onConfirm={() => {
                persist(projects.filter((p) => p.id !== pendingDeleteId));
                setPendingDeleteId(null);
                setViewingProject(null);
                setEditingProject(null);
              }}
            />
          )}
          {viewingProject && (
            <ProjectDetailModal
              project={viewingProject}
              onClose={() => setViewingProject(null)}
              onEdit={() => {
                setEditingProject(viewingProject);
                setViewingProject(null);
              }}
              onDelete={(id) => setPendingDeleteId(id)}
              onUpdate={(id, updates) => {
                persist(projects.map(p => (p.id === id ? { ...p, ...updates } : p)));
              }}
            />
          )}
          {editingProject && (
            <EditProjectModal
              project={editingProject}
              onClose={() => setEditingProject(null)}
              onSave={(updated) => {
                const next = projects.map((p) => (p.id === updated.id ? updated : p));
                persist(next);
                setEditingProject(null);
              }}
              onDelete={(id) => {
                persist(projects.filter((p) => p.id !== id));
                setEditingProject(null);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

type SortOption = "dueDate" | "status" | "compensation" | "name" | "leadSource";
type SortDirection = "asc" | "desc";

function ListView({ projects, onStatusChange, onDelete, onOpen }: { projects: Project[]; onStatusChange: (id: string, next: ProjectStatus) => void; onDelete: (id: string) => void; onOpen: (p: Project) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [activeIsOver, setActiveIsOver] = useState(false);
  const [completedIsOver, setCompletedIsOver] = useState(false);

  const handleSort = (column: SortOption) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const activeProjects = useMemo(() => {
    const filtered = projects.filter(p => p.status !== "Completed");
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let result = 0;
      switch (sortBy) {
        case "dueDate": {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          result = dateA - dateB;
          break;
        }
        case "status": {
          const statusOrder: Record<ProjectStatus, number> = {
            "Plan & Film": 0,
            "To Edit": 1,
            "In Approval": 2,
            "Completed": 3,
          };
          result = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case "compensation": {
          result = a.compensation - b.compensation;
          break;
        }
        case "name": {
          result = a.name.localeCompare(b.name);
          break;
        }
        case "leadSource": {
          result = a.leadSource.localeCompare(b.leadSource);
          break;
        }
        default:
          return 0;
      }
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [projects, sortBy, sortDirection]);

  const completedProjects = useMemo(() => {
    const filtered = projects.filter(p => p.status === "Completed");
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let result = 0;
      switch (sortBy) {
        case "dueDate": {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          result = dateA - dateB;
          break;
        }
        case "status": {
          const statusOrder: Record<ProjectStatus, number> = {
            "Plan & Film": 0,
            "To Edit": 1,
            "In Approval": 2,
            "Completed": 3,
          };
          result = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case "compensation": {
          result = a.compensation - b.compensation;
          break;
        }
        case "name": {
          result = a.name.localeCompare(b.name);
          break;
        }
        case "leadSource": {
          result = a.leadSource.localeCompare(b.leadSource);
          break;
        }
        default:
          return 0;
      }
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [projects, sortBy, sortDirection]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "Plan & Film": return "bg-purple-100 text-purple-700 border-purple-200";
      case "To Edit": return "bg-amber-100 text-amber-700 border-amber-200";
      case "In Approval": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: "Active" | "Completed") => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain") || dragId || "";
    if (!id) return;
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    if (targetStatus === "Completed" && project.status !== "Completed") {
      onStatusChange(id, "Completed");
    } else if (targetStatus === "Active" && project.status === "Completed") {
      // If dragging from Completed to Active, set to first active status
      onStatusChange(id, "Plan & Film");
    }
    
    // Clear dragging state after drop
    setTimeout(() => setDragId(null), 0);
  };

  const renderProjectRow = (p: Project) => (
    <div
      key={p.id}
      className={`grid grid-cols-5 items-center px-3 py-3 border-t border-[#f0f0f0] text-[14px] cursor-grab active:cursor-grabbing group hover:bg-neutral-50 ${
        dragId === p.id ? "opacity-50" : ""
      }`}
      style={dragId === p.id ? {} : { opacity: '1', transform: 'scale(1)' }}
      draggable
      onMouseEnter={() => setHoveredId(p.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("select") || target.closest("button") || target.closest("a")) return;
        onOpen(p);
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", p.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(p.id);
      }}
      onDragEnd={(e) => {
        const element = e.currentTarget as HTMLElement;
        // Immediately reset opacity to ensure full visibility
        element.style.opacity = '1';
        element.style.transform = '';
        // Reset all child elements opacity as well
        const children = element.querySelectorAll('*');
        children.forEach((child) => {
          (child as HTMLElement).style.opacity = '1';
        });
        setTimeout(() => setDragId(null), 0);
      }}
    >
      <div className="font-medium flex items-center gap-2">
        {(hoveredId === p.id || dragId === p.id) && (
          <DragHandleDots2Icon className="h-4 w-4 text-neutral-400" />
        )}
        {p.name}
      </div>
      <div>
        <select
          value={p.status}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(p.id, e.target.value as ProjectStatus);
          }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1",
            getStatusColor(p.status)
          )}
        >
          <option value="Plan & Film">Plan & Film</option>
          <option value="To Edit">To Edit</option>
          <option value="In Approval">In Approval</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>{formatCurrency(p.compensation)}</div>
      <div>{new Date(p.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</div>
      <div>{p.leadSource}</div>
    </div>
  );

  const SortableHeader = ({ column, label }: { column: SortOption; label: string }) => {
    const isActive = sortBy === column;
    return (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-neutral-900 select-none"
        onClick={() => handleSort(column)}
      >
        <span>{label}</span>
        {isActive && (
          sortDirection === "asc" ? (
            <ArrowUpIcon className="h-3 w-3" />
          ) : (
            <ArrowDownIcon className="h-3 w-3" />
          )
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Active Projects Section */}
        <div
          className={`rounded-[12px] border border-[#efefef] overflow-hidden bg-white ${
            activeIsOver && dragId ? "outline outline-2 outline-neutral-200" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setActiveIsOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setActiveIsOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveIsOver(false);
            handleDrop(e, "Active");
          }}
        >
          <div className="px-3 py-2 bg-neutral-50 border-b border-[#efefef]">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold">Active Projects</div>
              <div className="text-[12px] text-neutral-500">{activeProjects.length} items</div>
            </div>
          </div>
          <div className="grid grid-cols-5 px-3 py-2 text-[12px] text-neutral-600 bg-neutral-50 border-b border-[#efefef]">
            <SortableHeader column="name" label="Project" />
            <SortableHeader column="status" label="Status" />
            <SortableHeader column="compensation" label="Compensation" />
            <SortableHeader column="dueDate" label="Due" />
            <SortableHeader column="leadSource" label="Lead Source" />
          </div>
          <div className="min-h-[44px]">
            {activeProjects.map(renderProjectRow)}
            {activeProjects.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-neutral-500">
                No active projects
              </div>
            )}
          </div>
        </div>

        {/* Completed Projects Section */}
        <div
          className={`rounded-[12px] border border-[#efefef] overflow-hidden bg-white ${
            completedIsOver && dragId ? "outline outline-2 outline-neutral-200" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setCompletedIsOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setCompletedIsOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCompletedIsOver(false);
            handleDrop(e, "Completed");
          }}
        >
          <div className="px-3 py-2 bg-green-50 border-b border-[#efefef]">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold">Completed Projects</div>
              <div className="text-[12px] text-neutral-500">{completedProjects.length} items</div>
            </div>
          </div>
          <div className="grid grid-cols-5 px-3 py-2 text-[12px] text-neutral-600 bg-neutral-50 border-b border-[#efefef]">
            <SortableHeader column="name" label="Project" />
            <SortableHeader column="status" label="Status" />
            <SortableHeader column="compensation" label="Compensation" />
            <SortableHeader column="dueDate" label="Due" />
            <SortableHeader column="leadSource" label="Lead Source" />
          </div>
          <div className="min-h-[44px]">
            {completedProjects.map(renderProjectRow)}
            {completedProjects.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-neutral-500">
                No completed projects
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ projects, onOpen, onDelete }: { projects: Project[]; onOpen: (p: Project) => void; onDelete: (id: string) => void }) {
  const refDate = new Date();
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells: Array<{ date: Date | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d) });

  const byDay: Record<string, Project[]> = {};
  for (const p of projects) {
    const key = new Date(p.dueDate).toISOString().slice(0, 10);
    byDay[key] ||= [];
    byDay[key].push(p);
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-[12px] text-neutral-500 px-2">{d}</div>
        ))}
        {cells.map((c, idx) => {
          const key = c.date ? new Date(c.date).toISOString().slice(0, 10) : `empty-${idx}`;
          const items = c.date ? byDay[key] || [] : [];
          return (
            <div key={key} className="min-h-[110px] rounded-[12px] border border-[#efefef] bg-white p-2">
              <div className="text-[12px] text-neutral-500 mb-1">{c.date ? c.date.getDate() : ""}</div>
              <div className="flex flex-col gap-1">
                {items.map((p) => (
                  <div key={p.id} className="text-[11px] rounded-[8px] bg-neutral-50 border border-[#f0f0f0] px-2 py-1 cursor-pointer" onClick={() => onOpen(p)}>
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-neutral-600">{formatCurrency(p.compensation)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  projects,
  onStatusChange,
  onDelete,
  onCardDragStart,
  onCardDragEnd,
  draggingId,
  onOpen,
}: {
  title: ProjectStatus;
  projects: Project[];
  onStatusChange: (id: string, next: ProjectStatus) => void;
  onDelete: (id: string) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  draggingId: string | null;
  onOpen: (project: Project) => void;
}) {
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId || "";
    if (!id) return;
    onStatusChange(id, title);
    // Clear dragging state after drop
    onCardDragEnd();
  }

  const [isOver, setIsOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraggingOver = draggingId !== null && isOver;
  const hasMoreCards = projects.length >= 5;
  const visibleProjects = hasMoreCards && !isExpanded ? projects.slice(0, 4) : projects;
  const hiddenCount = hasMoreCards && !isExpanded ? projects.length - 4 : 0;

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case "Plan & Film": return <VideoIcon className="h-4 w-4" />;
      case "To Edit": return <ScissorsIcon className="h-4 w-4" />;
      case "In Approval": return <CheckCircledIcon className="h-4 w-4" />;
      case "Completed": return <RocketIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card
      className={cn("bg-[#fafafa]", isDraggingOver ? "outline outline-2 outline-neutral-200" : undefined)}
      padded={false}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        setIsOver(false);
        handleDrop(e);
      }}
    >
      <div className="px-4 py-3 flex items-center gap-2">
        {getStatusIcon(title)}
        <div className="text-[15px] font-semibold">{title}</div>
      </div>
      <div className="px-3 pb-3 min-h-[120px]">
        {visibleProjects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onMove={(next) => onStatusChange(p.id, next)}
            onDelete={() => onDelete(p.id)}
            onDragStart={() => onCardDragStart(p.id)}
            onDragEnd={onCardDragEnd}
            onOpen={() => onOpen(p)}
            isDragging={draggingId === p.id}
          />
        ))}
        {hasMoreCards && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full mt-2 mb-3 py-2 px-3 rounded-[10px] border border-[#e5e5e5] bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 flex items-center justify-center gap-2 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>See {hiddenCount} more</span>
          </button>
        )}
      </div>
    </Card>
  );
}

function ProjectCard({ project, onMove, onDelete, onDragStart, onDragEnd, onOpen, isDragging = false }: { project: Project; onMove: (next: ProjectStatus) => void; onDelete: () => void; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void; isDragging?: boolean }) {
  const due = classNamesForDue(project.dueDate);

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    // Immediately reset opacity to ensure full visibility
    element.style.opacity = '1';
    element.style.transform = '';
    // Reset all child elements opacity as well
    const children = element.querySelectorAll('*');
    children.forEach((child) => {
      (child as HTMLElement).style.opacity = '1';
    });
    onDragEnd();
  };

  return (
    <div
      className={`bg-white border border-[#efefef] rounded-[12px] shadow-sm p-3 mb-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95 shadow-lg" : ""
      }`}
      style={isDragging ? {} : { opacity: '1', transform: 'scale(1)' }}
      draggable
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("select") || target.closest("button")) return;
        onOpen();
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", project.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-medium">{project.name}</div>
        <span className="ml-2 text-[11px] rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 whitespace-nowrap">
          {project.leadSource}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] rounded-full bg-lime-50 text-lime-700 px-2 py-0.5">{formatCurrency(project.compensation)}</span>
        {project.status !== "Completed" && (
          <span className={cn("text-[11px] rounded-full px-2 py-0.5", due.className)}>{due.text}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <div className="text-neutral-500">Due {new Date(project.dueDate).toLocaleDateString("en-GB", { month: "long", day: "numeric" })}</div>
      </div>
    </div>
  );
}

function AddProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Omit<Project, "id">) => void }) {
  const [name, setName] = useState("");
  const [compensation, setCompensation] = useState(0);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [leadSource, setLeadSource] = useState("");
  const [signedDate, setSignedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<ProjectStatus>("Plan & Film");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");
  const [clientEmail, setClientEmail] = useState("");
  const [briefType, setBriefType] = useState<"link" | "file">("link");
  const [briefLink, setBriefLink] = useState("");
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [scriptType, setScriptType] = useState<"link" | "file">("link");
  const [scriptLink, setScriptLink] = useState("");
  const [scriptFile, setScriptFile] = useState<File | null>(null);

  const handleFileUpload = (file: File, callback: (data: string, name: string, type: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(",")[1] || result;
      callback(base64Data, file.name, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[560px] max-h-[80vh] overflow-y-auto">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Add Project</div>
          <div className="text-xs text-neutral-500">Create a new project card for your board</div>
        </div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const projectData: Omit<Project, "id"> = {
              name,
              compensation,
              dueDate,
              leadSource,
              signedDate,
              status,
              paymentStatus,
              clientEmail: clientEmail || undefined,
            };

            // Handle brief file upload
            if (briefType === "file" && briefFile) {
              const briefFileData = await new Promise<{ data: string; name: string; type: string }>((resolve) => {
                handleFileUpload(briefFile, (data, name, type) => resolve({ data, name, type }));
              });
              projectData.brief = { file: briefFileData };
            } else if (briefType === "link" && briefLink.trim()) {
              projectData.brief = { link: briefLink.trim() };
            }

            // Handle script file upload
            if (scriptType === "file" && scriptFile) {
              const scriptFileData = await new Promise<{ data: string; name: string; type: string }>((resolve) => {
                handleFileUpload(scriptFile, (data, name, type) => resolve({ data, name, type }));
              });
              projectData.script = { file: scriptFileData };
            } else if (scriptType === "link" && scriptLink.trim()) {
              projectData.script = { link: scriptLink.trim() };
            }

            onCreate(projectData);
          }}
        >
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Project Name</label>
            <input
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter brand or client name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Compensation</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={compensation}
                onChange={(e) => setCompensation(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Due Date</label>
              <input
                type="date"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Lead Source</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                placeholder="e.g. Inbound, Fiverr, Upwork"
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Status</label>
              <select
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option>Plan & Film</option>
                <option>To Edit</option>
                <option>In Approval</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Signed Date</label>
            <input
              type="date"
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={signedDate}
              onChange={(e) => setSignedDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Payment Status</label>
            <select
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            >
              <option>Pending</option>
              <option>Received</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Client Email</label>
            <input
              type="email"
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Project Brief</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBriefType("link")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      briefType === "link"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setBriefType("file")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      briefType === "file"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    File
                  </button>
                </div>
                {briefType === "link" ? (
                  <input
                    type="url"
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                    value={briefLink}
                    onChange={(e) => setBriefLink(e.target.value)}
                    placeholder="https://example.com/brief"
                  />
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                    onChange={(e) => setBriefFile(e.target.files?.[0] || null)}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Project Script</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScriptType("link")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      scriptType === "link"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptType("file")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      scriptType === "file"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    File
                  </button>
                </div>
                {scriptType === "link" ? (
                  <input
                    type="url"
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                    value={scriptLink}
                    onChange={(e) => setScriptLink(e.target.value)}
                    placeholder="https://example.com/script"
                  />
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                    onChange={(e) => setScriptFile(e.target.files?.[0] || null)}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
              Cancel
            </button>
            <button type="submit" className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">
              Add Project
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EditProjectModal({ project, onClose, onSave, onDelete }: { project: Project; onClose: () => void; onSave: (p: Project) => void; onDelete: (id: string) => void }) {
  const [name, setName] = useState(project.name);
  const [compensation, setCompensation] = useState(project.compensation);
  const [dueDate, setDueDate] = useState<string>(project.dueDate);
  const [leadSource, setLeadSource] = useState(project.leadSource);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [signedDate, setSignedDate] = useState<string>(project.signedDate || "");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(project.paymentStatus || "Pending");
  const [clientEmail, setClientEmail] = useState(project.clientEmail || "");
  const [briefType, setBriefType] = useState<"link" | "file">(project.brief?.link ? "link" : project.brief?.file ? "file" : "link");
  const [briefLink, setBriefLink] = useState(project.brief?.link || "");
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [scriptType, setScriptType] = useState<"link" | "file">(project.script?.link ? "link" : project.script?.file ? "file" : "link");
  const [scriptLink, setScriptLink] = useState(project.script?.link || "");
  const [scriptFile, setScriptFile] = useState<File | null>(null);

  const handleFileUpload = (file: File, callback: (data: string, name: string, type: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(",")[1] || result;
      callback(base64Data, file.name, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[520px] max-h-[80vh] overflow-y-auto">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Edit Project</div>
          <div className="text-xs text-neutral-500">Update details for {project.name}</div>
        </div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const projectData: Project = {
              ...project,
              name,
              compensation,
              dueDate,
              leadSource,
              signedDate,
              status,
              paymentStatus,
              clientEmail: clientEmail || undefined,
            };

            // Handle brief file upload
            if (briefType === "file" && briefFile) {
              const briefFileData = await new Promise<{ data: string; name: string; type: string }>((resolve) => {
                handleFileUpload(briefFile, (data, name, type) => resolve({ data, name, type }));
              });
              projectData.brief = { file: briefFileData };
            } else if (briefType === "link" && briefLink.trim()) {
              projectData.brief = { link: briefLink.trim() };
            } else if (!briefLink.trim() && !briefFile) {
              projectData.brief = undefined;
            } else if (briefType === "file" && project.brief?.file) {
              // Keep existing file if no new file uploaded
              projectData.brief = project.brief;
            }

            // Handle script file upload
            if (scriptType === "file" && scriptFile) {
              const scriptFileData = await new Promise<{ data: string; name: string; type: string }>((resolve) => {
                handleFileUpload(scriptFile, (data, name, type) => resolve({ data, name, type }));
              });
              projectData.script = { file: scriptFileData };
            } else if (scriptType === "link" && scriptLink.trim()) {
              projectData.script = { link: scriptLink.trim() };
            } else if (!scriptLink.trim() && !scriptFile) {
              projectData.script = undefined;
            } else if (scriptType === "file" && project.script?.file) {
              // Keep existing file if no new file uploaded
              projectData.script = project.script;
            }

            onSave(projectData);
          }}
        >
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Project Name</label>
            <input className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Compensation</label>
              <input type="number" min={0} className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]" value={compensation} onChange={(e) => setCompensation(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Due Date</label>
              <input type="date" className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Lead Source</label>
              <input className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]" value={leadSource} onChange={(e) => setLeadSource(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Status</label>
              <select className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                <option>Plan & Film</option>
                <option>To Edit</option>
                <option>In Approval</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Signed Date</label>
            <input type="date" className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]" value={signedDate} onChange={(e) => setSignedDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Payment Status</label>
            <select
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            >
              <option>Pending</option>
              <option>Received</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Client Email</label>
            <input
              type="email"
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Project Brief</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBriefType("link")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      briefType === "link"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setBriefType("file")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      briefType === "file"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    File
                  </button>
                </div>
                {briefType === "link" ? (
                  <input
                    type="url"
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                    value={briefLink}
                    onChange={(e) => setBriefLink(e.target.value)}
                    placeholder="https://example.com/brief"
                  />
                ) : (
                  <div className="space-y-2">
                    {project.brief?.file && (
                      <div className="text-xs text-neutral-500">
                        Current file: {project.brief.file.name}
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                      className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                      onChange={(e) => setBriefFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Project Script</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScriptType("link")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      scriptType === "link"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptType("file")}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-1 text-xs border transition-colors",
                      scriptType === "file"
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-700 border-[#e5e5e5] hover:bg-neutral-50"
                    )}
                  >
                    File
                  </button>
                </div>
                {scriptType === "link" ? (
                  <input
                    type="url"
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                    value={scriptLink}
                    onChange={(e) => setScriptLink(e.target.value)}
                    placeholder="https://example.com/script"
                  />
                ) : (
                  <div className="space-y-2">
                    {project.script?.file && (
                      <div className="text-xs text-neutral-500">
                        Current file: {project.script.file.name}
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                      className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                      onChange={(e) => setScriptFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 pt-2">
            <button type="button" onClick={() => onDelete(project.id)} className="rounded-[10px] px-3 py-2 text-[14px] text-rose-600 hover:bg-rose-50">Delete</button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">Cancel</button>
              <button type="submit" className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">Save changes</button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ProjectDetailModal({ project, onClose, onEdit, onDelete, onUpdate }: { project: Project; onClose: () => void; onEdit: () => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: Partial<Project>) => void }) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(project.paymentStatus || "Pending");

  useEffect(() => {
    if (project) {
      setPaymentStatus(project.paymentStatus || "Pending");
    }
  }, [project]);

  const handlePaymentStatusChange = (newStatus: PaymentStatus) => {
    setPaymentStatus(newStatus);
    onUpdate(project.id, { paymentStatus: newStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-[600px] bg-white rounded-[12px] shadow-xl">
        <div className="p-6 border-b border-[#efefef]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs rounded-full bg-white border border-[#efefef] px-2 py-1">{project.leadSource}</span>
              <div>
                <h2 className="text-[24px] font-bold text-black">{project.name}</h2>
                <p className="text-sm text-neutral-500">Project details</p>
              </div>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <Cross2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-black mb-1">
                    <EnvelopeClosedIcon className="h-4 w-4" />
                    Contact
                  </div>
                  <p className="text-sm text-neutral-600">{project.clientEmail || "No email provided"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-black mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Due Date
                  </div>
                  <p className="text-sm text-neutral-600">{new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-black mb-1">
                    Compensation
                  </div>
                  <p className="text-sm text-neutral-600">{formatCurrency(project.compensation)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-black mb-1">
                    Payment Status
                  </div>
                  <select
                    value={paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                    className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                  >
                    <option>Pending</option>
                    <option>Received</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#efefef]">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                  Project Brief
                </div>
                {project.brief?.link ? (
                  <a
                    href={project.brief.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span className="text-xs">↗</span>
                    Open Brief Link
                  </a>
                ) : project.brief?.file ? (
                  <button
                    onClick={() => {
                      // Create a blob from base64 data
                      const byteCharacters = atob(project.brief!.file!.data);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: project.brief!.file!.type });
                      const url = URL.createObjectURL(blob);
                      
                      // Check if file is an image, PDF, or DOC/DOCX that can be opened in browser
                      const fileType = project.brief!.file!.type.toLowerCase();
                      const fileName = project.brief!.file!.name.toLowerCase();
                      const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
                      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
                      const isDoc = fileType.includes('document') || /\.(doc|docx)$/i.test(fileName);
                      
                      if (isImage || isPDF || isDoc) {
                        // Open in new tab/window
                        window.open(url, '_blank');
                      } else {
                        // Download for other file types
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = project.brief!.file!.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                      // Clean up URL after a delay to allow the browser to open it
                      setTimeout(() => URL.revokeObjectURL(url), 100);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    {project.brief.file.type?.startsWith('image/') ? 'View' : 'Open'} {project.brief.file.name}
                  </button>
                ) : (
                  <div className="text-sm text-neutral-500">No brief added</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                  Project Script
                </div>
                {project.script?.link ? (
                  <a
                    href={project.script.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span className="text-xs">↗</span>
                    Open Script Link
                  </a>
                ) : project.script?.file ? (
                  <button
                    onClick={() => {
                      // Create a blob from base64 data
                      const byteCharacters = atob(project.script!.file!.data);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: project.script!.file!.type });
                      const url = URL.createObjectURL(blob);
                      
                      // Check if file is an image, PDF, or DOC/DOCX that can be opened in browser
                      const fileType = project.script!.file!.type.toLowerCase();
                      const fileName = project.script!.file!.name.toLowerCase();
                      const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
                      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
                      const isDoc = fileType.includes('document') || /\.(doc|docx)$/i.test(fileName);
                      
                      if (isImage || isPDF || isDoc) {
                        // Open in new tab/window
                        window.open(url, '_blank');
                      } else {
                        // Download for other file types
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = project.script!.file!.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                      // Clean up URL after a delay to allow the browser to open it
                      setTimeout(() => URL.revokeObjectURL(url), 100);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    {project.script.file.type?.startsWith('image/') ? 'View' : 'Open'} {project.script.file.name}
                  </button>
                ) : (
                  <div className="text-sm text-neutral-500">No script added</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t border-[#efefef]">
          <button
            onClick={() => onDelete(project.id)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-[8px] hover:bg-red-50"
          >
            Delete
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-black border border-[#efefef] rounded-[8px] hover:bg-neutral-50"
            >
              Edit Project
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-black border border-[#efefef] rounded-[8px] hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
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
