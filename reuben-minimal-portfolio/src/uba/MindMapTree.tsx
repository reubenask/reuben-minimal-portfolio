/* eslint-disable react-hooks/static-components */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { computeMindMap, type MindItem } from './utils/mindmapLayout';
import type { GraphNode } from './types';

// ── Per-category pill colours ─────────────────────────────────────────────
const CAT_STYLE: Record<string, { fill: string; border: string; text: string; selFill: string }> = {
  story:     { fill: '#EDE5C8', border: '#4F7C6B', text: '#3D3828', selFill: '#4F7C6B' },
  education: { fill: '#DFF0E4', border: '#115E59', text: '#1E3020', selFill: '#115E59' },
  work:      { fill: '#E2E6F2', border: '#404E7C', text: '#202848', selFill: '#404E7C' },
  research:  { fill: '#DCEFE6', border: '#22D3EE', text: '#183A28', selFill: '#22D3EE' },
  projects:  { fill: '#EBE6F2', border: '#665588', text: '#302244', selFill: '#665588' },
  social:    { fill: '#E4F0E8', border: '#507A60', text: '#243830', selFill: '#507A60' },
  profile:   { fill: '#F0E8DF', border: '#7A5C48', text: '#3A2818', selFill: '#7A5C48' },
};
const DEFAULT_STYLE = { fill: '#0A1514', border: 'rgba(148,163,184,0.22)', text: '#EAFBF8', selFill: '#115E59' };
const sty = (cat: string) => CAT_STYLE[cat] ?? DEFAULT_STYLE;

// ── Icon resolver ─────────────────────────────────────────────────────────
function getIcon(name: string): React.FC<{ size?: number; color?: string; strokeWidth?: number }> | null {
  const key = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons;
  const Comp = LucideIcons[key] as React.FC<{ size?: number; color?: string; strokeWidth?: number }> | undefined;
  return Comp ?? null;
}

// ── Pill dimensions ───────────────────────────────────────────────────────
const PILL_H    = 28;
const PILL_MINW = 96;
const CHAR_W    = 6.4;
const ICON_W    = 18;
const PAD_H     = 14;
const MAX_LABEL = 20;

function pillWidth(label: string): number {
  const chars = Math.min(label.length, MAX_LABEL);
  return Math.max(PILL_MINW, chars * CHAR_W + ICON_W + PAD_H * 2);
}

// ── Connector path (smooth elbow) ─────────────────────────────────────────
function elbowPath(px: number, py: number, cx: number, cy: number): string {
  const mx = (px + cx) / 2;
  return `M ${px} ${py} C ${mx} ${py} ${mx} ${cy} ${cx} ${cy}`;
}

// ── Main component ────────────────────────────────────────────────────────
interface MindMapTreeProps {
  folder: GraphNode;
  folderX: number; folderY: number;
  graphCX: number; graphCY: number;
  selectedId?: string;
  onSelect: (node: GraphNode) => void;
}

export function MindMapTree({ folder, folderX, folderY, graphCX, graphCY, selectedId, onSelect }: MindMapTreeProps) {
  const items = computeMindMap(folder, folderX, folderY, graphCX, graphCY);
  if (!items.length) return null;

  return (
    <g>
      {/* Connectors first (behind pills) */}
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.path
            key={`c-${item.id}`}
            d={elbowPath(item.parentX, item.parentY, item.x, item.y)}
            stroke={sty(item.category).border}
            strokeWidth={1.2}
            strokeOpacity={0.5}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          />
        ))}
      </AnimatePresence>

      {/* Pill items */}
      <AnimatePresence>
        {items.map((item, i) => (
          <PillItem
            key={item.id}
            item={item}
            index={i}
            isSelected={selectedId === item.id}
            onClick={() => onSelect(item.node)}
          />
        ))}
      </AnimatePresence>
    </g>
  );
}

// ── Individual pill item ──────────────────────────────────────────────────
function PillItem({ item, index, isSelected, onClick }: {
  item: MindItem; index: number; isSelected: boolean; onClick: () => void;
}) {
  const { fill, border, text, selFill } = sty(item.category);
  const displayLabel = item.label.length > MAX_LABEL ? item.label.slice(0, MAX_LABEL - 1) + '…' : item.label;
  const w  = pillWidth(item.label);
  const hw = w / 2;
  const hh = PILL_H / 2;
  const R  = hh;           // fully rounded ends (capsule)
  const Icon = getIcon(item.icon);
  const fileCount = item.files?.length ?? 0;

  // Depth-based size: slightly smaller at deeper levels
  const scale = item.depth === 1 ? 1.0 : item.depth === 2 ? 0.92 : 0.85;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale }}
      exit={{ opacity: 0, scale: 0.4 }}
      whileHover={{ scale: (scale * 1.1) }}
      transition={{ duration: 0.28, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
      style={{ cursor: 'pointer', transformBox: 'fill-box', transformOrigin: 'center' }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Offset shadow */}
      <rect x={item.x - hw + 2} y={item.y - hh + 2.5}
        width={w} height={PILL_H} rx={R}
        fill="rgba(0,0,0,0.14)" />

      {/* Pill body */}
      <rect x={item.x - hw} y={item.y - hh}
        width={w} height={PILL_H} rx={R}
        fill={isSelected ? selFill : fill}
        stroke={border} strokeWidth={isSelected ? 2 : 1.5} />

      {/* Icon */}
      {Icon && (
        <foreignObject
          x={item.x - hw + 8} y={item.y - 7}
          width={14} height={14}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%' }}>
            <Icon size={9} color={isSelected ? '#0F1F1D' : border} strokeWidth={2} />
          </div>
        </foreignObject>
      )}

      {/* Label text */}
      <text
        x={item.x - hw + (Icon ? 22 : PAD_H)}
        y={item.y + 3.5}
        fill={isSelected ? '#0F1F1D' : text}
        fontSize={8.5}
        fontWeight={600}
        letterSpacing="0.07em"
        fontFamily="'IBM Plex Mono', monospace"
      >
        {displayLabel}
      </text>

      {/* File attachment badge */}
      {fileCount > 0 && (
        <g>
          <rect x={item.x + hw - 18} y={item.y - hh - 6}
            width={16} height={12} rx={3}
            fill="#D6A84F" stroke="rgba(148,163,184,0.22)" strokeWidth={1} />
          <text x={item.x + hw - 10} y={item.y - hh + 2}
            textAnchor="middle" fontSize={7} fontWeight={700}
            fill="rgba(148,163,184,0.22)" fontFamily="monospace">
            {fileCount}
          </text>
        </g>
      )}

      {/* Dot indicator for non-leaf nodes (has children) */}
      {!item.isLeaf && (
        <circle cx={item.x + hw - 8} cy={item.y}
          r={3} fill={border} opacity={0.45} />
      )}
    </motion.g>
  );
}
