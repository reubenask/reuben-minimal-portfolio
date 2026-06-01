import type { GraphNode } from '../types';

// ── Mind-map layout algorithm ──────────────────────────────────────────────
// Converts a folder's child tree into positioned items for rendering.
// Uses leaf-count weighting so siblings with large sub-trees get more space,
// preventing any overlap between items at the same level.

const LEVEL_W = 160; // horizontal distance per depth level
const SLOT_H  = 44;  // vertical space per leaf node

function countLeaves(node: GraphNode): number {
  const kids = node.children ?? [];
  if (!kids.length) return 1;
  return kids.reduce((s, k) => s + countLeaves(k), 0);
}

export interface MindItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  description?: string;
  files?: GraphNode['files'];
  x: number;
  y: number;
  parentX: number;
  parentY: number;
  depth: number;      // 1 = direct child of folder, 2 = grandchild …
  isLeaf: boolean;
  node: GraphNode;    // original node reference for selection / editing
}

export function computeMindMap(
  folder: GraphNode,
  fx: number, fy: number,   // folder anchor position
  cx: number, cy: number    // graph center (used for branch direction)
): MindItem[] {
  const children = folder.children ?? [];
  if (!children.length) return [];

  // ── Determine primary branch direction ────────────────────────────────
  // Snap to the nearest major axis so the tree is always axis-aligned and
  // easy to read.  |dx| vs |dy| decides horizontal vs vertical branching.
  const dx = fx - cx;
  const dy = fy - cy;
  let BX: number, BY: number, PX: number, PY: number;
  if (Math.abs(dx) >= Math.abs(dy)) {
    // Folder is left or right of center → tree grows horizontally
    BX = Math.sign(dx) || 1; BY = 0; PX = 0; PY = 1;
  } else {
    // Folder is above or below center → tree grows vertically
    BX = 0; BY = Math.sign(dy) || 1; PX = 1; PY = 0;
  }

  const totalLeaves = children.reduce((s, c) => s + countLeaves(c), 0);
  const items: MindItem[] = [];

  function place(
    node: GraphNode,
    depth: number,
    slotStart: number,   // which leaf-slot this subtree starts at (0-based)
    parentX: number,
    parentY: number
  ) {
    const leaves = countLeaves(node);
    // Center this node over its leaf span
    const slotCenter  = slotStart + leaves / 2 - 0.5;
    // Offset from the folder so the whole tree is centered on (fx, fy)
    const perpOffset  = slotCenter - (totalLeaves - 1) / 2;

    const x = fx + BX * LEVEL_W * depth + PX * SLOT_H * perpOffset;
    const y = fy + BY * LEVEL_W * depth + PY * SLOT_H * perpOffset;

    items.push({
      id: node.id, label: node.label, icon: node.icon, category: node.category,
      description: node.description, files: node.files,
      x, y, parentX, parentY, depth,
      isLeaf: !(node.children?.length),
      node,
    });

    let kidSlot = slotStart;
    for (const kid of node.children ?? []) {
      place(kid, depth + 1, kidSlot, x, y);
      kidSlot += countLeaves(kid);
    }
  }

  let slot = 0;
  for (const child of children) {
    place(child, 1, slot, fx, fy);
    slot += countLeaves(child);
  }

  return items;
}
