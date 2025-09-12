import { useState, useEffect, useCallback } from 'react';
import { apiTeacherRepository, type TeacherAnalytics, type StudentActivity } from '../../infrastructure/repositories/ApiTeacherRepository';
import type { Course } from '../../domain/entities/Course';
import { useCourses, useUI } from '../stores/useAppStore';

export const useTeacherCourses = () => {
  const { courses, setCourses, setLoading } = useCourses();
  const { setError } = useUI();
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const teacherCourses = await apiTeacherRepository.getCourses();
      setCourses(teacherCourses);
      setIsInitialized(true);
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Failed to load courses',
        code: 'FETCH_COURSES_ERROR'
      });
      setIsInitialized(true); // Still mark as initialized to prevent retry loops
    } finally {
      setLoading(false);
    }
  }, [setCourses, setLoading, setError]);

  useEffect(() => {
    if (!isInitialized) {
      fetchCourses();
    }
  }, [isInitialized, fetchCourses]);

  const refreshCourses = useCallback(() => {
    setIsInitialized(false); // Reset to trigger refetch
  }, []);

  return {
    courses,
    refreshCourses,
    isLoading: false // handled by store
  };
};

export const useTeacherAnalytics = () => {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setError } = useUI();

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiTeacherRepository.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Failed to load analytics',
        code: 'FETCH_ANALYTICS_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, isLoading };
};

export const useTeacherActivity = () => {
  const [activity, setActivity] = useState<StudentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setError } = useUI();

  const fetchActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiTeacherRepository.getRecentActivity();
      setActivity(data);
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Failed to load activity',
        code: 'FETCH_ACTIVITY_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, isLoading };
};

export const useCourseCreation = () => {
  const { addCourse } = useCourses();
  const { setError, setLoading } = useUI();
  const [isCreating, setIsCreating] = useState(false);

  const createCourse = useCallback(async (title: string, description: string, complexity: 'simple' | 'complex' = 'simple') => {
    try {
      setIsCreating(true);
      setLoading(true);
      
      const newCourse = await apiTeacherRepository.createCourse({
        title,
        description,
        complexity_level: complexity === 'complex' ? 'complex' : 'simple',
        difficulty: 'Beginner'
      });
      
      addCourse(newCourse);
      return newCourse;
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Failed to create course',
        code: 'CREATE_COURSE_ERROR'
      });
      throw error;
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  }, [addCourse, setError, setLoading]);

  const uploadFiles = useCallback(async (courseId: string, files: File[], complexity: 'simple' | 'complex' = 'simple') => {
    try {
      setLoading(true);
      
      const result = await apiTeacherRepository.uploadFiles(courseId, files, complexity);
      return result;
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Failed to upload files',
        code: 'UPLOAD_FILES_ERROR'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  return {
    createCourse,
    uploadFiles,
    isCreating
  };
};