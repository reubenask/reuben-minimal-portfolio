/* eslint-disable react-hooks/set-state-in-effect, react-hooks/static-components */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { GraphNode } from './types';

const ITEM_BG: Record<string, string> = {
  story:     '#183B2A', education: '#0B4A46', work:      '#123A52',
  research:  '#2F256C', projects:  '#4A3216', social:    '#4A1F31',
  profile:   '#313C17',
};
function itemBg(cat: string) { return ITEM_BG[cat] ?? '#0A1514'; }

function getIcon(name: string): React.FC<{ size?: number; color?: string; strokeWidth?: number }> {
  const key = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons;
  return (LucideIcons[key] as React.FC<{ size?: number; color?: string; strokeWidth?: number }>) ?? LucideIcons.Circle;
}

interface ItemNodeProps {
  node: GraphNode;
  x: number; y: number;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onLabelSave: (newLabel: string) => void;
  searchQuery: string;
  isEditable: boolean;
}

export function ItemNode({ node, x, y, index, isSelected, onClick, onDragStart, onLabelSave, searchQuery, isEditable }: ItemNodeProps) {
  const weight = node.weight ?? 0.85;
  // Clearly varying sizes: 28–50px radius
  const r    = Math.round(14 + weight * 28);
  const bg   = itemBg(node.category);
  const Icon = getIcon(node.icon);
  const isHighlighted = searchQuery.length > 0 && node.label.toLowerCase().includes(searchQuery.toLowerCase());

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!editing) setDraft(node.label); }, [node.label, editing]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  function commit() { setEditing(false); onLabelSave(draft); }

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{ duration: 0.35, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.24 }}
      style={{ cursor: isEditable ? 'grab' : 'pointer', transformBox: 'fill-box', transformOrigin: 'center' }}
      onMouseDown={(e) => { if (!editing) { e.stopPropagation(); if (isEditable) onDragStart(e); } }}
      onClick={(e) => { if (!editing) { e.stopPropagation(); onClick(); } }}
      onDoubleClick={(e) => { e.stopPropagation(); if (isEditable) setEditing(true); }}
    >
      {/* Offset shadow */}
      <circle cx={x + 2} cy={y + 2.5} r={r}
        fill="rgba(0,0,0,0.32)" />

      {/* Selection dashed ring */}
      {isSelected && (
        <motion.circle cx={x} cy={y} r={r + 5} fill="none"
          stroke="#22D3EE" strokeWidth={1.5} strokeDasharray="4 3"
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} />
      )}
      {isHighlighted && (
        <circle cx={x} cy={y} r={r + 5} fill="none"
          stroke="#B7893E" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
      )}

      {/* Circle body */}
      <circle cx={x} cy={y} r={r}
        fill={bg}
        stroke="rgba(255,255,255,0.16)" strokeWidth={1.2} />

      {/* Icon */}
      <foreignObject x={x - r * 0.6} y={y - r * 0.6} width={r * 1.2} height={r * 1.2}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={Math.max(10, Math.round(r * 0.5))} color="#8DF5EF" strokeWidth={1.5} />
        </div>
      </foreignObject>

      {/* Label / inline editor */}
      {editing ? (
        <foreignObject x={x - 55} y={y + r + 2} width={110} height={22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(node.label); } }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '100%', padding: '1px 5px',
                background: '#0F1F1D', border: '1px solid rgba(34,211,238,0.32)',
                borderRadius: 8, fontSize: 8, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textAlign: 'center',
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#EAFBF8', outline: 'none',
              }}
            />
          </div>
        </foreignObject>
      ) : (
        <foreignObject x={x - 62} y={y + r + 5} width={124} height={32} style={{ overflow: 'visible', pointerEvents: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 19, padding: '3px 7px',
            borderRadius: 999,
            border: '1px solid rgba(92,78,55,0.12)',
            background: 'rgba(255,250,241,0.78)',
            boxShadow: '0 8px 20px rgba(83,65,38,0.10)',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              color: '#263A34',
              fontSize: 8,
              lineHeight: 1.12,
              letterSpacing: '0.09em',
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              textAlign: 'center',
              textTransform: 'uppercase',
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
            }}>
              {node.label}
            </span>
          </div>
        </foreignObject>
      )}
    </motion.g>
  );
}
