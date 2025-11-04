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
  DragHandleDots2Icon
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
        const parsed = JSON.parse(raw) as any[];
        const migrated = parsed.map((p) => ({
          ...p,
          signedDate: p.signedDate || p.dueDate || new Date().toISOString().slice(0, 10),
          paymentStatus: p.paymentStatus === "Payment received" ? "Received" : 
                       p.paymentStatus === "Payment pending" || p.paymentStatus === "Awaiting payment" || p.paymentStatus === "Invoice sent" ? "Pending" :
                       p.paymentStatus || "Pending",
        }));
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
                    onCardDragEnd={() => setDraggingId(null)} 
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

function ListView({ projects, onStatusChange, onDelete, onOpen }: { projects: Project[]; onStatusChange: (id: string, next: ProjectStatus) => void; onDelete: (id: string) => void; onOpen: (p: Project) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const statuses: ProjectStatus[] = ["Plan & Film", "To Edit", "In Approval", "Completed"];
  const grouped: Record<ProjectStatus, Project[]> = {
    "Plan & Film": [],
    "To Edit": [],
    "In Approval": [],
    "Completed": [],
  };
  for (const p of projects) grouped[p.status].push(p);
  for (const s of statuses) grouped[s].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const getStatusHeaderColor = (status: ProjectStatus) => {
    switch (status) {
      case "Plan & Film": return "bg-purple-50 border-purple-100";
      case "To Edit": return "bg-amber-50 border-amber-100";
      case "In Approval": return "bg-blue-50 border-blue-100";
      case "Completed": return "bg-green-50 border-green-100";
      default: return "bg-neutral-50";
    }
  };

  function handleSectionDrop(e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId || "";
    if (!id) return;
    onStatusChange(id, status);
    setDragId(null);
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        {statuses.map((status) => (
          <div key={status} className="rounded-[12px] border border-[#efefef] overflow-hidden">
            <div className={cn("flex items-center justify-between px-3 py-2 border-b", getStatusHeaderColor(status))}>
              <div className="text-[13px] font-semibold">{status}</div>
              <div className="text-[12px] text-neutral-500">{grouped[status].length} items</div>
            </div>
            <div
              className={cn("min-h-[44px]", dragId ? "bg-neutral-50" : undefined)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => handleSectionDrop(e, status)}
            >
              <div className="grid grid-cols-5 px-3 py-2 text-[12px] text-neutral-600">
                <div className="w-6"></div>
                <div>Project</div>
                <div>Compensation</div>
                <div>Due</div>
                <div>Lead Source</div>
              </div>
              {grouped[status].map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-5 items-center px-3 py-3 border-t border-[#f0f0f0] text-[14px] cursor-grab active:cursor-grabbing group hover:bg-neutral-50"
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
                  onDragEnd={() => setDragId(null)}
                >
                  <div className="w-6 flex items-center justify-center">
                    {(hoveredId === p.id || dragId === p.id) && (
                      <DragHandleDots2Icon className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="font-medium">{p.name}</div>
                  <div>{formatCurrency(p.compensation)}</div>
                  <div>{new Date(p.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</div>
                  <div>{p.leadSource}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
  }

  const [isOver, setIsOver] = useState(false);
  const isDraggingOver = draggingId !== null && isOver;

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
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onMove={(next) => onStatusChange(p.id, next)}
            onDelete={() => onDelete(p.id)}
            onDragStart={() => onCardDragStart(p.id)}
            onDragEnd={onCardDragEnd}
            onOpen={() => onOpen(p)}
          />
        ))}
      </div>
    </Card>
  );
}

function ProjectCard({ project, onMove, onDelete, onDragStart, onDragEnd, onOpen }: { project: Project; onMove: (next: ProjectStatus) => void; onDelete: () => void; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void }) {
  const due = classNamesForDue(project.dueDate);

  return (
    <div
      className="bg-white border border-[#efefef] rounded-[12px] shadow-sm p-3 mb-3 cursor-grab active:cursor-grabbing"
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
      onDragEnd={onDragEnd}
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
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({
              name,
              compensation,
              dueDate,
              leadSource,
              signedDate,
              status,
              paymentStatus,
              clientEmail: clientEmail || undefined,
            });
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
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              ...project,
              name,
              compensation,
              dueDate,
              leadSource,
              signedDate,
              status,
              paymentStatus,
              clientEmail: clientEmail || undefined,
            });
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
