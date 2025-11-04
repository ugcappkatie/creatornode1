"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PlusIcon, TrashIcon, ChatBubbleIcon, CheckIcon, ReloadIcon, CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";

type LeadStatus = "To Contact" | "Contacted" | "Follow Up" | "Closed";

type Lead = {
  id: string;
  brandName: string;
  contactName: string;
  email: string;
  website?: string;
  dealAmount: number;
  status: LeadStatus;
  createdAt: string;
  lastContacted?: string;
  source?: string;
  followUpDate?: string;
};

const initialLeads: Lead[] = [
  {
    id: "l1",
    brandName: "TechCorp Inc",
    contactName: "Sarah Johnson",
    email: "sarah@techcorp.com",
    website: "https://techcorp.com",
    dealAmount: 5000,
    status: "To Contact",
    createdAt: "2024-01-15",
  },
  {
    id: "l2",
    brandName: "StartupXYZ",
    contactName: "Mike Chen",
    email: "mike@startupxyz.com",
    website: "https://startupxyz.com",
    dealAmount: 3000,
    status: "Contacted",
    createdAt: "2024-01-10",
    lastContacted: "2024-01-12",
  },
  {
    id: "l3",
    brandName: "Marketing Pro",
    contactName: "Emily Davis",
    email: "emily@marketingpro.com",
    website: "https://marketingpro.com",
    dealAmount: 8000,
    status: "Follow Up",
    createdAt: "2024-01-05",
    lastContacted: "2024-01-14",
  },
  {
    id: "l4",
    brandName: "Nike",
    contactName: "Jane Cooper",
    email: "jane@nike.com",
    website: "https://nike.com",
    dealAmount: 12000,
    status: "Closed",
    createdAt: "2024-01-01",
    lastContacted: "2024-01-20",
  },
];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      "To Contact": [],
      "Contacted": [],
      "Follow Up": [],
      "Closed": [],
    };
    leads.forEach((lead) => {
      map[lead.status].push(lead);
    });
    return map;
  }, [leads]);

  const summary = useMemo(() => {
    const totalLeads = leads.length;
    const closedLeads = leads.filter(l => l.status === "Closed").length;
    const activeLeads = totalLeads - closedLeads;
    const totalValue = leads.reduce((sum, lead) => sum + lead.dealAmount, 0);
    const closedValue = leads.filter(l => l.status === "Closed").reduce((sum, lead) => sum + lead.dealAmount, 0);
    
    return {
      totalLeads,
      activeLeads,
      closedLeads,
      totalValue,
      closedValue,
    };
  }, [leads]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc_leads");
      if (raw) {
        const parsed = JSON.parse(raw) as Lead[];
        setLeads(parsed);
      }
    } catch {}
  }, []);

  const persist = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem("cc_leads", JSON.stringify(newLeads));
  };

  const handleAdd = (lead: Omit<Lead, "id">) => {
    const newLead: Lead = {
      ...lead,
      id: `l${Date.now()}`,
    };
    persist([...leads, newLead]);
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    persist(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  const handleDelete = (leadId: string) => {
    persist(leads.filter(lead => lead.id !== leadId));
  };

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[36px] font-semibold leading-tight text-black">Leads</h1>
              <p className="text-neutral-500">Manage your leads and prospects</p>
            </div>
            <div className="flex items-center rounded-full border border-[#DCDCDC] bg-white p-1">
              <button
                onClick={() => router.push("/projects")}
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-transparent text-black hover:bg-gray-50"
              >
                Project Board
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 text-sm font-medium rounded-full transition-colors bg-[#E5CCF7] text-black"
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
                <div className="text-[15px] font-semibold">Lead Pipeline</div>
                <div className="text-xs text-neutral-500">
                  {summary.activeLeads} Active Leads · {summary.closedLeads} Closed ({formatCurrency(summary.closedValue)}) · {formatCurrency(summary.totalValue)} Total Value
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-[#F7FFBF] text-black hover:bg-[#F0F7A3] px-4 py-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Lead
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-4 gap-4">
              {(["To Contact", "Contacted", "Follow Up", "Closed"] as LeadStatus[]).map((status) => (
                <LeadColumn 
                  key={status} 
                  title={status} 
                  leads={byStatus[status]} 
                  draggingId={draggingId}
                  onStatusChange={handleStatusChange}
                  onDelete={(id) => setPendingDeleteId(id)}
                  onOpen={(lead) => setViewingLead(lead)}
                  onLeadDragStart={(id) => setDraggingId(id)}
                  onLeadDragEnd={() => {
                    setTimeout(() => setDraggingId(null), 0);
                  }}
                />
              ))}
            </div>
          </Card>

          {isAddOpen && (
            <AddLeadModal
              onClose={() => setIsAddOpen(false)}
              onCreate={(lead) => {
                handleAdd(lead);
                setIsAddOpen(false);
              }}
            />
          )}
          {viewingLead && (
            <LeadOverviewModal
              lead={viewingLead}
              onClose={() => setViewingLead(null)}
              onUpdate={(updated) => {
                persist(leads.map(l => l.id === updated.id ? updated : l));
                setViewingLead(updated);
              }}
              onDelete={(id) => {
                setPendingDeleteId(id);
                setViewingLead(null);
              }}
            />
          )}
          {pendingDeleteId && (
            <ConfirmDeleteModal
              onConfirm={() => {
                handleDelete(pendingDeleteId);
                setPendingDeleteId(null);
              }}
              onCancel={() => setPendingDeleteId(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LeadColumn({ 
  title, 
  leads, 
  draggingId, 
  onStatusChange, 
  onDelete,
  onOpen,
  onLeadDragStart, 
  onLeadDragEnd 
}: { 
  title: LeadStatus; 
  leads: Lead[]; 
  draggingId: string | null;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (lead: Lead) => void;
  onLeadDragStart: (id: string) => void;
  onLeadDragEnd: () => void;
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId || "";
    if (!id) return;
    onStatusChange(id, title);
  };

  const [isOver, setIsOver] = useState(false);
  const isDraggingOver = draggingId !== null && isOver;
  const totalAmount = leads.reduce((sum, lead) => sum + lead.dealAmount, 0);

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case "To Contact": return <ChatBubbleIcon className="h-4 w-4" />;
      case "Contacted": return <CheckIcon className="h-4 w-4" />;
      case "Follow Up": return <ReloadIcon className="h-4 w-4" />;
      case "Closed": return <CheckCircledIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-[#e5e5e5] p-4 space-y-3 ${
        isDraggingOver ? "outline outline-2 outline-neutral-200" : ""
      }`}
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
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon(title)}
        <h3 className="text-[15px] font-semibold text-black">{title}</h3>
      </div>
      <div className="text-xs text-neutral-500">
        {leads.length} Leads · {formatCurrency(totalAmount)} Total Value
      </div>
      
      <div
        className="space-y-2"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          setIsOver(false);
          handleDrop(e);
        }}
      >
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onOpen={onOpen}
            onDragStart={onLeadDragStart}
            onDragEnd={onLeadDragEnd}
            isDragging={draggingId === lead.id}
          />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ 
  lead, 
  onStatusChange, 
  onDelete,
  onOpen,
  onDragStart, 
  onDragEnd,
  isDragging = false
}: { 
  lead: Lead; 
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (lead: Lead) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", lead.id);
    try { e.dataTransfer.setData("text/lead-id", lead.id); } catch {}
    e.dataTransfer.effectAllowed = "move";
    onDragStart(lead.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd();
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  return (
    <div
      draggable
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button")) return;
        onOpen(lead);
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg border border-[#e5e5e5] p-2 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-neutral-300 transition-all ${
        isDragging ? "opacity-50 scale-95 shadow-lg" : "opacity-100"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold text-black">{lead.brandName}</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id);
            }}
            className="text-neutral-400 hover:text-red-500 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {formatCurrency(lead.dealAmount)}
          </span>
        </div>
        
        <div className="text-xs text-neutral-500 space-y-1">
          <div>{lead.email}</div>
          {lead.website && (
            <div className="text-blue-600 hover:text-blue-800">
              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                {lead.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddLeadModal({ onClose, onCreate }: { onClose: () => void; onCreate: (lead: Omit<Lead, "id">) => void }) {
  const [brandName, setBrandName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [dealAmount, setDealAmount] = useState(0);
  const [status, setStatus] = useState<LeadStatus>("To Contact");
  const [source, setSource] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[520px] max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Add Lead</div>
          <div className="text-xs text-neutral-500">Create a new lead in your pipeline</div>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({ 
              brandName, 
              contactName, 
              email, 
              website, 
              dealAmount, 
              status, 
              createdAt: new Date().toISOString().slice(0, 10),
              source: source || undefined,
              followUpDate: followUpDate || undefined,
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Brand Name</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Company/Brand name"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Contact Name</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact person name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Website</label>
              <input
                type="url"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Estimated Value</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={dealAmount}
                onChange={(e) => setDealAmount(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Status</label>
              <select
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                <option>To Contact</option>
                <option>Contacted</option>
                <option>Follow Up</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Source</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. LinkedIn, Referral, Website"
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Follow Up Date</label>
              <input
                type="date"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
              Cancel
            </button>
            <button type="submit" className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">
              Add Lead
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function LeadOverviewModal({ lead, onClose, onUpdate, onDelete }: { lead: Lead; onClose: () => void; onUpdate: (lead: Lead) => void; onDelete: (id: string) => void }) {
  const [brandName, setBrandName] = useState(lead.brandName);
  const [contactName, setContactName] = useState(lead.contactName);
  const [email, setEmail] = useState(lead.email);
  const [website, setWebsite] = useState(lead.website || "");
  const [dealAmount, setDealAmount] = useState(lead.dealAmount);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [source, setSource] = useState(lead.source || "");
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate || "");
  const [lastContacted, setLastContacted] = useState(lead.lastContacted || "");

  const handleSave = () => {
    onUpdate({
      ...lead,
      brandName,
      contactName,
      email,
      website,
      dealAmount,
      status,
      source,
      followUpDate,
      lastContacted,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <Card className="relative w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[16px] font-semibold">Lead Overview</div>
            <div className="text-xs text-neutral-500">View and edit lead details</div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <Cross2Icon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Brand Name</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Contact Name</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Website</label>
              <input
                type="url"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Estimated Value</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={dealAmount}
                onChange={(e) => setDealAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Status</label>
              <select
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                <option>To Contact</option>
                <option>Contacted</option>
                <option>Follow Up</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Source</label>
              <input
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. LinkedIn, Referral, Website"
              />
            </div>
            <div>
              <label className="block text-[12px] text-neutral-600 mb-1">Follow Up Date</label>
              <input
                type="date"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-neutral-600 mb-1">Last Contacted</label>
            <input
              type="date"
              className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
              value={lastContacted}
              onChange={(e) => setLastContacted(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => onDelete(lead.id)}
              className="rounded-[10px] px-3 py-2 text-[14px] text-rose-600 hover:bg-rose-50"
            >
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="rounded-[10px] bg-black text-white px-4 py-2 text-[14px]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onCancel} />
      <Card className="relative w-[400px]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold">Delete Lead</div>
          <div className="text-xs text-neutral-500 mt-1">Are you sure you want to delete this lead? This action cannot be undone.</div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="rounded-[10px] px-3 py-2 text-[14px] text-neutral-700 hover:bg-neutral-100">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-[10px] bg-rose-600 text-white px-4 py-2 text-[14px] hover:bg-rose-700">
            Delete
          </button>
        </div>
      </Card>
    </div>
  );
}
