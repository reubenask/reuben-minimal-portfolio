import type { LucideIcon } from "lucide-react";

export type ArchiveNodeType = "center" | "folder" | "item";

export type ArchiveNode = {
  id: string;
  label: string;
  type: ArchiveNodeType;
  category: string;
  icon: string;
  image?: string;
  description?: string;
  period?: string;
  children?: ArchiveNode[];
  collapsed?: boolean;
};

export type FlatNode = ArchiveNode & {
  parentId?: string;
  depth: number;
};

export type NodePosition = {
  x: number;
  y: number;
  size: number;
};

export type IconLookup = Record<string, LucideIcon>;
