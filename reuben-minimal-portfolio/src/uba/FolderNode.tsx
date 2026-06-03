/* eslint-disable react-hooks/set-state-in-effect, react-hooks/static-components */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { GraphNode, FileAttachment } from './types';

const FOLDER_BG: Record<string, string> = {
  story: '#5E8B6E', education: '#0F8F88', work: '#2A6F97',
  research: '#6D5BD0', projects: '#B47A32', social: '#B85C7A', profile: '#6B7D3A',
};
function folderBg(cat: string) { return FOLDER_BG[cat] ?? '#0F766E'; }

function folderDims(weight: number) {
  return { w: Math.round(130 + weight * 22), h: Math.round(86 + weight * 14) };
}

function getIcon(name: string): React.FC<{ size?: number; color?: string; strokeWidth?: number }> {
  const key = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons;
  return (LucideIcons[key] as React.FC<{ size?: number; color?: string; strokeWidth?: number }>) ?? LucideIcons.Folder;
}

interface FolderNodeProps {
  node: GraphNode;
  x: number; y: number;
  isSelected: boolean;
  onClick: () => void;
  onAdd?: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onLabelSave: (newLabel: string) => void;
  onAttachFile: (file: FileAttachment) => void;
  searchQuery: string;
  isEditable: boolean;
}

export function FolderNode({ node, x, y, isSelected, onClick, onDragStart, onLabelSave, onAttachFile, searchQuery, isEditable }: FolderNodeProps) {
  const weight = node.weight ?? 1.6;
  const { w, h } = folderDims(weight);
  const halfW = w / 2, halfH = h / 2;
  const bg   = folderBg(node.category);
  const Icon = getIcon(node.icon);
  const childCount = node.children?.length ?? 0;
  const fileCount  = node.files?.length ?? 0;
  const isHighlighted = searchQuery.length > 0 && node.label.toLowerCase().includes(searchQuery.toLowerCase());

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(node.label);
  const inputRef  = useRef<HTMLInputElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(node.label); }, [node.label, editing]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function commit() { setEditing(false); onLabelSave(draft); }

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach(f => {
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        name: f.name,
        type: f.type,
        size: f.size,
      };
      onAttachFile(attachment);
    });
    e.target.value = '';
  }

  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      // Hover magnifier: scale up from the node's own center
      whileHover={{ scale: 1.22, filter: 'drop-shadow(0 24px 34px rgba(0,0,0,0.24))' }}
      style={{ cursor: 'grab', transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <foreignObject
        x={x - halfW} y={y - halfH - 12}
        width={w + 8} height={h + 36}
        style={{ overflow: 'visible' }}
        onPointerDown={(e) => { e.stopPropagation(); onDragStart(e); }}
        onClick={(e) => { if (!editing) { e.stopPropagation(); onClick(); } }}
        onDoubleClick={(e) => { e.stopPropagation(); if (isEditable) setEditing(true); }}
      >
        <div style={{ position: 'relative', userSelect: 'none', width: `${w}px` }}>
          {/* Tab */}
          <div style={{
            position: 'absolute', top: 0, left: 8,
            width: Math.round(w * 0.40), height: 14,
            borderRadius: '10px 10px 0 0',
            background: bg, border: '1px solid rgba(255,255,255,0.16)', borderBottom: 'none',
          }} />

          {/* Card body */}
          <div style={{
            marginTop: 12, width: `${w}px`, height: `${h}px`,
            borderRadius: '0 16px 16px 16px',
            background: isSelected ? 'linear-gradient(145deg, rgba(34,211,238,0.26), rgba(15,118,110,0.72))' : isHighlighted ? 'linear-gradient(145deg, rgba(214,168,79,0.28), rgba(62,117,99,0.80))' : `linear-gradient(145deg, ${bg}, rgba(7,18,17,0.88))`,
            border: `1px solid rgba(255,255,255,0.14)`,
            boxShadow: isSelected ? `0 0 42px rgba(34,211,238,0.18), 0 24px 60px rgba(0,0,0,0.35)` : `0 20px 54px rgba(0,0,0,0.30)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '10px 8px 8px',
            position: 'relative',
            outline: isSelected ? '1px solid rgba(34,211,238,0.56)' : 'none', outlineOffset: 4,
            transition: 'background 0.15s',
          }}>
            {/* Icon */}
            <div style={{
              width: Math.round(28 + weight * 3), height: Math.round(28 + weight * 3),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 10,
            }}>
              <Icon size={Math.round(13 + weight * 1.5)} color="#EAFBF8" strokeWidth={1.8} />
            </div>

            {/* Label / edit */}
            {editing ? (
              <input ref={inputRef} value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(node.label); } }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: `${w - 20}px`, padding: '2px 5px',
                  background: 'rgba(4,12,11,0.88)', border: '1px solid rgba(34,211,238,0.32)',
                  borderRadius: 2, fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace",
                  color: '#EAFBF8', outline: 'none',
                }}
              />
            ) : (
              <span style={{
                fontSize: Math.round(9 + weight * 0.8), fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#EAFBF8', fontFamily: "'IBM Plex Mono', monospace",
                textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                lineHeight: 1.1,
                maxWidth: w - 18,
                overflowWrap: 'anywhere',
              }}>{node.label}</span>
            )}

            {/* Item count + file badge */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 7.5, letterSpacing: '0.1em',
                color: 'rgba(247,238,223,0.75)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {childCount} item{childCount !== 1 ? 's' : ''}
              </span>
              {fileCount > 0 && (
                <span style={{
                  fontSize: 7, padding: '1px 4px',
                  background: 'rgba(0,0,0,0.25)', borderRadius: 2,
                  color: 'rgba(247,238,223,0.9)', fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.05em',
                }}>
                  📎 {fileCount}
                </span>
              )}
            </div>

            {/* Expand dot */}
            <div style={{
              position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
              width: 18, height: 2,
              background: node.collapsed ? 'rgba(247,238,223,0.3)' : 'rgba(247,238,223,0.7)',
            }} />
          </div>

          {/* Hidden file input — triggered from Inspector panel */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv"
            style={{ display: 'none' }}
            onChange={handleFileAttach}
          />
        </div>
      </foreignObject>

      {/* Connection dot */}
      <circle cx={x} cy={y + halfH + 12} r={3}
        fill="#8DF5EF" stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} />
    </motion.g>
  );
}
