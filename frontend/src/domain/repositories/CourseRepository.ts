import { Course } from '../entities/Course';
import { CourseId } from '../value-objects/CourseId';
import { ApiResponse } from '../../shared/types';

export interface CourseRepository {
  findById(id: CourseId): Promise<Course | null>;
  
  findAll(): Promise<Course[]>;
  
  findByCreatedBy(userId: string): Promise<Course[]>;
  
  save(course: Course): Promise<ApiResponse<Course>>;
  
  delete(id: CourseId): Promise<ApiResponse<void>>;
  
  exists(id: CourseId): Promise<boolean>;
  
  search(query: string): Promise<Course[]>;
}

export interface FileUploadRepository {
  upload(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<string>>;
  
  generateGraph(fileId: string): Promise<ApiResponse<{ concepts: any[], connections: any[] }>>;
  
  getUploadStatus(fileId: string): Promise<ApiResponse<{ status: string, progress: number }>>;
}

export interface UserRepository {
  getCurrentUser(): Promise<ApiResponse<{ id: string, name: string, email: string, role: string }>>;
  
  login(credentials: { email: string, password: string }): Promise<ApiResponse<string>>;
  
  logout(): Promise<ApiResponse<void>>;
}