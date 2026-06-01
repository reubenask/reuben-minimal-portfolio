import { Search, Plus, SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearch: (q: string) => void;
}

export function TopBar({ searchQuery, onSearch }: TopBarProps) {
  return (
    <div style={{
      height: 58,
      background: 'rgba(4,12,11,0.60)',
      borderBottom: '1px solid rgba(148,163,184,0.12)',
      display: 'flex', alignItems: 'center',
      padding: '0 18px', gap: 12,
      flexShrink: 0, zIndex: 10,
      backdropFilter: 'blur(18px)',
    }}>

      <div style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
        <Search size={11} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: '#8DF5EF', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search your archive..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: 38, paddingRight: 48,
            paddingTop: 11, paddingBottom: 11,
            background: 'rgba(255,255,255,0.045)',
            border: '1px solid rgba(148,163,184,0.16)',
            borderRadius: 999,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, color: '#EAFBF8',
            outline: 'none',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        />
        <span style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          fontSize: 8, color: '#6F8F8A', letterSpacing: 1,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* New button */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '9px 13px',
        border: '1px solid rgba(34,211,238,0.26)',
        borderRadius: 999,
        background: 'rgba(34,211,238,0.09)',
        cursor: 'pointer',
        fontSize: 9, fontWeight: 600, letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#EAFBF8',
        fontFamily: "'IBM Plex Mono', monospace",
        boxShadow: '0 0 24px rgba(34,211,238,0.08)',
      }}>
        <Plus size={10} strokeWidth={2.5} />
        New
        <span style={{
          marginLeft: 3,
          background: 'rgba(214,168,79,0.18)',
          border: '1px solid rgba(214,168,79,0.25)',
          borderRadius: 999,
          padding: '0 4px',
          fontSize: 8, color: '#F3D28B',
        }}>▼</span>
      </button>

      <button style={{
        width: 28, height: 28,
        border: '1px solid rgba(148,163,184,0.16)',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.045)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#A7B8B4',
        boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
      }}>
        <SlidersHorizontal size={12} />
      </button>

      {/* User avatar */}
      <div style={{
        width: 28, height: 28,
        border: '1px solid rgba(34,211,238,0.35)',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #0F766E, #155E75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
        color: '#EAFBF8',
        fontFamily: "'IBM Plex Mono', monospace",
        boxShadow: '0 0 24px rgba(34,211,238,0.12)',
        cursor: 'pointer',
      }}>U.</div>
    </div>
  );
}
