import { apiClient } from '../api/client';

export interface StudentCourse {
  id: number;
  title: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  created_at: string;
  published_at?: string;
  concepts: StudentConcept[];
  connections: StudentConnection[];
  progress_percentage: number;
  total_concepts: number;
  completed_concepts: number;
}

export interface StudentConcept {
  id: number;
  title: string;
  description?: string;
  content?: string;
  bloom_level: string;
  position_x: number;
  position_y: number;
  is_completed: boolean;
}

export interface StudentConnection {
  id: number;
  source_concept_id: number;
  target_concept_id: number;
  connection_type: 'prerequisite' | 'part' | 'similar' | 'related';
  strength: number;
}

export interface StudentStats {
  completed_courses: number;
  learning_hours: number;
  studied_concepts: number;
  built_connections: number;
  active_courses: number;
  average_progress: number;
}

export class ApiStudentRepository {
  
  async getPublishedCourses(): Promise<StudentCourse[]> {
    try {
      const courses = await apiClient.get<StudentCourse[]>('/student/courses');
      return courses;
    } catch (error) {
      console.error('Error fetching student courses:', error);
      return [];
    }
  }

  async getCourseDetails(courseId: number): Promise<StudentCourse | null> {
    try {
      const course = await apiClient.get<StudentCourse>(`/student/courses/${courseId}`);
      return course;
    } catch (error) {
      console.error('Error fetching course details:', error);
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async markConceptCompleted(courseId: number, conceptId: number): Promise<{ success: boolean; message?: string; progress_percentage?: number }> {
    try {
      const response = await apiClient.post<{ message?: string; progress_percentage?: number }>(`/student/courses/${courseId}/progress/concept/${conceptId}`);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark concept as completed'
      };
    }
  }

  async getStudentStats(): Promise<StudentStats> {
    try {
      const stats = await apiClient.get<StudentStats>('/student/stats');
      return stats;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        completed_courses: 0,
        learning_hours: 0,
        studied_concepts: 0,
        built_connections: 0,
        active_courses: 0,
        average_progress: 0
      };
    }
  }
}
