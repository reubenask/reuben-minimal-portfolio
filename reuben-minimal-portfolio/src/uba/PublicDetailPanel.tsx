/* eslint-disable react-hooks/static-components */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ArrowUpRight, Image, Layers, Link2, Maximize2, Sparkles, X } from 'lucide-react';
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

type PanelFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PanelInteraction =
  | { mode: 'move'; startX: number; startY: number; frame: PanelFrame }
  | { mode: 'resize'; edge: 'right' | 'bottom' | 'corner'; startX: number; startY: number; frame: PanelFrame };

const PANEL_FRAME_KEY = 'uba_public_detail_panel_frame';
const PANEL_MIN_WIDTH = 220;
const PANEL_MIN_HEIGHT = 190;
const PANEL_MARGIN = 14;
const PANEL_TOP_MARGIN = 64;

function defaultPanelFrame(): PanelFrame {
  if (typeof window === 'undefined') return { x: 900, y: 780, width: 340, height: 340 };
  return {
    x: Math.max(PANEL_MARGIN, window.innerWidth - 340 - 22),
    y: Math.max(PANEL_TOP_MARGIN, window.innerHeight - 340 - 22),
    width: 340,
    height: 340,
  };
}

function clampPanelFrame(frame: PanelFrame): PanelFrame {
  if (typeof window === 'undefined') return frame;
  const maxWidth = Math.max(PANEL_MIN_WIDTH, window.innerWidth - PANEL_MARGIN * 2);
  const maxHeight = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - PANEL_TOP_MARGIN - PANEL_MARGIN);
  const width = Math.min(Math.max(frame.width, PANEL_MIN_WIDTH), maxWidth);
  const height = Math.min(Math.max(frame.height, PANEL_MIN_HEIGHT), maxHeight);
  return {
    x: Math.min(Math.max(frame.x, PANEL_MARGIN), window.innerWidth - width - PANEL_MARGIN),
    y: Math.min(Math.max(frame.y, PANEL_TOP_MARGIN), window.innerHeight - height - PANEL_MARGIN),
    width,
    height,
  };
}

function readStoredPanelFrame(): PanelFrame {
  if (typeof window === 'undefined') return defaultPanelFrame();
  const stored = window.localStorage.getItem(PANEL_FRAME_KEY);
  if (!stored) return defaultPanelFrame();
  try {
    const frame = JSON.parse(stored) as PanelFrame;
    return clampPanelFrame(frame);
  } catch {
    return defaultPanelFrame();
  }
}

function savePanelFrame(frame: PanelFrame) {
  window.localStorage.setItem(PANEL_FRAME_KEY, JSON.stringify(clampPanelFrame(frame)));
}

