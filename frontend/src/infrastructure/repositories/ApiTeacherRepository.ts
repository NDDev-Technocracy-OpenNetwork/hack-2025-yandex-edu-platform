import { apiClient } from '../api/client';
import type { Course } from '../../domain/entities/Course';

export interface TeacherAnalytics {
  totalStudents: number;
  activeCourses: number;
  avgCompletion: number;
  totalInteractions: number;
}

export interface StudentActivity {
  type: 'completion' | 'question' | 'progress';
  student: string;
  course: string;
  time: string;
}

export interface CourseCreationRequest {
  title: string;
  description: string;
}

export interface FileUploadResponse {
  courseId: string;
  status: string;
  message: string;
}

export class ApiTeacherRepository {
  async getCourses(): Promise<Course[]> {
    return apiClient.get<Course[]>('/teacher/courses');
  }

  async getAnalytics(): Promise<TeacherAnalytics> {
    return apiClient.get<TeacherAnalytics>('/teacher/analytics');
  }

  async getRecentActivity(): Promise<StudentActivity[]> {
    return apiClient.get<StudentActivity[]>('/teacher/activity');
  }

  async createCourse(data: CourseCreationRequest): Promise<Course> {
    return apiClient.post<Course>('/teacher/courses', data);
  }

  async uploadFiles(courseId: string, files: File[], complexity: 'simple' | 'complex' = 'simple'): Promise<FileUploadResponse> {
    return apiClient.uploadFilesWithComplexity(`/teacher/courses/${courseId}/upload`, files, complexity);
  }

  async getCourseById(courseId: string): Promise<Course> {
    return apiClient.get<Course>(`/teacher/courses/${courseId}`);
  }

  async updateCourse(courseId: string, data: Partial<Course>): Promise<Course> {
    return apiClient.put<Course>(`/teacher/courses/${courseId}`, data);
  }

  async deleteCourse(courseId: string): Promise<void> {
    return apiClient.delete(`/teacher/courses/${courseId}`);
  }

  async publishCourse(courseId: string): Promise<Course> {
    return apiClient.post<Course>(`/teacher/courses/${courseId}/publish`);
  }
}

export const apiTeacherRepository = new ApiTeacherRepository();