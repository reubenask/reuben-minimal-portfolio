import { useState, useCallback, useEffect } from 'react';
import type { GraphNode, SelectedNode, FileAttachment } from '../types';
import { initialGraphData } from '../data/graphData';

const STORAGE_KEY    = 'uba_graph_state';
const POSITIONS_KEY  = 'uba_node_positions';
const AVATAR_KEY     = 'uba_avatar';

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

function findAndUpdate(node: GraphNode, id: string, fn: (n: GraphNode) => GraphNode): GraphNode {
  if (node.id === id) return fn(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map((c) => findAndUpdate(c, id, fn)) };
}

function findNode(node: GraphNode, id: string): GraphNode | null {
  if (node.id === id) return node;
  for (const c of node.children ?? []) { const f = findNode(c, id); if (f) return f; }
  return null;
}

function loadSaved(): GraphNode {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return deepClone(initialGraphData);
}
function loadPositions(): Record<string, { x: number; y: number }> {
  try { const r = localStorage.getItem(POSITIONS_KEY); if (r) return JSON.parse(r); } catch { /* */ }
  return {};
}

export function useGraph() {
  const [graph, setGraph]             = useState<GraphNode>(loadSaved);
  const [selected, setSelected]       = useState<SelectedNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(loadPositions);
  const [avatarUrl, setAvatarUrlState]    = useState<string>(() => localStorage.getItem(AVATAR_KEY) ?? '');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(graph)); }, [graph]);
  useEffect(() => { localStorage.setItem(POSITIONS_KEY, JSON.stringify(nodePositions)); }, [nodePositions]);

  const toggleFolder = useCallback((id: string) => {
    setGraph((prev) => {
      const target = findNode(prev, id);
      const isCurrentlyOpen = target ? !target.collapsed : false;

      const collapseAll = (node: GraphNode): GraphNode => ({
        ...node,
        collapsed: node.type === 'folder' ? true : node.collapsed,
        children: node.children?.map(collapseAll),
      });

      const withAllClosed = collapseAll(prev);

      if (isCurrentlyOpen) {
        return withAllClosed;
      } else {
        // Opening a folder → clear any stale saved positions for its children
        // so they recompute relative to the folder's current position
        const folder = findNode(prev, id);
        if (folder?.children?.length) {
          const childIds = new Set(folder.children.map(c => c.id));
          setNodePositions(pos => {
            const next = { ...pos };
            childIds.forEach(cid => delete next[cid]);
            return next;
          });
        }
        return findAndUpdate(withAllClosed, id, (n) => ({ ...n, collapsed: false }));
      }
    });
  }, []);

  const selectNode = useCallback((node: GraphNode, parentId?: string) => {
    setSelected((prev) =>
      prev?.node.id === node.id && prev?.parentId === parentId ? null : { node, parentId }
    );
  }, []);

  const clearSelection = useCallback(() => setSelected(null), []);

  const setNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodePositions((prev) => ({ ...prev, [id]: { x, y } }));
  }, []);

  // Update a node's label (or any other field patch)
  const updateNodeLabel = useCallback((id: string, newLabel: string) => {
    setGraph((prev) => findAndUpdate(prev, id, (n) => ({ ...n, label: newLabel.trim() || n.label })));
    // Keep selected in sync
    setSelected((prev) => {
      if (!prev || prev.node.id !== id) return prev;
      return { ...prev, node: { ...prev.node, label: newLabel.trim() || prev.node.label } };
    });
  }, []);

  const setAvatarUrl = useCallback((url: string) => {
    setAvatarUrlState(url);
    localStorage.setItem(AVATAR_KEY, url);
  }, []);

  const addChildNode = useCallback(
    (parentId: string, newNode: Omit<GraphNode, 'id' | 'type' | 'collapsed'>) => {
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const parent = findNode(graph, parentId);
      const type: GraphNode['type'] = parent?.type === 'center' ? 'folder' : 'item';
      const child: GraphNode = { ...newNode, id, type, collapsed: true, children: [], weight: newNode.weight ?? 0.85 };
      setGraph((prev) =>
        findAndUpdate(prev, parentId, (n) => ({ ...n, children: [...(n.children ?? []), child], collapsed: false }))
      );
      setSelected({ node: child, parentId });
    },
    [graph]
  );

  const selectedNode: SelectedNode | null = selected
    ? (() => { const f = findNode(graph, selected.node.id); return f ? { node: f, parentId: selected.parentId } : null; })()
    : null;

  // Attach a file to a node (metadata only — file data lives in memory/session)
  // In production: upload to storage API here, store the returned URL instead
  const attachFile = useCallback((nodeId: string, file: FileAttachment) => {
    setGraph((prev) =>
      findAndUpdate(prev, nodeId, (n) => ({
        ...n,
        files: [...(n.files ?? []), file],
      }))
    );
  }, []);

  const detachFile = useCallback((nodeId: string, fileId: string) => {
    setGraph((prev) =>
      findAndUpdate(prev, nodeId, (n) => ({
        ...n,
        files: (n.files ?? []).filter(f => f.id !== fileId),
      }))
    );
  }, []);

  return {
    graph, selected: selectedNode, searchQuery, setSearchQuery,
    toggleFolder, selectNode, clearSelection,
    addChildNode, updateNodeLabel,
    nodePositions, setNodePosition,
    avatarUrl, setAvatarUrl,
    attachFile, detachFile,
  };
}
