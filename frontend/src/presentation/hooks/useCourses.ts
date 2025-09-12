import { useState, useEffect } from 'react';
import { apiClient } from '../../infrastructure/api/client';

export interface ApiCourse {
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

export interface ApiConcept {
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

export interface ApiConnection {
  id: number;
  source_concept_id: number;
  target_concept_id: number;
  connection_type: string;
  strength: number;
  course_id: number;
  created_at: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (role: 'student' | 'teacher' = 'student') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get<ApiCourse[]>(`/courses?role=${role}`);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const getCourse = async (courseId: number): Promise<ApiCourse | null> => {
    try {
      const data = await apiClient.get<ApiCourse>(`/courses/${courseId}`);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course');
      return null;
    }
  };

  const createCourse = async (courseData: {
    title: string;
    description?: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    complexity_level: 'simple' | 'complex';
  }): Promise<ApiCourse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.post<ApiCourse>('/courses', courseData);
      setCourses(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (
    courseId: number, 
    courseData: Partial<{
      title: string;
      description: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      complexity_level: 'simple' | 'complex';
    }>
  ): Promise<ApiCourse | null> => {
    try {
      const data = await apiClient.put<ApiCourse>(`/courses/${courseId}`, courseData);
      setCourses(prev => prev.map(course => course.id === courseId ? data : course));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
      return null;
    }
  };

  const deleteCourse = async (courseId: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/courses/${courseId}`);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      return false;
    }
  };

  const publishCourse = async (courseId: number): Promise<boolean> => {
    try {
      await apiClient.post(`/courses/${courseId}/publish`);
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, status: 'published' as const } : course
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish course');
      return false;
    }
  };

  const uploadFiles = async (courseId: number, files: File[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.uploadFiles(`/files/${courseId}/upload`, files);
      // Update course status to processing
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, status: 'processing' as const } : course
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateGraph = async (courseId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(`/files/${courseId}/generate-graph`);
      // Update course status
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, status: 'ready_for_edit' as const } : course
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate graph');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (courseId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(`/files/${courseId}/generate-content`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateConcept = async (
    courseId: number,
    conceptId: number,
    conceptData: Partial<{
      title: string;
      description: string;
      content: string;
      bloom_level: string;
      position_x: number;
      position_y: number;
    }>
  ): Promise<boolean> => {
    try {
      await apiClient.put(`/courses/${courseId}/concepts/${conceptId}`, conceptData);
      // Refresh the course to get updated concepts
      const updatedCourse = await getCourse(courseId);
      if (updatedCourse) {
        setCourses(prev => prev.map(course => 
          course.id === courseId ? updatedCourse : course
        ));
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update concept');
      return false;
    }
  };

  const updateConnection = async (
    courseId: number,
    connectionId: number,
    connectionData: Partial<{
      connection_type: string;
      strength: number;
    }>
  ): Promise<boolean> => {
    try {
      await apiClient.put(`/courses/${courseId}/connections/${connectionId}`, connectionData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection');
      return false;
    }
  };

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    uploadFiles,
    generateGraph,
    generateContent,
    updateConcept,
    updateConnection,
    clearError: () => setError(null)
  };
};