import { useState, useEffect } from 'react';
import { apiClient } from '../../infrastructure/api/client';

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

export const useStudentCourses = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    completed_courses: 0,
    learning_hours: 0,
    studied_concepts: 0,
    built_connections: 0,
    active_courses: 0,
    average_progress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get<StudentCourse[]>('/student/courses');
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const getCourseDetails = async (courseId: number): Promise<StudentCourse | null> => {
    try {
      const data = await apiClient.get<StudentCourse>(`/student/courses/${courseId}`);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      return null;
    }
  };

  const markConceptCompleted = async (courseId: number, conceptId: number): Promise<boolean> => {
    try {
      const response = await apiClient.post<{
        message: string;
        progress_percentage: number;
        completed_concepts: number;
      }>(`/student/courses/${courseId}/progress/concept/${conceptId}`);
      
      // Update local state
      setCourses(prev => prev.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            progress_percentage: response.progress_percentage,
            completed_concepts: response.completed_concepts,
            concepts: course.concepts.map(concept => 
              concept.id === conceptId ? { ...concept, is_completed: true } : concept
            )
          };
        }
        return course;
      }));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark concept as completed');
      return false;
    }
  };

  const fetchStudentStats = async () => {
    try {
      const data = await apiClient.get<StudentStats>('/student/stats');
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student stats');
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchStudentCourses();
    fetchStudentStats();
  }, []);

  return {
    courses,
    stats,
    loading,
    error,
    fetchStudentCourses,
    getCourseDetails,
    markConceptCompleted,
    fetchStudentStats,
    clearError: () => setError(null)
  };
};