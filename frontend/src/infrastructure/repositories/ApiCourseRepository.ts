import { Course } from '../../domain/entities/Course';
import { CourseId } from '../../domain/value-objects/CourseId';
import { CourseRepository, FileUploadRepository, UserRepository } from '../../domain/repositories/CourseRepository';
import { ApiResponse, User as UserType } from '../../shared/types';
import { apiClient } from '../api/client';

// API Response types
interface ApiCourse {
  id: number;
  title: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  complexity_level: 'simple' | 'complex';
  status: 'draft' | 'processing' | 'ready_for_edit' | 'published';
  creator_id: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  concepts: ApiConcept[];
  connections: ApiConnection[];
}

interface ApiConcept {
  id: number;
  title: string;
  description?: string;
  content?: string;
  bloom_level: string;
  position_x: number;
  position_y: number;
  course_id: number;
  created_at: string;
  updated_at: string;
}

interface ApiConnection {
  id: number;
  source_concept_id: number;
  target_concept_id: number;
  connection_type: string;
  strength: number;
  course_id: number;
  created_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  created_at: string;
}

export class ApiCourseRepository implements CourseRepository {
  
  async findById(id: CourseId): Promise<Course | null> {
    try {
      const apiCourse = await apiClient.get<ApiCourse>(`/courses/${id.value}`);
      return this.convertApiCourseToDomain(apiCourse);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async findAll(): Promise<Course[]> {
    try {
      const apiCourses = await apiClient.get<ApiCourse[]>('/courses');
      return apiCourses.map(course => this.convertApiCourseToDomain(course));
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  async findByCreatedBy(userId: string): Promise<Course[]> {
    try {
      const apiCourses = await apiClient.get<ApiCourse[]>('/courses/my');
      return apiCourses.map(course => this.convertApiCourseToDomain(course));
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return [];
    }
  }

  async save(course: Course): Promise<ApiResponse<Course>> {
    try {
      const courseData = {
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        complexity_level: 'simple' // Default for now
      };

      let apiCourse: ApiCourse;
      
      if (course.id === 'new' || !course.id) {
        // Create new course
        apiCourse = await apiClient.post<ApiCourse>('/courses', courseData);
      } else {
        // Update existing course
        apiCourse = await apiClient.put<ApiCourse>(`/courses/${course.id}`, courseData);
      }

      return {
        success: true,
        data: this.convertApiCourseToDomain(apiCourse)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to save course'
        }
      };
    }
  }

  async delete(id: CourseId): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/courses/${id.value}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete course'
        }
      };
    }
  }

  async exists(id: CourseId): Promise<boolean> {
    try {
      await apiClient.get(`/courses/${id.value}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async search(query: string): Promise<Course[]> {
    try {
      const apiCourses = await apiClient.get<ApiCourse[]>(`/courses?search=${encodeURIComponent(query)}`);
      return apiCourses.map(course => this.convertApiCourseToDomain(course));
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  async publishCourse(courseId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/courses/${courseId}/publish`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to publish course'
        }
      };
    }
  }

  private convertApiCourseToDomain(apiCourse: ApiCourse): Course {
    // Convert concepts
    const concepts = apiCourse.concepts?.map(apiConcept => ({
      id: apiConcept.id.toString(),
      title: apiConcept.title,
      description: apiConcept.description || '',
      bloomLevel: apiConcept.bloom_level as any,
      position: { x: apiConcept.position_x, y: apiConcept.position_y },
      progress: 0, // Default progress
      comments: [] // Empty comments for now
    })) || [];

    // Convert connections
    const connections = apiCourse.connections?.map(apiConn => ({
      id: apiConn.id.toString(),
      sourceId: apiConn.source_concept_id.toString(),
      targetId: apiConn.target_concept_id.toString(),
      type: apiConn.connection_type as any,
      strength: apiConn.strength
    })) || [];

    return new Course(
      apiCourse.id.toString(),
      apiCourse.title,
      apiCourse.description || '',
      apiCourse.creator_id.toString(),
      new Date(apiCourse.created_at),
      new Date(apiCourse.updated_at),
      apiCourse.difficulty,
      concepts,
      connections
    );
  }
}

export class ApiFileUploadRepository implements FileUploadRepository {
  
  async upload(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<string>> {
    try {
      // For now, we need a course ID to upload files
      // This should be modified based on your flow
      throw new Error('Course ID required for file upload');
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Upload failed'
        }
      };
    }
  }

  async uploadFilesToCourse(courseId: string, files: File[]): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.uploadFiles(`/files/${courseId}/upload`, files);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Upload failed'
        }
      };
    }
  }

  async generateGraph(fileId: string): Promise<ApiResponse<{ concepts: any[], connections: any[] }>> {
    try {
      const response = await apiClient.post(`/files/${fileId}/generate-graph`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Graph generation failed'
        }
      };
    }
  }

  async generateGraphForCourse(courseId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/files/${courseId}/generate-graph`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Graph generation failed'
        }
      };
    }
  }

  async generateContentForCourse(courseId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/files/${courseId}/generate-content`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Content generation failed'
        }
      };
    }
  }

  async getUploadStatus(fileId: string): Promise<ApiResponse<{ status: string, progress: number }>> {
    try {
      const response = await apiClient.get(`/files/${fileId}/status`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Status check failed'
        }
      };
    }
  }
}

export class ApiUserRepository implements UserRepository {
  
  async getCurrentUser(): Promise<ApiResponse<{ id: string, name: string, email: string, role: string }>> {
    try {
      const user = await apiClient.get<UserResponse>('/user/me');
      return {
        success: true,
        data: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get user'
        }
      };
    }
  }

  async login(credentials: { email: string, password: string }): Promise<ApiResponse<string>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      apiClient.setToken(response.access_token);
      
      return {
        success: true,
        data: response.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Login failed'
        }
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      apiClient.clearToken();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Logout failed'
        }
      };
    }
  }

  async register(userData: { email: string, name: string, password: string, role: 'teacher' | 'student' }): Promise<ApiResponse<UserType>> {
    try {
      const user = await apiClient.post<UserResponse>('/auth/register', userData);
      
      return {
        success: true,
        data: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as any
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Registration failed'
        }
      };
    }
  }
}