import {
  USER_ROLES,
  PROCESSING_STATES,
  CONNECTION_TYPES,
  BLOOM_LEVELS,
  FILE_UPLOAD,
} from '../constants';

// Base types
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type ProcessingState = typeof PROCESSING_STATES[keyof typeof PROCESSING_STATES];
export type ConnectionType = typeof CONNECTION_TYPES[keyof typeof CONNECTION_TYPES];
export type BloomLevel = typeof BLOOM_LEVELS[keyof typeof BLOOM_LEVELS];
export type AllowedFileType = typeof FILE_UPLOAD.ALLOWED_TYPES[number];

// Domain entity types
export interface Course {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  progress?: CourseProgress;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  concepts: Concept[];
  connections: ConceptConnection[];
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  bloomLevel: BloomLevel;
  position: Position;
  progress: number;
  comments: ConceptComment[];
}

export interface ConceptConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  strength: number;
}

export interface ConceptComment {
  id: string;
  conceptId: string;
  text: string;
  authorId: string;
  createdAt: Date;
}

export interface CourseProgress {
  completed: number;
  total: number;
  currentConcept?: string;
}

export interface Position {
  x: number;
  y: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// File upload types
export interface FileUploadState {
  state: ProcessingState;
  progress: number;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  fileId?: string;
  error?: string;
}

export interface GenerateGraphResponse {
  success: boolean;
  courseId?: string;
  concepts?: Concept[];
  connections?: ConceptConnection[];
  error?: string;
}

// UI component types
export interface CourseCardProps {
  course: Course;
  onContinue: (courseId: string) => void;
  onLearnMore: (courseId: string) => void;
}

export interface GraphNodeData {
  id: string;
  title: string;
  description: string;
  bloomLevel: BloomLevel;
  progress: number;
  x: number;
  y: number;
}

export interface GraphConnectionData {
  source: string;
  target: string;
  type: ConnectionType;
  strength: number;
}

// Filter and search types
export interface GraphFilters {
  search: string;
  connectionTypes: ConnectionType[];
  bloomLevel: BloomLevel | 'all';
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// State management types
export interface AppState {
  user: User | null;
  courses: Course[];
  currentCourse: Course | null;
  uploadState: FileUploadState;
  filters: GraphFilters;
  isLoading: boolean;
  error: AppError | null;
}

// Form types
export interface CreateCourseForm {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ConceptEditForm {
  title: string;
  description: string;
  bloomLevel: BloomLevel;
}

// Navigation types
export interface RouteParams {
  courseId?: string;
  conceptId?: string;
}