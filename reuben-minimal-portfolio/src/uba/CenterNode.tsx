import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import type { GraphNode } from './types';

interface CenterNodeProps {
  node: GraphNode;
  x: number; y: number;
  isSelected: boolean;
  avatarUrl: string;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onAvatarUpload: (dataUrl: string) => void;
  onAddFolder?: () => void;
}

export function CenterNode({ node, x, y, isSelected, avatarUrl, onClick, onDragStart, onAvatarUpload }: CenterNodeProps) {
  const SIZE = 148;
  const HALF = SIZE / 2;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (typeof ev.target?.result === 'string') onAvatarUpload(ev.target.result); };
    reader.readAsDataURL(file);
  }

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ cursor: 'grab', transformOrigin: `${x}px ${y}px` }}
      onMouseDown={onDragStart}
      onClick={onClick}
    >
      {/* Orbit rings */}
      {[HALF + 45, HALF + 80, HALF + 115].map((r, i) => (
        <circle key={r} cx={x} cy={y} r={r} fill="none"
          stroke="rgba(15,118,110,0.18)"
          strokeWidth={i === 0 ? 1 : 0.6}
          strokeDasharray={i === 2 ? '5 9' : i === 1 ? '2 6' : undefined} />
      ))}

      {/* Shadow */}
      <circle cx={x + 3} cy={y + 4} r={HALF + 2} fill="rgba(0,0,0,0.28)" />
      {/* Body */}
      <circle cx={x} cy={y} r={HALF + 2} fill="#0F1F1D" stroke="rgba(34,211,238,0.38)" strokeWidth={2} />
      <circle cx={x} cy={y} r={HALF - 5} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />

      <defs>
        <clipPath id="avatarClip">
          <circle cx={x} cy={y} r={HALF - 7} />
        </clipPath>
      </defs>

      {avatarUrl ? (
        <image href={avatarUrl}
          x={x - HALF + 7} y={y - HALF + 7}
          width={(HALF - 7) * 2} height={(HALF - 7) * 2}
          clipPath="url(#avatarClip)"
          preserveAspectRatio="xMidYMid slice" />
      ) : (
        <>
          <circle cx={x} cy={y - 18} r={20} fill="rgba(34,211,238,0.14)" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
          <ellipse cx={x} cy={y + 28} rx={30} ry={16} fill="rgba(214,168,79,0.10)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          <text x={x} y={y + 10} textAnchor="middle" fontSize={14} fill="rgba(141,245,239,0.55)" fontFamily="monospace">✦</text>
        </>
      )}

      {isSelected && (
        <motion.circle cx={x} cy={y} r={HALF + 8} fill="none"
          stroke="#22D3EE" strokeWidth={2} strokeDasharray="6 4"
          initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} />
      )}

      <text x={x} y={y + HALF + 18} textAnchor="middle"
        fill="#182522" fontSize={8.5} fontWeight={700} letterSpacing={3}
        fontFamily="'IBM Plex Mono', monospace">{node.label}</text>
      <text x={x} y={y + HALF + 30} textAnchor="middle"
        fill="#6E6251" fontSize={7} letterSpacing={1.5}
        fontFamily="'IBM Plex Mono', monospace">◆ IDENTITY NODE ◆</text>

      {/* Camera upload button */}
      <foreignObject x={x + HALF - 20} y={y + HALF - 18} width={24} height={24} style={{ overflow: 'visible' }}>
        <div title="Upload photo"
          style={{
            width: 24, height: 24, border: '1px solid rgba(34,211,238,0.32)', borderRadius: 8,
            background: '#0F1F1D', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 0 18px rgba(34,211,238,0.10)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
          <Camera size={11} color="#A7B8B4" />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </foreignObject>

    </motion.g>
  );
}
