import { BloomLevel, ConnectionType } from '../../shared/types';

export interface GraphNode {
  id: string;
  title: string;
  description?: string;
  type: 'concept' | 'topic' | 'subtopic';
  level: number;
  bloomLevel?: BloomLevel;
  keywords?: string[];
  x?: number;
  y?: number;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphFilters {
  search: string;
  connectionTypes: ConnectionType[];
  bloomLevel: BloomLevel | 'all';
}