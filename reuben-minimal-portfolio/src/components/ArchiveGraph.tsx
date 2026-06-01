import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { ArchiveNode, NodePosition } from "../types/archive";
import { GraphNode } from "./GraphNode";

type ArchiveGraphProps = {
  archive: ArchiveNode;
  selectedNode?: ArchiveNode;
  search: string;
  onSelect: (node: ArchiveNode) => void;
  onAdd: (node: ArchiveNode) => void;
  onToggle: (nodeId: string) => void;
};

type VisibleNode = {
  node: ArchiveNode;
  position: NodePosition;
  parent?: ArchiveNode;
};

const folderPositions: Record<string, NodePosition> = {
  story: { x: 28, y: 40, size: 148 },
  education: { x: 50, y: 22, size: 150 },
  work: { x: 72, y: 40, size: 148 },
  research: { x: 72, y: 62, size: 148 },
  projects: { x: 28, y: 62, size: 164 },
  social: { x: 43, y: 80, size: 126 },
  profile: { x: 57, y: 80, size: 126 },
};

const childAngles: Record<string, number[]> = {
  story: [-168, -142, -116, 156, 132],
  education: [-132, -90, -48, -16, -164],
  work: [-26, 0, 26, 52, -52],
  research: [-28, 0, 28, 56, -56],
  projects: [154, 180, 206, 232, 128],
  social: [120, 90, 60, 150, 30],
  profile: [60, 90, 120, 30, 150],
};

function nodeMatchesQuery(node: ArchiveNode, query: string) {
  if (!query) return false;
  return [node.label, node.category, node.description, node.period]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(query));
}

function hasMatchingDescendant(node: ArchiveNode, query: string): boolean {
  if (!query) return false;
  return (node.children ?? []).some(
    (child) => nodeMatchesQuery(child, query) || hasMatchingDescendant(child, query),
  );
}

function buildVisibleNodes(archive: ArchiveNode, search: string): VisibleNode[] {
  const query = search.trim().toLowerCase();
  const nodes: VisibleNode[] = [
    { node: archive, position: { x: 50, y: 52, size: 150 } },
  ];

  archive.children?.forEach((folder) => {
    const folderPosition = folderPositions[folder.id] ?? {
      x: 50,
      y: 50,
      size: 130,
    };
    nodes.push({ node: folder, position: folderPosition, parent: archive });

    const revealForSearch = hasMatchingDescendant(folder, query);
    if (!folder.collapsed || revealForSearch) {
      const angles = childAngles[folder.id] ?? [0, 45, 90, 135, 180];
      const distance = folder.id === "education" ? 16 : 14;
      const children = query
        ? (folder.children ?? []).filter(
            (child) =>
              !folder.collapsed ||
              nodeMatchesQuery(child, query) ||
              hasMatchingDescendant(child, query),
          )
        : (folder.children ?? []);

      children.forEach((child, index) => {
        const angle = ((angles[index % angles.length] ?? 0) * Math.PI) / 180;
        nodes.push({
          node: child,
          parent: folder,
          position: {
            x: folderPosition.x + Math.cos(angle) * distance,
            y: folderPosition.y + Math.sin(angle) * distance,
            size: 66,
          },
        });
      });
    }
  });

  return nodes;
}

function matchesSearch(node: ArchiveNode, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return false;
  return [node.label, node.category, node.description, node.period]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(query));
}

export function ArchiveGraph({
  archive,
  selectedNode,
  search,
  onSelect,
  onAdd,
  onToggle,
}: ArchiveGraphProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const visibleNodes = useMemo(() => buildVisibleNodes(archive, search), [
    archive,
    search,
  ]);
  const visibleIds = new Set(visibleNodes.map(({ node }) => node.id));
  const links = visibleNodes
    .filter(({ parent }) => parent && visibleIds.has(parent.id))
    .map(({ node, parent, position }) => {
      const parentPosition = visibleNodes.find((item) => item.node.id === parent?.id)
        ?.position;
      return parentPosition
        ? { id: `${parent?.id}-${node.id}`, from: parentPosition, to: position }
        : null;
    })
    .filter(Boolean) as Array<{
    id: string;
    from: NodePosition;
    to: NodePosition;
  }>;

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, select")) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    setPan({
      x: dragState.current.originX + event.clientX - dragState.current.startX,
      y: dragState.current.originY + event.clientY - dragState.current.startY,
    });
  };

  const endDrag = () => {
    dragState.current.active = false;
  };

  const zoomCanvas = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.06 : 0.06;
    setZoom((current) => Math.min(1.28, Math.max(0.74, current + direction)));
  };

  return (
    <main className="relative h-full min-h-[760px] flex-1 overflow-hidden pl-20">
      <div
        className="absolute bottom-0 left-20 right-[430px] top-0 overflow-hidden max-xl:right-[390px] max-lg:right-6"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={zoomCanvas}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,.08),transparent_26%),radial-gradient(circle_at_70%_70%,rgba(251,191,36,.05),transparent_24%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:56px_56px]" />

        <motion.div
          className="absolute inset-0"
          style={{ x: pan.x, y: pan.y, scale: zoom }}
        >
          <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/5" />
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/5" />
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/5" />

          <svg className="absolute inset-0 h-full w-full">
            <AnimatePresence>
              {links.map((link, index) => (
                <motion.line
                  key={link.id}
                  x1={`${link.from.x}%`}
                  y1={`${link.from.y}%`}
                  x2={`${link.to.x}%`}
                  y2={`${link.to.y}%`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.42, delay: index * 0.025 }}
                  stroke={
                    index % 3 === 0
                      ? "rgba(34,211,238,.5)"
                      : "rgba(251,191,36,.32)"
                  }
                  strokeWidth="1"
                  strokeDasharray="3 7"
                />
              ))}
            </AnimatePresence>
          </svg>

          <div className="absolute inset-0">
            <AnimatePresence>
              {visibleNodes.map(({ node, position }) => (
                <GraphNode
                  key={node.id}
                  node={node}
                  position={position}
                  isSelected={selectedNode?.id === node.id}
                  isMatch={matchesSearch(node, search)}
                  onSelect={onSelect}
                  onAdd={onAdd}
                  onToggle={(target) => onToggle(target.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <button
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1);
          }}
          className="absolute bottom-7 right-7 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-slate-400 backdrop-blur-xl transition hover:border-cyan-300/40 hover:text-cyan-100"
        >
          Reset view {Math.round(zoom * 100)}%
        </button>
      </div>

      <div className="absolute bottom-7 left-28 rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-slate-400 backdrop-blur-xl">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Interaction model
        </p>
        <div className="grid gap-4 text-xs sm:grid-cols-4">
          <span>Click folder to expand</span>
          <span>Add child nodes</span>
          <span>Drag empty space</span>
          <span>Scroll to zoom</span>
        </div>
      </div>
    </main>
  );
}
