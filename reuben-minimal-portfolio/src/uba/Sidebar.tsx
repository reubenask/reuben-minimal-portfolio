import { Archive, Search, Share2, Settings, LayoutGrid, Bell, Clock } from 'lucide-react';

const items = [
  { icon: LayoutGrid, label: 'Archive',  active: true },
  { icon: Share2,     label: 'Graph' },
  { icon: Clock,      label: 'Timeline' },
  { icon: Search,     label: 'Tags' },
  { icon: Archive,    label: 'Media' },
  { icon: Bell,       label: 'Notes' },
  { icon: Settings,   label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside style={{
      width: 72,
      background: 'rgba(4,12,11,0.72)',
      borderRight: '1px solid rgba(148,163,184,0.14)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '18px 0',
      gap: 8,
      flexShrink: 0,
      zIndex: 20,
      backdropFilter: 'blur(18px)',
    }}>
      {items.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          title={label}
          style={{
            width: 46, height: 46,
            border: active ? '1px solid rgba(34,211,238,0.45)' : '1px solid transparent',
            borderRadius: 14,
            background: active ? 'rgba(34,211,238,0.12)' : 'transparent',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 2,
            cursor: 'pointer',
            color: active ? '#8DF5EF' : '#6F8F8A',
            boxShadow: active ? '0 0 30px rgba(34,211,238,0.12)' : 'none',
            transition: 'all 0.16s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!active) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.color = '#EAFBF8';
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#6F8F8A';
            }
          }}
        >
          <Icon size={14} strokeWidth={active ? 2 : 1.5} />
          <span style={{ fontSize: 6, letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: active ? 600 : 400 }}>
            {label}
          </span>
        </button>
      ))}
    </aside>
  );
}
