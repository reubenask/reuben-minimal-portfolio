import { motion } from 'framer-motion';
import type { GraphNode } from './types';

const LINE_CENTER = 'rgba(34,211,238,0.34)';
const LINE_CHILD  = 'rgba(214,168,79,0.62)';
const DOT_COLOR   = '#8DF5EF';

interface ConnectorsProps {
  root: GraphNode;
  positions: Record<string, { x: number; y: number }>;
  centerX: number;
  centerY: number;
}

export function GraphConnectors({ root, positions }: ConnectorsProps) {
  const cp = positions[root.id];
  if (!cp) return null;

  return (
    <g>
      {(root.children ?? []).map((folder) => {
        const fp = positions[folder.id];
        if (!fp) return null;
        const visibleChildren = folder.collapsed ? [] : folder.children ?? [];

        return (
          <g key={folder.id}>
            {/* Center → Folder */}
            <motion.line
              x1={cp.x} y1={cp.y} x2={fp.x} y2={fp.y}
              stroke={LINE_CENTER} strokeWidth={1}
              strokeDasharray="4 7"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            />
            <circle cx={fp.x} cy={fp.y} r={3} fill="#8DF5EF" opacity={0.7} />

            {/* Folder → Children (curved lines, only when expanded) */}
            {visibleChildren.map((item, i) => {
              const ip = positions[item.id];
              if (!ip) return null;
              const mx = (fp.x + ip.x) / 2;
              const my = (fp.y + ip.y) / 2;
              const len = Math.hypot(ip.x - fp.x, ip.y - fp.y) || 1;
              const qx = mx - ((ip.y - fp.y) / len) * 18;
              const qy = my + ((ip.x - fp.x) / len) * 18;
              return (
                <g key={item.id}>
                  <motion.path
                    d={`M ${fp.x} ${fp.y} Q ${qx} ${qy} ${ip.x} ${ip.y}`}
                    stroke={LINE_CHILD} strokeWidth={1.1} fill="none"
                    strokeDasharray="3 6"
                    strokeLinecap="round" strokeOpacity={0.6}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                  />
                  <motion.circle cx={ip.x} cy={ip.y} r={3}
                    fill={DOT_COLOR} stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} opacity={0.65}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.65 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.06 + 0.2 }}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
