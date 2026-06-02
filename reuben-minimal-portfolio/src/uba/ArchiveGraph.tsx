import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GraphNode, SelectedNode, FileAttachment } from './types';
import { getInitialPositions } from './utils/layout';
import { CenterNode }      from './CenterNode';
import { FolderNode }      from './FolderNode';
import { ItemNode }        from './ItemNode';
import { GraphConnectors } from './GraphConnectors';

interface ArchiveGraphProps {
  graph: GraphNode;
  selected: SelectedNode | null;
  searchQuery: string;
  nodePositions: Record<string, { x: number; y: number }>;
  avatarUrl: string;
  onSelectNode: (node: GraphNode, parentId?: string) => void;
  onToggleFolder: (id: string) => void;
  onAddChild: (node: GraphNode) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onLabelSave: (id: string, newLabel: string) => void;
  onAvatarUpload: (dataUrl: string) => void;
  onAttachFile: (nodeId: string, file: FileAttachment) => void;
  isEditable: boolean;
}

const CANVAS_W = 1600;
const CANVAS_H = 1000;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;
const DRAG_THRESHOLD = 5;

export function ArchiveGraph({
  graph, selected, searchQuery,
  nodePositions, avatarUrl,
  onSelectNode, onToggleFolder, onAddChild,
  onNodeMove, onLabelSave, onAvatarUpload, onAttachFile,
  isEditable,
}: ArchiveGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale,  setScale]  = useState(0.82);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const panRef      = useRef<{ startMX: number; startMY: number; startOX: number; startOY: number } | null>(null);
  const nodeDragRef = useRef<{ id: string; startMX: number; startMY: number; startX: number; startY: number; moved: boolean } | null>(null);

  const layout = useMemo(() => getInitialPositions(graph, CX, CY), [graph]);
  const { positions: defaultPositions, childOffsets, parentMap } = layout;

  // Resolve a node's position:
  // 1. User-dragged override → use it directly
  // 2. Child whose parent folder was dragged → offset relative to parent's current position
  // 3. Default layout position
  function pos(id: string): { x: number; y: number } {
    if (nodePositions[id]) return nodePositions[id];
    const parentId = parentMap[id];
    if (parentId && nodePositions[parentId]) {
      const offset = childOffsets[id];
      const parentPos = nodePositions[parentId];
      if (offset) return { x: parentPos.x + offset.dx, y: parentPos.y + offset.dy };
    }
    return defaultPositions[id] ?? { x: CX, y: CY };
  }

  // ── Fit to view (includes child node positions) ────────────────────────
  const fitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Collect all currently visible node positions (folders + expanded children)
    const pts: { x: number; y: number }[] = [];
    pts.push(pos('center'));
    for (const folder of graph.children ?? []) {
      pts.push(pos(folder.id));
      if (!folder.collapsed) {
        for (const item of folder.children ?? []) pts.push(pos(item.id));
      }
    }

    if (!pts.length) return;
    const PAD = 120;
    const minX = Math.min(...pts.map(p => p.x)) - PAD;
    const maxX = Math.max(...pts.map(p => p.x)) + PAD;
    const minY = Math.min(...pts.map(p => p.y)) - PAD;
    const maxY = Math.max(...pts.map(p => p.y)) + PAD;
    const { width: vpW, height: vpH } = container.getBoundingClientRect();
    const newScale = Math.min(vpW / (maxX - minX), vpH / (maxY - minY), 1.0) * 0.88;
    setScale(newScale);
    setOffset({
      x: -(((minX + maxX) / 2) - CX) * newScale,
      y: -(((minY + maxY) / 2) - CY) * newScale,
    });
  // pos is defined above and stable — deps are what drive recalculation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPositions, nodePositions, graph]);

  // Auto-fit on mount
  useEffect(() => {
    const id = requestAnimationFrame(fitToView);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fit when a folder opens/closes
  const openFolderId = useMemo(
    () => (graph.children ?? []).find(f => !f.collapsed)?.id ?? null,
    [graph]
  );
  useEffect(() => {
    if (openFolderId !== null) {
      const id = setTimeout(fitToView, 80);
      return () => clearTimeout(id);
    }
  }, [openFolderId, fitToView]);

  // ── Zoom ──────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(2.2, Math.max(0.3, s - e.deltaY * 0.0012)));
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Drag ──────────────────────────────────────────────────────────────
  function startNodeDrag(e: React.MouseEvent, nodeId: string) {
    if (!isEditable) return;
    const { x, y } = pos(nodeId);
    nodeDragRef.current = { id: nodeId, startMX: e.clientX, startMY: e.clientY, startX: x, startY: y, moved: false };
    e.stopPropagation();
  }

  function onCanvasMouseDown(e: React.MouseEvent) {
    if (nodeDragRef.current) return;
    panRef.current = { startMX: e.clientX, startMY: e.clientY, startOX: offset.x, startOY: offset.y };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (nodeDragRef.current) {
      const d = nodeDragRef.current;
      const dx = (e.clientX - d.startMX) / scale;
      const dy = (e.clientY - d.startMY) / scale;
      if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) d.moved = true;
      if (d.moved) onNodeMove(d.id, d.startX + dx, d.startY + dy);
      return;
    }
    if (panRef.current) {
      const p = panRef.current;
      setOffset({ x: p.startOX + (e.clientX - p.startMX), y: p.startOY + (e.clientY - p.startMY) });
    }
  }

  function onMouseUp() { nodeDragRef.current = null; panRef.current = null; }

  const folders = graph.children ?? [];
  const resolvedPositions: Record<string, { x: number; y: number }> = {};
  const collectResolvedPositions = (node: GraphNode) => {
    resolvedPositions[node.id] = pos(node.id);
    node.children?.forEach(collectResolvedPositions);
  };
  collectResolvedPositions(graph);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100%',
        overflow: 'hidden', cursor: 'grab', userSelect: 'none',
        background: `
          radial-gradient(circle at 50% 43%, rgba(15,118,110,0.13), transparent 33%),
          radial-gradient(circle at 74% 64%, rgba(184,134,64,0.16), transparent 30%),
          linear-gradient(rgba(53,66,57,0.075) 1px, transparent 1px),
          linear-gradient(90deg, rgba(53,66,57,0.075) 1px, transparent 1px),
          #F4E9D4
        `,
        backgroundSize: 'auto, auto, 44px 44px, 44px 44px, auto',
      }}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}>
        <svg width={CANVAS_W} height={CANVAS_H} style={{ display: 'block', overflow: 'visible' }}>

          <GraphConnectors root={graph} positions={resolvedPositions} centerX={CX} centerY={CY} />

          <CenterNode
            node={graph}
            x={pos('center').x} y={pos('center').y}
            isSelected={selected?.node.id === 'center'}
            avatarUrl={avatarUrl}
            onClick={() => onSelectNode(graph)}
            onDragStart={(e) => startNodeDrag(e, 'center')}
            onAvatarUpload={onAvatarUpload}
            onAddFolder={() => onAddChild(graph)}
            isEditable={isEditable}
          />

          {folders.map((folder) => {
            const p = pos(folder.id);
            return (
              <FolderNode
                key={folder.id}
                node={folder}
                x={p.x} y={p.y}
                isSelected={selected?.node.id === folder.id}
                searchQuery={searchQuery}
                onClick={() => { onToggleFolder(folder.id); onSelectNode(folder); }}
                onAdd={() => onAddChild(folder)}
                onDragStart={(e) => startNodeDrag(e, folder.id)}
                onLabelSave={(label) => onLabelSave(folder.id, label)}
                onAttachFile={(file) => onAttachFile(folder.id, file)}
                isEditable={isEditable}
              />
            );
          })}

          {/* Child item nodes — appear when folder is expanded */}
          <AnimatePresence>
            {folders.flatMap((folder) =>
              !folder.collapsed
                ? (folder.children ?? []).map((item, i) => {
                    const p = pos(item.id);
                    return (
                      <ItemNode
                        key={item.id}
                        node={item}
                        x={p.x} y={p.y}
                        index={i}
                        isSelected={selected?.node.id === item.id}
                        searchQuery={searchQuery}
                        onClick={() => onSelectNode(item, folder.id)}
                        onDragStart={(e) => startNodeDrag(e, item.id)}
                        onLabelSave={(label) => onLabelSave(item.id, label)}
                        isEditable={isEditable}
                      />
                    );
                  })
                : []
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Interaction guide */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        border: '1px solid rgba(92,78,55,0.18)', background: 'rgba(255,250,241,0.82)',
        borderRadius: 18,
        padding: '12px 14px', boxShadow: '0 20px 60px rgba(83,65,38,0.16)',
        zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1,
        backdropFilter: 'blur(18px)',
      }}>
        {[
          '▶ Click folder to expand',
          ...(isEditable ? ['✎ Double-click to rename', '⊹ Drag nodes to reposition'] : ['◇ Select any node for details']),
          '◎ Scroll to zoom · Drag to pan',
        ].map((h) => (
          <p key={h} style={{ fontSize: 8, letterSpacing: '0.1em', color: '#766B5B',
            fontFamily: "'IBM Plex Mono', monospace", pointerEvents: 'none' }}>{h}</p>
        ))}
        <button onClick={fitToView} style={{
          marginTop: 5, padding: '3px 8px',
          border: '1px solid rgba(15,118,110,0.30)', borderRadius: 999,
          background: 'rgba(15,118,110,0.10)', color: '#0F5B55',
          fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer',
          boxShadow: '0 0 24px rgba(15,118,110,0.08)',
        }}>⊹ FIT TO VIEW</button>
      </div>

      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        fontSize: 9, color: '#756851', letterSpacing: '0.15em',
        fontFamily: "'IBM Plex Mono', monospace",
        border: '1px solid rgba(92,78,55,0.16)',
        borderRadius: 999,
        padding: '6px 10px',
        background: 'rgba(255,250,241,0.78)',
        backdropFilter: 'blur(14px)',
      }}>{Math.round(scale * 100)}%</div>
    </div>
  );
}
