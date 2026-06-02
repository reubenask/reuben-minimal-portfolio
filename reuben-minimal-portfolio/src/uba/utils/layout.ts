import type { GraphNode } from '../types';

// ── Radial position of the 7 primary folders ──────────────────────────────
const FOLDER_ANGLES: Record<string, number> = {
  story:     210,
  education: 320,
  work:       35,
  research:  120,
  projects:  155,
  social:    250,
  profile:    65,
};

const FOLDER_RADIUS = 330; // center → folder distance

// Mind-map tree branching constants
const BRANCH_LEN   = 235; // folder → children spine distance
const CHILD_GAP    = 98;  // perpendicular gap between siblings

function toRad(deg: number) { return (deg * Math.PI) / 180; }

export interface LayoutResult {
  positions:  Record<string, { x: number; y: number }>;
  // Relative offset of each child from its parent folder's default position.
  // Used to recompute child positions when a folder is dragged to a new spot.
  childOffsets: Record<string, { dx: number; dy: number }>;
  // Maps childId → folderId so ArchiveGraph can look up a child's parent.
  parentMap: Record<string, string>;
}

export function getInitialPositions(
  root: GraphNode,
  cx: number,
  cy: number
): LayoutResult {
  const positions:  Record<string, { x: number; y: number }> = {};
  const childOffsets: Record<string, { dx: number; dy: number }> = {};
  const parentMap:  Record<string, string> = {};

  positions[root.id] = { x: cx, y: cy };

  for (const folder of root.children ?? []) {
    const angleDeg = FOLDER_ANGLES[folder.id] ?? 0;
    const angleRad = toRad(angleDeg);

    const fx = cx + FOLDER_RADIUS * Math.cos(angleRad);
    const fy = cy + FOLDER_RADIUS * Math.sin(angleRad);
    positions[folder.id] = { x: fx, y: fy };

    const branchX = Math.cos(angleRad);
    const branchY = Math.sin(angleRad);
    const perpX   = -branchY;
    const perpY   =  branchX;

    const children = folder.children ?? [];
    const n = children.length;
    const totalSpan = (n - 1) * CHILD_GAP;

    children.forEach((item, i) => {
      const perpOffset = i * CHILD_GAP - totalSpan / 2;
      const arcPush = Math.abs(perpOffset) * 0.16;
      const childX = fx + branchX * (BRANCH_LEN + arcPush) + perpX * perpOffset;
      const childY = fy + branchY * (BRANCH_LEN + arcPush) + perpY * perpOffset;
      positions[item.id]    = { x: childX, y: childY };
      childOffsets[item.id] = { dx: childX - fx, dy: childY - fy };
      parentMap[item.id]    = folder.id;
    });
  }

  return { positions, childOffsets, parentMap };
}
