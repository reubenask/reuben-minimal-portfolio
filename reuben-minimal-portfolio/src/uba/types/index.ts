export interface FileAttachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  // File content NOT stored in localStorage — attach via backend in production
  // dataUrl is kept in memory only for the current session
  dataUrl?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'center' | 'folder' | 'item';
  category: string;
  icon: string;
  image?: string;
  description?: string;
  children?: GraphNode[];
  collapsed?: boolean;
  files?: FileAttachment[];          // attached documents per node
  weight?: number;                   // visual sizing weight (1=item, 2=folder, 3=center)
  content?: {
    kind: 'article';
    slug: string;
    title: string;
    date?: string;
    readingTime?: string;
  };
}

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  children?: PositionedNode[];
}

export interface SelectedNode {
  node: GraphNode;
  parentId?: string;
}
