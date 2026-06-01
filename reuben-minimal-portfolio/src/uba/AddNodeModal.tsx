import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { GraphNode } from './types';

interface AddNodeModalProps {
  parentNode: GraphNode | null;
  onClose: () => void;
  onAdd: (parentId: string, node: Omit<GraphNode, 'id' | 'type' | 'collapsed'>) => void;
}

const CATEGORIES = ['story', 'education', 'work', 'research', 'projects', 'social', 'profile'];

export function AddNodeModal({ parentNode, onClose, onAdd }: AddNodeModalProps) {
  const [label, setLabel]       = useState('');
  const [description, setDesc]  = useState('');
  const [category, setCategory] = useState(parentNode?.category ?? 'education');
  const [icon, setIcon]         = useState('circle');
  const [image]                 = useState('');

  if (!parentNode) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd(parentNode!.id, {
      label: label.trim(), category, icon: icon.trim() || 'circle',
      description: description.trim(), image: image.trim() || undefined,
      weight: 0.85, children: [],
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {parentNode && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 51, width: 360 }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              transform: 'translate(0, 18px)',
              background: 'rgba(0,0,0,0.38)',
              filter: 'blur(24px)',
              zIndex: -1,
            }} />

            <div style={{
              background: 'rgba(7,18,17,0.94)',
              border: '1px solid rgba(148,163,184,0.16)',
              borderRadius: 24,
              fontFamily: "'IBM Plex Mono', monospace",
              overflow: 'hidden',
              backdropFilter: 'blur(24px)',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.045)',
                borderBottom: '1px solid rgba(148,163,184,0.14)',
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#8DF5EF' }}>
                  New Archive Node
                </span>
                <button onClick={onClose} style={{
                  width: 24, height: 24, border: '1px solid rgba(148,163,184,0.16)',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.045)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#EAFBF8', fontSize: 10,
                }}><X size={10} /></button>
              </div>

              {/* Sub-header */}
              <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid rgba(148,163,184,0.10)',
                background: 'rgba(255,255,255,0.025)',
              }}>
                <span style={{ fontSize: 9, color: '#A7B8B4', letterSpacing: '0.1em' }}>
                  Adding child to: <strong style={{ color: '#EAFBF8' }}>{parentNode.label}</strong>
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <VField label="Title *">
                  <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)}
                    placeholder="Node title..." className="input-field" />
                </VField>

                <VField label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </VField>

                <VField label="Icon (lucide name)">
                  <input value={icon} onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. star, zap, cpu..." className="input-field" />
                </VField>

                <VField label="Description">
                  <textarea value={description} onChange={(e) => setDesc(e.target.value)}
                    placeholder="Short description..." rows={2} className="input-field"
                    style={{ resize: 'none' }} />
                </VField>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="button" onClick={onClose} style={{
                    flex: 1, padding: '9px', border: '1px solid rgba(148,163,184,0.16)',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.045)', cursor: 'pointer',
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: '#A7B8B4',
                    fontFamily: "'IBM Plex Mono', monospace",
                    boxShadow: 'none',
                  }}>Cancel</button>

                  <button type="submit" disabled={!label.trim()} style={{
                    flex: 1, padding: '7px',
                    border: '1px solid rgba(34,211,238,0.30)',
                    borderRadius: 999,
                    background: label.trim() ? 'rgba(34,211,238,0.14)' : '#33413D',
                    cursor: label.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: '#EAFBF8',
                    fontFamily: "'IBM Plex Mono', monospace",
                    boxShadow: label.trim() ? '0 0 24px rgba(34,211,238,0.10)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    <Plus size={10} />Add Node
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function VField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: '#6F8F8A', fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