export function PublicDetailPanel({ selected, onClose }: PublicDetailPanelProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [frame, setFrame] = useState<PanelFrame>(() => readStoredPanelFrame());
  const interactionRef = useRef<PanelInteraction | null>(null);
  const node = selected?.node;
  const accent = node ? accentFor(node.category) : '#0F766E';
  const Icon = node ? getIcon(node.icon) : LucideIcons.Circle;
  const childCount = node?.children?.length ?? 0;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const update = () => setIsCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isCompact) return;
    const onResize = () => setFrame((current) => clampPanelFrame(current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isCompact]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const interaction = interactionRef.current;
      if (!interaction) return;
      const dx = e.clientX - interaction.startX;
      const dy = e.clientY - interaction.startY;
      const nextFrame = interaction.mode === 'move'
        ? { ...interaction.frame, x: interaction.frame.x + dx, y: interaction.frame.y + dy }
        : {
            ...interaction.frame,
            width: interaction.edge === 'bottom' ? interaction.frame.width : interaction.frame.width + dx,
            height: interaction.edge === 'right' ? interaction.frame.height : interaction.frame.height + dy,
          };
      setFrame(clampPanelFrame(nextFrame));
    }

    function onPointerUp() {
      if (!interactionRef.current) return;
      interactionRef.current = null;
      setFrame((current) => {
        const nextFrame = clampPanelFrame(current);
        savePanelFrame(nextFrame);
        return nextFrame;
      });
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  function startPanelMove(e: React.PointerEvent) {
    if (isCompact) return;
    interactionRef.current = {
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      frame,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  function startPanelResize(e: React.PointerEvent, edge: 'right' | 'bottom' | 'corner') {
    if (isCompact) return;
    interactionRef.current = {
      mode: 'resize',
      edge,
      startX: e.clientX,
      startY: e.clientY,
      frame,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key={node.id}
          initial={{ y: 28, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 28, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: isCompact ? 'auto' : frame.y,
            right: isCompact ? 10 : 'auto',
            bottom: isCompact ? 10 : 'auto',
            left: isCompact ? 10 : frame.x,
            width: isCompact ? 'auto' : frame.width,
            height: isCompact ? 'min(48vh, 360px)' : frame.height,
            maxWidth: isCompact ? 'none' : 'calc(100vw - 44px)',
            maxHeight: 'calc(100vh - 82px)',
            overflow: 'hidden',
            zIndex: 30,
            border: '1px solid rgba(79,65,42,0.16)',
            borderRadius: 24,
            background: 'rgba(255,250,241,0.88)',
            boxShadow: '0 32px 90px rgba(86,64,34,0.24)',
            backdropFilter: 'blur(24px)',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#20302B',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{
            padding: isCompact ? 11 : 13,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            borderBottom: '1px solid rgba(79,65,42,0.12)',
            background: `linear-gradient(135deg, ${accent}22, rgba(255,250,241,0.72))`,
            flexShrink: 0,
            cursor: isCompact ? 'default' : 'grab',
            touchAction: isCompact ? 'auto' : 'none',
          }}
            onPointerDown={startPanelMove}
          >
            <div style={{
              width: isCompact ? 38 : 42,
              height: isCompact ? 38 : 42,
              borderRadius: 14,
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
                fontSize: 7.5,
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
                fontSize: isCompact ? 14 : 17,
                lineHeight: 1.12,
                letterSpacing: 0,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {node.label}
              </h2>
              <div style={{ marginTop: 5, fontSize: 7.5, color: '#746850', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {node.category} · {childCount} linked {childCount === 1 ? 'node' : 'nodes'}
              </div>
            </div>

            <button
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Close details"
              style={{
                width: 28,
                height: 28,
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

          <div style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: isCompact ? 11 : 13,
            display: 'flex',
            flexDirection: 'column',
            gap: isCompact ? 9 : 12,
          }}>
            <SectionTitle icon={<Sparkles size={12} />} label="Overview" />
            <p style={{
              margin: 0,
              padding: '12px 13px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.54)',
              border: '1px solid rgba(79,65,42,0.10)',
              color: '#34443D',
              fontSize: 10,
              lineHeight: 1.55,
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
          {!isCompact && (
            <>
              <button
                type="button"
                onPointerDown={(e) => startPanelResize(e, 'right')}
                aria-label="Resize detail card width"
                title="Drag to stretch width"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 74,
                  bottom: 38,
                  width: 12,
                  border: 'none',
                  borderRadius: '10px 0 0 10px',
                  background: 'linear-gradient(90deg, transparent, rgba(15,118,110,0.13))',
                  cursor: 'ew-resize',
                  touchAction: 'none',
                }}
              />
              <button
                type="button"
                onPointerDown={(e) => startPanelResize(e, 'bottom')}
                aria-label="Resize detail card height"
                title="Drag to stretch height"
                style={{
                  position: 'absolute',
                  left: 24,
                  right: 38,
                  bottom: 0,
                  height: 12,
                  border: 'none',
                  borderRadius: '10px 10px 0 0',
                  background: 'linear-gradient(180deg, transparent, rgba(15,118,110,0.13))',
                  cursor: 'ns-resize',
                  touchAction: 'none',
                }}
              />
              <button
                type="button"
                onPointerDown={(e) => startPanelResize(e, 'corner')}
                aria-label="Resize detail card"
                title="Drag to resize detail card"
                style={{
                  position: 'absolute',
                  right: 7,
                  bottom: 7,
                  width: 34,
                  height: 34,
                  border: '1px solid rgba(15,118,110,0.24)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.68)',
                  color: '#315A53',
                  cursor: 'nwse-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(86,64,34,0.14)',
                  touchAction: 'none',
                }}
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}
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
