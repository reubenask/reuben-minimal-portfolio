import { useState } from 'react';
import { Sidebar }        from './Sidebar';
import { TopBar }         from './TopBar';
import { ArchiveGraph }   from './ArchiveGraph';
import { InspectorPanel } from './InspectorPanel';
import { AddNodeModal }   from './AddNodeModal';
import { useGraph }       from './hooks/useGraph';
import type { GraphNode } from './types';

export function UbaArchive() {
  const [isEditorMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'edit' || params.get('studio') === 'edit';
  });

  const {
    graph, selected, searchQuery, setSearchQuery,
    toggleFolder, selectNode, clearSelection, addChildNode,
    updateNodeLabel, nodePositions, setNodePosition,
    avatarUrl, setAvatarUrl,
    attachFile,
  } = useGraph();

  const [addTarget, setAddTarget] = useState<GraphNode | null>(null);

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
        height: 52,
        background: 'rgba(4, 12, 11, 0.82)',
        borderBottom: '1px solid rgba(148,163,184,0.16)',
        display: 'flex', alignItems: 'center',
        padding: '0 18px',
        flexShrink: 0,
        gap: 14,
        backdropFilter: 'blur(18px)',
      }}>
        <div style={{
          width: 38, height: 30,
          border: '1px solid rgba(34,211,238,0.36)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, letterSpacing: 1,
          color: '#8DF5EF', background: 'rgba(34,211,238,0.10)',
          fontFamily: "'IBM Plex Mono', monospace",
          boxShadow: '0 0 28px rgba(34,211,238,0.12)',
        }}>UBA</div>

        <div style={{ flex: 1, textAlign: 'left', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.34em', color: '#EAFBF8', textTransform: 'uppercase',
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          User Behavior Archive <span style={{ color: '#6F8F8A', fontWeight: 400, letterSpacing: '0.14em' }}>
            · {isEditorMode ? 'Edit Studio' : 'Public Knowledge Graph'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginRight: 52 }}>
          {['●', '●', '●'].map((c, i) => (
            <div key={i} style={{
              width: 9, height: 9,
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '999px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 0,
              cursor: 'default',
              background: i === 0 ? '#D6A84F' : i === 1 ? '#22D3EE' : '#2DD4BF',
              color: 'transparent', fontFamily: 'monospace',
              userSelect: 'none',
            }}>{c}</div>
          ))}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {isEditorMode && <Sidebar />}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TopBar
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            isEditorMode={isEditorMode}
            onNew={() => setAddTarget(graph)}
          />

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

            <InspectorPanel
              selected={selected}
              onClose={clearSelection}
              onAddChild={() => { if (selected) setAddTarget(selected.node); }}
              onToggle={() => { if (selected && selected.node.type !== 'item') toggleFolder(selected.node.id); }}
              onLabelSave={updateNodeLabel}
              onAttachFile={attachFile}
              isEditable={isEditorMode}
            />
          </div>
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
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
          isEditorMode ? 'Edit Studio' : 'Public Profile View',
          selected ? `1 Selected: ${selected.node.label}` : 'None Selected',
        ].map((t) => (
          <span key={t} style={{ fontSize: 9, color: '#A7B8B4', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t}</span>
        ))}
      </div>

      {isEditorMode && (
        <AddNodeModal
          parentNode={addTarget}
          onClose={() => setAddTarget(null)}
          onAdd={(parentId, newNode) => { addChildNode(parentId, newNode); setAddTarget(null); }}
        />
      )}
    </div>
  );
}
