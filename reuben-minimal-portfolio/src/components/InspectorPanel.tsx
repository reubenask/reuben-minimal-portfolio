import {
  CalendarDays,
  ChevronDown,
  ChevronsRight,
  Layers3,
  Network,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ArchiveNode } from "../types/archive";

type InspectorPanelProps = {
  node?: ArchiveNode;
  onAdd: (node: ArchiveNode) => void;
  onToggle: (nodeId: string) => void;
  onSelect: (node: ArchiveNode) => void;
  onEdit: (node: ArchiveNode) => void;
  onClose: () => void;
};

export function InspectorPanel({
  node,
  onAdd,
  onToggle,
  onSelect,
  onEdit,
  onClose,
}: InspectorPanelProps) {
  const [detailsNodeId, setDetailsNodeId] = useState<string | null>(null);

  if (!node) return null;

  const childCount = node.children?.length ?? 0;
  const isFolder = node.type === "folder";
  const detailsOpen = detailsNodeId === node.id;

  return (
    <aside className="fixed bottom-8 right-8 top-24 z-30 w-[370px] rounded-[28px] border border-white/10 bg-slate-950/45 p-6 text-slate-200 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <button
        onClick={onClose}
        className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:text-slate-100"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
        {node.type === "folder" ? "Folder" : node.type === "center" ? "Identity" : "Archive Item"}
      </p>
      <h2 className="mt-4 max-w-[14ch] text-2xl font-semibold tracking-[-.03em] text-slate-100">
        {node.label}
      </h2>
      <p className="mt-5 text-sm leading-7 text-slate-400">
        {node.description ?? "No description yet."}
      </p>

      {detailsOpen && (
        <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4 text-sm leading-6 text-slate-300">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Detail view
          </p>
          <p className="mt-3">
            {node.description ??
              "This node is ready for a deeper portfolio case note, gallery, measured impact, and supporting files."}
          </p>
          <p className="mt-3 text-slate-500">
            Future database hook: node id <span className="text-slate-300">{node.id}</span>.
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
        <Metric icon={Layers3} label="Items" value={String(childCount)} />
        <Metric icon={Network} label="Connections" value={String(childCount + 1)} />
        <Metric icon={CalendarDays} label="Period" value={node.period ?? "Open"} />
      </div>

      {isFolder && (
        <div className="mt-7">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Child nodes
          </p>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {node.children?.slice(0, 4).map((child) => (
              <button
                type="button"
                key={child.id}
                onClick={() => onSelect(child)}
                className="flex w-full items-center justify-between border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.04]"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-100">{child.label}</p>
                  <p className="text-xs text-slate-500">{child.category}</p>
                </div>
                <ChevronsRight className="h-4 w-4 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        <button
          onClick={() =>
            setDetailsNodeId((current) => (current === node.id ? null : node.id))
          }
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/40"
        >
          View Details
        </button>
        <button
          onClick={() => onAdd(node)}
          className="flex items-center gap-3 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-left text-sm text-cyan-100 transition hover:border-cyan-200/60"
        >
          <Plus className="h-4 w-4" /> Add Child Node
        </button>
        <button
          onClick={() => onEdit(node)}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-300"
        >
          <Pencil className="h-4 w-4" /> Edit Node
        </button>
        {isFolder && (
          <button
            onClick={() => onToggle(node.id)}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-300"
          >
            <ChevronDown className="h-4 w-4" />
            {node.collapsed ? "Expand" : "Collapse"}
          </button>
        )}
      </div>
    </aside>
  );
}

type MetricProps = {
  icon: typeof Layers3;
  label: string;
  value: string;
};

function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <div>
      <Icon className="mb-2 h-5 w-5 text-slate-400" />
      <p className="text-sm font-semibold text-slate-100">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}
