import { useEffect, useState } from 'react';
import { LockKeyhole, LogOut, UserRound } from 'lucide-react';
import { Sidebar }        from './Sidebar';
import { TopBar }         from './TopBar';
import { ArchiveGraph }   from './ArchiveGraph';
import { InspectorPanel } from './InspectorPanel';
import { AddNodeModal }   from './AddNodeModal';
import { PublicDetailPanel } from './PublicDetailPanel';
import { useGraph }       from './hooks/useGraph';
import type { GraphNode } from './types';

const MEMBER_SESSION_KEY = 'uba_member_session';
const MEMBER_CODE = import.meta.env.VITE_UBA_MEMBER_CODE ?? 'UBA2026';

export function UbaArchive() {
  const [isCompact, setIsCompact] = useState(false);
  const [isMember, setIsMember] = useState(() => localStorage.getItem(MEMBER_SESSION_KEY) === 'active');
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedEdit = params.get('mode') === 'edit' || params.get('studio') === 'edit';
    return requestedEdit && localStorage.getItem(MEMBER_SESSION_KEY) !== 'active';
  });
  const isEditorMode = isMember;

  const {
    graph, selected, searchQuery, setSearchQuery,
    toggleFolder, selectNode, clearSelection, addChildNode,
    updateNodeLabel, nodePositions, setNodePosition,
    avatarUrl, setAvatarUrl,
    attachFile,
  } = useGraph();

  const [addTarget, setAddTarget] = useState<GraphNode | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  function handleLogin(code: string) {
    if (code.trim() !== MEMBER_CODE) return false;
    localStorage.setItem(MEMBER_SESSION_KEY, 'active');
    setIsMember(true);
    setIsLoginOpen(false);
    return true;
  }

  function handleLogout() {
    localStorage.removeItem(MEMBER_SESSION_KEY);
    setIsMember(false);
    setAddTarget(null);
    clearSelection();
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      border: '1px solid rgba(148,163,184,0.14)',
      overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace",
      background: 'radial-gradient(circle at 48% 30%, rgba(34,211,238,0.08), transparent 34%), linear-gradient(135deg, #030706 0%, #061211 52%, #020504 100%)',
    }}>

      <div style={{
        height: isCompact ? 48 : 52,
        background: 'rgba(4, 12, 11, 0.82)',
        borderBottom: '1px solid rgba(148,163,184,0.16)',
        display: 'flex', alignItems: 'center',
        padding: isCompact ? '0 12px' : '0 18px',
        flexShrink: 0,
        gap: isCompact ? 10 : 14,
        backdropFilter: 'blur(18px)',
      }}>
        <div style={{
          width: isCompact ? 34 : 38, height: isCompact ? 28 : 30,
          border: '1px solid rgba(34,211,238,0.36)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, letterSpacing: 1,
          color: '#8DF5EF', background: 'rgba(34,211,238,0.10)',
          fontFamily: "'IBM Plex Mono', monospace",
          boxShadow: '0 0 28px rgba(34,211,238,0.12)',
        }}>UBA</div>

        <div style={{ flex: 1, textAlign: 'left', fontSize: 11, fontWeight: 700,
          letterSpacing: isCompact ? '0.18em' : '0.34em', color: '#EAFBF8', textTransform: 'uppercase',
          fontFamily: "'IBM Plex Mono', monospace",
          lineHeight: 1.25,
          minWidth: 0,
        }}>
          User Behavior Archive
          {isEditorMode && (
            <span style={{ color: '#6F8F8A', fontWeight: 400, letterSpacing: '0.14em' }}> · Edit Studio</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: isCompact ? 42 : 52 }}>
          {['●', '●', '●'].map((c, i) => (
            <div key={i} style={{
              width: 9, height: 9,
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '999px',
              display: isCompact ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 0,
              cursor: 'default',
              background: i === 0 ? '#D6A84F' : i === 1 ? '#22D3EE' : '#2DD4BF',
              color: 'transparent', fontFamily: 'monospace',
              userSelect: 'none',
            }}>{c}</div>
          ))}
          {isMember ? (
            <button
              onClick={handleLogout}
              title="Leave edit studio"
              style={{
                width: 34, height: 34,
                border: '1px solid rgba(214,168,79,0.34)',
                borderRadius: 14,
                background: 'rgba(214,168,79,0.10)',
                color: '#F3D28B',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(214,168,79,0.10)',
              }}
            >
              <LogOut size={14} />
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              title="Member login"
              aria-label="Member login"
              style={{
                width: 34, height: 34,
                border: '1px solid rgba(34,211,238,0.32)',
                borderRadius: 14,
                background: 'rgba(34,211,238,0.10)',
                color: '#8DF5EF',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(34,211,238,0.10)',
              }}
            >
              <UserRound size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {isEditorMode && <Sidebar />}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {isEditorMode && (
            <TopBar
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              isEditorMode={isEditorMode}
              onNew={() => setAddTarget(graph)}
            />
          )}

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
            <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <ArchiveGraph
                graph={graph}
                selected={selected}
                searchQuery={searchQuery}
                nodePositions={nodePositions}
                avatarUrl={avatarUrl}
                onSelectNode={selectNode}
                onToggleFolder={toggleFolder}
                onAddChild={(n) => setAddTarget(n)}
                onNodeMove={setNodePosition}
                onLabelSave={updateNodeLabel}
                onAvatarUpload={setAvatarUrl}
                onAttachFile={attachFile}
                isEditable={isEditorMode}
              />
            </main>

            {isEditorMode && (
              <InspectorPanel
                selected={selected}
                onClose={clearSelection}
                onAddChild={() => { if (selected) setAddTarget(selected.node); }}
                onToggle={() => { if (selected && selected.node.type !== 'item') toggleFolder(selected.node.id); }}
                onLabelSave={updateNodeLabel}
                onAttachFile={attachFile}
                isEditable={isEditorMode}
              />
            )}
            {!isEditorMode && (
              <PublicDetailPanel selected={selected} onClose={clearSelection} />
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      {isEditorMode && (
        <div style={{
          height: 26,
          borderTop: '1px solid rgba(148,163,184,0.14)',
          background: 'rgba(4, 12, 11, 0.86)',
          display: 'flex', alignItems: 'center',
          padding: '0 18px', gap: 18,
          flexShrink: 0,
        }}>
          {[
            '7 Primary Folders',
            'Edit Studio',
            selected ? `1 Selected: ${selected.node.label}` : 'None Selected',
          ].map((t) => (
            <span key={t} style={{ fontSize: 9, color: '#A7B8B4', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t}</span>
          ))}
        </div>
      )}

      {isEditorMode && (
        <AddNodeModal
          parentNode={addTarget}
          onClose={() => setAddTarget(null)}
          onAdd={(parentId, newNode) => { addChildNode(parentId, newNode); setAddTarget(null); }}
        />
      )}
      <MemberLoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

function MemberLoginModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (code: string) => boolean;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onLogin(code)) return;
    setError('Access code not recognized.');
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(2,7,6,0.48)',
      backdropFilter: 'blur(10px)',
    }}>
      <form onSubmit={submit} style={{
        width: 340,
        border: '1px solid rgba(34,211,238,0.24)',
        borderRadius: 22,
        background: 'rgba(7,18,17,0.94)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.34)',
        padding: 18,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 14,
            border: '1px solid rgba(34,211,238,0.30)',
            background: 'rgba(34,211,238,0.10)',
            color: '#8DF5EF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LockKeyhole size={15} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#EAFBF8', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Member Access
            </div>
            <div style={{ fontSize: 8, color: '#6F8F8A', letterSpacing: '0.10em', marginTop: 3 }}>
              Unlock edit studio
            </div>
          </div>
        </div>

        <input
          autoFocus
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
          placeholder="Access code"
          style={{
            width: '100%',
            border: '1px solid rgba(148,163,184,0.18)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.045)',
            color: '#EAFBF8',
            outline: 'none',
            padding: '12px 14px',
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ marginTop: 8, color: '#FCA5A5', fontSize: 8.5, letterSpacing: '0.08em' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" onClick={onClose} style={{
            flex: 1,
            border: '1px solid rgba(148,163,184,0.16)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.045)',
            color: '#A7B8B4',
            cursor: 'pointer',
            padding: '9px 12px',
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Cancel
          </button>
          <button type="submit" style={{
            flex: 1,
            border: '1px solid rgba(34,211,238,0.30)',
            borderRadius: 999,
            background: 'rgba(34,211,238,0.14)',
            color: '#EAFBF8',
            cursor: 'pointer',
            padding: '9px 12px',
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
