import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ArchiveNode, NodePosition } from "../types/archive";
import { iconLookup } from "./icons";

type GraphNodeProps = {
  node: ArchiveNode;
  position: NodePosition;
  isSelected: boolean;
  isMatch: boolean;
  onSelect: (node: ArchiveNode) => void;
  onAdd: (node: ArchiveNode) => void;
  onToggle: (node: ArchiveNode) => void;
};

export function GraphNode({
  node,
  position,
  isSelected,
  isMatch,
  onSelect,
  onAdd,
  onToggle,
}: GraphNodeProps) {
  const Icon = iconLookup[node.icon] ?? iconLookup.folder;
  const isCenter = node.type === "center";
  const isFolder = node.type === "folder";
  const isItem = node.type === "item";

  const style = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: position.size,
    height: position.size,
  };

  const handleClick = () => {
    onSelect(node);
    if (isFolder) onToggle(node);
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.82, x: "-50%", y: "-50%" }}
      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
      exit={{ opacity: 0, scale: 0.74, x: "-50%", y: "-50%" }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      onClick={handleClick}
      className={[
        "group absolute z-10 flex flex-col items-center justify-center text-center",
        "border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/30 backdrop-blur-xl",
        "transition hover:border-cyan-300/60 hover:shadow-[0_0_32px_rgba(34,211,238,.18)]",
        isCenter ? "rounded-full border-cyan-300/50" : "",
        isFolder ? "rounded-[28px]" : "rounded-full",
        isItem ? "border-white/20 bg-white/[0.055]" : "",
        isSelected ? "ring-1 ring-cyan-200/70" : "",
        isMatch ? "outline outline-1 outline-amber-300/70" : "",
      ].join(" ")}
    >
      {isFolder && <FolderShape active={isSelected || isMatch} nodeId={node.id} />}

      <div
        className={[
          "relative z-10 grid place-items-center",
          isCenter ? "mb-3 h-20 w-20 rounded-full" : "",
          isItem ? "mb-2 h-12 w-12 rounded-full" : "mb-2",
        ].join(" ")}
      >
        {isCenter ? (
          <img
            src="/assets/hero.png"
            alt=""
            className="h-full w-full rounded-full object-cover grayscale"
          />
        ) : node.image ? (
          <img
            src={node.image}
            alt=""
            className="h-full w-full rounded-full border border-white/10 object-cover"
          />
        ) : (
          <Icon
            className={[
              "text-slate-100",
              isFolder ? "h-8 w-8" : "h-5 w-5",
              isItem ? "text-cyan-100" : "",
            ].join(" ")}
          />
        )}
      </div>

      <span className="relative z-10 max-w-[12ch] text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
        {node.category}
      </span>
      <span
        className={[
          "relative z-10 mt-1 max-w-[14ch] font-semibold leading-tight text-slate-100",
          isCenter ? "text-[13px] tracking-[0.28em]" : "text-sm",
          isItem ? "text-xs" : "",
        ].join(" ")}
      >
        {node.label}
      </span>

      {isFolder && (
        <span className="relative z-10 mt-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
          {node.children?.length ?? 0} items
        </span>
      )}

      {isFolder && (
        <span
          onClick={(event) => {
            event.stopPropagation();
            onAdd(node);
          }}
          className="absolute -right-2 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-slate-950/80 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-100"
        >
          <Plus className="h-4 w-4" />
        </span>
      )}
    </motion.button>
  );
}

function FolderShape({ active, nodeId }: { active: boolean; nodeId: string }) {
  const tone =
    nodeId === "projects"
      ? "from-amber-200/45 to-amber-300/5 shadow-[0_0_26px_rgba(251,191,36,.16)]"
      : nodeId === "research"
        ? "from-violet-300/35 to-cyan-300/5 shadow-[0_0_26px_rgba(167,139,250,.14)]"
        : nodeId === "story"
          ? "from-emerald-200/35 to-cyan-300/5 shadow-[0_0_26px_rgba(110,231,183,.12)]"
          : "from-cyan-300/30 to-cyan-300/5 shadow-[0_0_24px_rgba(34,211,238,.12)]";

  return (
    <span
      className={[
        "absolute inset-x-5 top-3 h-[46%] rounded-t-[20px] border border-white/10",
        "bg-gradient-to-b",
        tone,
        active ? "from-cyan-200/45 shadow-[0_0_34px_rgba(34,211,238,.24)]" : "",
      ].join(" ")}
    >
      <span className="absolute left-5 top-[-11px] h-5 w-14 rounded-t-xl bg-cyan-200/55" />
      <span className="absolute inset-x-0 bottom-[-18px] h-9 rounded-b-[18px] bg-gradient-to-b from-cyan-400/25 to-transparent" />
    </span>
  );
}
