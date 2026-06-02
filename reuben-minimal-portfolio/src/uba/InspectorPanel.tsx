/* eslint-disable react-hooks/set-state-in-effect, react-hooks/static-components */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { X, Plus, ChevronDown, ChevronRight, Pencil, Check, Paperclip } from 'lucide-react';
import type { SelectedNode, FileAttachment } from './types';

// Folder bg per category — matches FolderNode
const FOLDER_BG: Record<string, string> = {
  story: '#5E8B6E', education: '#0F8F88', work: '#2A6F97',
  research: '#6D5BD0', projects: '#B47A32', social: '#B85C7A', profile: '#6B7D3A',
};
function folderBg(cat: string) { return FOLDER_BG[cat] ?? '#0F766E'; }

function getIcon(name: string): React.FC<{ size?: number; color?: string; strokeWidth?: number }> {
  const key = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons;
  return (LucideIcons[key] as React.FC<{ size?: number; color?: string; strokeWidth?: number }>) ?? LucideIcons.Folder;
}

const TABS = ['Overview', 'Contents', 'Connections', 'Activity'];

interface InspectorPanelProps {
  selected: SelectedNode | null;
  onClose: () => void;
  onAddChild: () => void;
  onToggle: () => void;
  onLabelSave: (id: string, newLabel: string) => void;
  onAttachFile: (nodeId: string, file: FileAttachment) => void;
  isEditable: boolean;
}

export function InspectorPanel({ selected, onClose, onAddChild, onToggle, onLabelSave, onAttachFile, isEditable }: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState('Overview');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected) return;
    Array.from(e.target.files ?? []).forEach(f => {
      onAttachFile(selected.node.id, {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name, type: f.type, size: f.size,
      });
    });
    e.target.value = '';
  }

  return (
    <AnimatePresence>
      {selected && (
        <motion.aside
          key="inspector"
          initial={{ x: 280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 280, flexShrink: 0,
            background: '#0A1514',
            borderLeft: '1.5px solid rgba(148,163,184,0.22)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', zIndex: 20,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {/* Inspector header */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1.5px solid rgba(148,163,184,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#071211',
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: '#A7B8B4' }}>Inspector</span>
            <button onClick={onClose} style={{
              width: 18, height: 18, border: '1.5px solid rgba(148,163,184,0.22)',
              background: '#0F1F1D', cursor: 'pointer', fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#EAFBF8',
            }}><X size={10} /></button>
          </div>

          {/* Folder preview + title */}
          <FolderPreview selected={selected} onLabelSave={onLabelSave} isEditable={isEditable} />

          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1.5px solid rgba(148,163,184,0.22)',
            background: '#071211',
          }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '6px 2px',
                fontSize: 7.5, letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: activeTab === tab ? 700 : 400,
                color: activeTab === tab ? '#EAFBF8' : '#6F8F8A',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #22D3EE' : '2px solid transparent',
                fontFamily: "'IBM Plex Mono', monospace",
                transition: 'color 0.1s',
              }}>{tab}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {activeTab === 'Overview' && <OverviewTab selected={selected} isEditable={isEditable} />}
            {activeTab === 'Contents' && <ContentsTab selected={selected} />}
            {activeTab === 'Connections' && (
              <p style={{ fontSize: 9, color: '#6F8F8A', letterSpacing: '0.1em' }}>
                Connection graph coming soon.
              </p>
            )}
            {activeTab === 'Activity' && (
              <p style={{ fontSize: 9, color: '#6F8F8A', letterSpacing: '0.1em' }}>
                Activity log coming soon.
              </p>
            )}
          </div>

          {/* Action buttons */}
          {isEditable && (
            <div style={{ borderTop: '1.5px solid rgba(148,163,184,0.22)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <VintageButton label="Open Collection" primary onClick={() => {}} />
              <div style={{ display: 'flex', gap: 6 }}>
                <VintageButton label="Add Node" onClick={onAddChild} icon={<Plus size={10} />} />
                <VintageButton
                  label={selected.node.collapsed ? 'Expand' : 'Collapse'}
                  onClick={onToggle}
                  icon={selected.node.collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                />
              </div>
              {/* Attach files — only shown for folders */}
              {selected.node.type !== 'center' && (
                <>
                  <VintageButton
                    label={`Attach File${(selected.node.files?.length ?? 0) > 0 ? ` · ${selected.node.files!.length} attached` : ''}`}
                    onClick={() => fileRef.current?.click()}
                    icon={<Paperclip size={10} />}
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function FolderPreview({ selected, onLabelSave, isEditable }: { selected: SelectedNode; onLabelSave: (id: string, l: string) => void; isEditable: boolean }) {
  const { node } = selected;
  const bg   = folderBg(node.category);
  const Icon = getIcon(node.icon);

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setDraft(node.label); setEditing(false); }, [node.id, node.label]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  function commit() { setEditing(false); if (draft.trim()) onLabelSave(node.id, draft.trim()); else setDraft(node.label); }

  return (
    <div style={{
      padding: '12px', display: 'flex', gap: 10, alignItems: 'flex-start',
      borderBottom: '1.5px solid rgba(0,0,0,0.18)',
      background: '#0F1F1D',
    }}>
      {/* Mini folder preview */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', top: 0, left: 3,
          width: 28, height: 9,
          borderRadius: '3px 3px 0 0',
          background: bg, border: '1px solid rgba(148,163,184,0.22)', borderBottom: 'none',
        }} />
        <div style={{
          marginTop: 8,
          width: 58, height: 44,
          borderRadius: '0 4px 4px 4px',
          background: bg, border: '1.5px solid rgba(148,163,184,0.22)',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color="#EAFBF8" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 7.5, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#22D3EE', fontWeight: 700, display: 'block', marginBottom: 3 }}>
          {node.type === 'folder' ? '◆ Primary Folder' : node.type === 'center' ? '◆ Identity' : '◆ Archive Item'}
        </span>

        {editing ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(node.label); } }}
              style={{
                flex: 1, padding: '2px 5px',
                background: '#0F1F1D', border: '1.5px solid rgba(148,163,184,0.22)',
                fontSize: 12, fontWeight: 600,
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#EAFBF8', outline: 'none',
              }}
            />
            <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22D3EE' }}>
              <Check size={13} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} className="group">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#EAFBF8',
              fontFamily: "'IBM Plex Mono', monospace", display: 'block' }}>
              {node.label}
            </span>
            {isEditable && (
              <button onClick={() => setEditing(true)} title="Rename"
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: '#6F8F8A', padding: 0, lineHeight: 1 }}>
                <Pencil size={10} />
              </button>
            )}
          </div>
        )}

        <span style={{ fontSize: 8, color: '#6F8F8A', letterSpacing: '0.1em' }}>
          {node.category.toUpperCase()} · {node.children?.length ?? 0} items
        </span>
      </div>
    </div>
  );
}

