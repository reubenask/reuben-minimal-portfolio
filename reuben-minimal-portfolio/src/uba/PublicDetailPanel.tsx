/* eslint-disable react-hooks/static-components */
import { AnimatePresence, motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ArrowUpRight, Image, Layers, Link2, Sparkles, X } from 'lucide-react';
import type { SelectedNode } from './types';

const CATEGORY_ACCENT: Record<string, string> = {
  story: '#5E8B6E',
  education: '#0F8F88',
  work: '#2A6F97',
  research: '#6D5BD0',
  projects: '#B47A32',
  social: '#B85C7A',
  profile: '#6B7D3A',
  identity: '#0F766E',
};

function accentFor(category: string) {
  return CATEGORY_ACCENT[category] ?? '#0F766E';
}

function getIcon(name: string): React.FC<{ size?: number; color?: string; strokeWidth?: number }> {
  const key = name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('') as keyof typeof LucideIcons;
  return (LucideIcons[key] as React.FC<{ size?: number; color?: string; strokeWidth?: number }>) ?? LucideIcons.Circle;
}

interface PublicDetailPanelProps {
  selected: SelectedNode | null;
  onClose: () => void;
}

export function PublicDetailPanel({ selected, onClose }: PublicDetailPanelProps) {
  const node = selected?.node;
  const accent = node ? accentFor(node.category) : '#0F766E';
  const Icon = node ? getIcon(node.icon) : LucideIcons.Circle;
  const childCount = node?.children?.length ?? 0;

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key={node.id}
          initial={{ x: 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 28, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: 22,
            right: 22,
            width: 340,
            maxWidth: 'calc(100vw - 44px)',
            maxHeight: 'calc(100vh - 96px)',
            overflow: 'hidden',
            zIndex: 30,
            border: '1px solid rgba(79,65,42,0.16)',
            borderRadius: 24,
            background: 'rgba(255,250,241,0.88)',
            boxShadow: '0 32px 90px rgba(86,64,34,0.24)',
            backdropFilter: 'blur(24px)',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#20302B',
          }}
        >
          <div style={{
            padding: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            borderBottom: '1px solid rgba(79,65,42,0.12)',
            background: `linear-gradient(135deg, ${accent}22, rgba(255,250,241,0.72))`,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: `linear-gradient(145deg, ${accent}, rgba(7,18,17,0.86))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#F8F2E7',
              boxShadow: `0 18px 46px ${accent}44`,
            }}>
              <Icon size={21} strokeWidth={1.7} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 8,
                color: accent,
                fontWeight: 900,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}>
                {node.type === 'folder' ? 'Archive Folder' : node.type === 'center' ? 'Identity Node' : 'Archive Item'}
              </div>
              <h2 style={{
                margin: 0,
                color: '#17251F',
                fontSize: 18,
                lineHeight: 1.12,
                letterSpacing: 0,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {node.label}
              </h2>
              <div style={{ marginTop: 6, fontSize: 8.5, color: '#746850', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {node.category} · {childCount} linked {childCount === 1 ? 'node' : 'nodes'}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close details"
              style={{
                width: 30,
                height: 30,
                border: '1px solid rgba(79,65,42,0.15)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.58)',
                color: '#415149',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ maxHeight: 'calc(100vh - 230px)', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionTitle icon={<Sparkles size={12} />} label="Overview" />
            <p style={{
              margin: 0,
              padding: '12px 13px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.54)',
              border: '1px solid rgba(79,65,42,0.10)',
              color: '#34443D',
              fontSize: 11,
              lineHeight: 1.65,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {node.description || 'A focused archive entry will be added here with the story, context, methods, and outcomes.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Metric label="Status" value="Draft dossier" />
              <Metric label="Evidence" value="Pending" />
              <Metric label="Impact" value="To measure" />
              <Metric label="Gallery" value="3 slots" />
            </div>

            <SectionTitle icon={<Layers size={12} />} label="Exploration Placeholders" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Measured Impact', 'How this work changed a person, system, institution, or decision.'],
                ['Evidence & Artifacts', 'Papers, screenshots, datasets, prototypes, or field notes.'],
                ['Narrative Thread', 'Why this node matters inside the User Behavior Architect story.'],
              ].map(([title, copy]) => (
                <div key={title} style={{
                  padding: '10px 12px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.46)',
                  border: '1px solid rgba(79,65,42,0.10)',
                }}>
                  <div style={{ fontSize: 9.5, color: '#17251F', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {title}
                  </div>
                  <p style={{ margin: '5px 0 0', color: '#6F6250', fontSize: 9.5, lineHeight: 1.5 }}>
                    {copy}
                  </p>
                </div>
              ))}
            </div>

            <SectionTitle icon={<Image size={12} />} label="Gallery Preview" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {['Image', 'Chart', 'Artifact'].map((label) => (
                <div key={label} style={{
                  aspectRatio: '1 / 0.78',
                  borderRadius: 14,
                  border: '1px dashed rgba(79,65,42,0.22)',
                  background: `linear-gradient(145deg, ${accent}18, rgba(255,255,255,0.44))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#746850',
                  fontSize: 8,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  {label}
                </div>
              ))}
            </div>

            <button style={{
              marginTop: 2,
              width: '100%',
              border: `1px solid ${accent}55`,
              borderRadius: 999,
              background: `${accent}1F`,
              color: '#17332D',
              padding: '10px 12px',
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              <Link2 size={12} />
              Full Dossier Coming Soon
              <ArrowUpRight size={12} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#6D5A3F' }}>
      {icon}
      <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '10px 11px',
      borderRadius: 15,
      background: 'rgba(255,255,255,0.46)',
      border: '1px solid rgba(79,65,42,0.10)',
    }}>
      <div style={{ color: '#83745D', fontSize: 7.5, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ color: '#1F322C', fontSize: 10, fontWeight: 900 }}>
        {value}
      </div>
    </div>
  );
}