function OverviewTab({ selected, isEditable }: { selected: SelectedNode; isEditable: boolean }) {
  const { node } = selected;
  const bg = folderBg(node.category);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Description quote */}
      {node.description && (
        <div style={{
          padding: '8px 10px',
          borderLeft: `3px solid ${bg}`,
          background: '#0F1F1D',
          border: '1px solid rgba(0,0,0,0.12)',
          borderLeftWidth: 3, borderLeftColor: bg, borderLeftStyle: 'solid',
        }}>
          <p style={{ fontSize: 9, color: '#A7B8B4', lineHeight: 1.7,
            fontFamily: "'IBM Plex Mono', monospace", fontStyle: 'italic' }}>
            "{node.description}"
          </p>
        </div>
      )}
      {/* Metadata rows */}
      <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: 2 }}>
        {[
          { label: 'Collections', value: String(node.children?.filter(c => c.type === 'folder').length ?? 0) },
          { label: 'Items',       value: String(node.children?.filter(c => c.type === 'item').length ?? (node.children?.length ?? 0)) },
          { label: 'Time Span',   value: '—' },
          { label: 'Last Updated', value: 'May 2026' },
          { label: 'Visibility',  value: isEditable ? 'Private Studio' : 'Public Profile' },
        ].map(({ label, value }, i, arr) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 8px',
            borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
            background: i % 2 === 0 ? '#0F1F1D' : 'transparent',
          }}>
            <span style={{ fontSize: 8, color: '#6F8F8A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: '#EAFBF8', letterSpacing: '0.1em' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentsTab({ selected }: { selected: SelectedNode }) {
  const children = selected.node.children ?? [];
  if (!children.length) return (
    <p style={{ fontSize: 9, color: '#6F8F8A', fontFamily: "'IBM Plex Mono', monospace" }}>No child nodes yet.</p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <p style={{ fontSize: 7.5, letterSpacing: '0.2em', color: '#6F8F8A',
        textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Collections</p>
      {children.map((child, i) => {
        const Icon = getIcon(child.icon);
        const bg = folderBg(child.category);
        return (
          <div key={child.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 2,
            background: i % 2 === 0 ? '#0F1F1D' : '#0A1514',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 2,
              background: bg, border: '1px solid rgba(148,163,184,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={11} color="#EAFBF8" strokeWidth={1.5} />
            </div>
            <div>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#EAFBF8',
                display: 'block', fontFamily: "'IBM Plex Mono', monospace" }}>
                {child.label}
              </span>
              <span style={{ fontSize: 7.5, color: '#6F8F8A', fontFamily: "'IBM Plex Mono', monospace" }}>
                {(child.children?.length ?? 0)} items
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VintageButton({ label, primary, onClick, icon }: {
  label: string; primary?: boolean; onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      padding: '6px 10px',
      border: '1.5px solid rgba(148,163,184,0.22)',
      borderRadius: 2,
      background: primary ? '#0F766E' : '#0F1F1D',
      color: primary ? '#EAFBF8' : '#EAFBF8',
      fontSize: 8, fontWeight: 700, letterSpacing: '0.15em',
      textTransform: 'uppercase', cursor: 'pointer',
      fontFamily: "'IBM Plex Mono', monospace",
      boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
      transition: 'transform 0.1s',
    }}>
      {icon}
      {label}
    </button>
  );
}
