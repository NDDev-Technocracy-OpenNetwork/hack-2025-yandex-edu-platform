import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Course } from '../../domain/entities/Course';
import type { 
  User, 
  FileUploadState, 
  GraphFilters, 
  AppError, 
  UserRole 
} from '../../shared/types';
import { PROCESSING_STATES } from '../../shared/constants';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  
  // Courses state
  courses: Course[];
  currentCourse: Course | null;
  isCoursesLoading: boolean;
  
  // File upload state
  uploadState: FileUploadState;
  
  // UI state
  isLoading: boolean;
  error: AppError | null;
  
  // Graph state
  filters: GraphFilters;
  selectedConceptId: string | null;
  
  // Modal/overlay state
  isCreateCourseModalOpen: boolean;
  isOnboardingActive: boolean;
}

interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  logout: () => void;
  
  // Courses actions
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCoursesLoading: (loading: boolean) => void;
  
  // Upload actions
  setUploadState: (state: Partial<FileUploadState>) => void;
  resetUploadState: () => void;
  updateUploadProgress: (progress: number) => void;
  setUploadError: (error: string) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  
  // Graph actions
  setFilters: (filters: Partial<GraphFilters>) => void;
  resetFilters: () => void;
  setSelectedConcept: (conceptId: string | null) => void;
  
  // Modal actions
  openCreateCourseModal: () => void;
  closeCreateCourseModal: () => void;
  setOnboardingActive: (active: boolean) => void;
  
  // Reset actions
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  
  courses: [],
  currentCourse: null,
  isCoursesLoading: false,
  
  uploadState: {
    state: PROCESSING_STATES.IDLE,
    progress: 0,
  },
  
  isLoading: false,
  error: null,
  
  filters: {
    search: '',
    connectionTypes: ['prerequisite', 'part', 'similar', 'related'],
    bloomLevel: 'all',
  },
  selectedConceptId: null,
  
  isCreateCourseModalOpen: false,
  isOnboardingActive: false,
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // User actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          userRole: user?.role || null,
        }),
      
      setUserRole: (role) =>
        set({ userRole: role }),
      
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          userRole: null,
          courses: [],
          currentCourse: null,
        }),
      
      // Courses actions
      setCourses: (courses) =>
        set({ courses }),
      
      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, course],
        })),
      
      updateCourse: (updatedCourse) =>
        set((state) => ({
          courses: state.courses.map(course =>
            course.id === updatedCourse.id ? updatedCourse : course
          ),
          currentCourse: state.currentCourse?.id === updatedCourse.id 
            ? updatedCourse 
            : state.currentCourse,
        })),
      
      removeCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter(course => course.id !== courseId),
          currentCourse: state.currentCourse?.id === courseId 
            ? null 
            : state.currentCourse,
        })),
      
      setCurrentCourse: (course) =>
        set({ currentCourse: course }),
      
      setCoursesLoading: (loading) =>
        set({ isCoursesLoading: loading }),
      
      // Upload actions
      setUploadState: (newState) =>
        set((state) => ({
          uploadState: { ...state.uploadState, ...newState },
        })),
      
      resetUploadState: () =>
        set({
          uploadState: {
            state: PROCESSING_STATES.IDLE,
            progress: 0,
          },
        }),
      
      updateUploadProgress: (progress) =>
        set((state) => ({
          uploadState: { ...state.uploadState, progress },
        })),
      
      setUploadError: (error) =>
        set((state) => ({
          uploadState: {
            ...state.uploadState,
            state: PROCESSING_STATES.ERROR,
            error,
          },
        })),
      
      // UI actions
      setLoading: (isLoading) =>
        set({ isLoading }),
      
      setError: (error) =>
        set({ error }),
      
      clearError: () =>
        set({ error: null }),
      
      // Graph actions
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      
      resetFilters: () =>
        set({
          filters: {
            search: '',
            connectionTypes: ['prerequisite', 'part', 'similar', 'related'],
            bloomLevel: 'all',
          },
        }),
      
      setSelectedConcept: (conceptId) =>
        set({ selectedConceptId: conceptId }),
      
      // Modal actions
      openCreateCourseModal: () =>
        set({ isCreateCourseModalOpen: true }),
      
      closeCreateCourseModal: () =>
        set({
          isCreateCourseModalOpen: false,
          // Reset upload state when closing modal
          uploadState: {
            state: PROCESSING_STATES.IDLE,
            progress: 0,
          },
        }),
      
      setOnboardingActive: (active) =>
        set({ isOnboardingActive: active }),
      
      // Reset actions
      reset: () =>
        set(initialState),
    }),
    {
      name: 'app-store',
    }
  )
);

// Selectors for common state combinations
export const useAuth = () =>
  useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    userRole: state.userRole,
    setUser: state.setUser,
    logout: state.logout,
  }));

export const useCourses = () =>
  useAppStore((state) => ({
    courses: state.courses,
    currentCourse: state.currentCourse,
    isLoading: state.isCoursesLoading,
    setCourses: state.setCourses,
    addCourse: state.addCourse,
    updateCourse: state.updateCourse,
    removeCourse: state.removeCourse,
    setCurrentCourse: state.setCurrentCourse,
    setLoading: state.setCoursesLoading,
  }));

export const useUpload = () =>
  useAppStore((state) => ({
    uploadState: state.uploadState,
    setUploadState: state.setUploadState,
    resetUploadState: state.resetUploadState,
    updateProgress: state.updateUploadProgress,
    setError: state.setUploadError,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    isCreateCourseModalOpen: state.isCreateCourseModalOpen,
    isOnboardingActive: state.isOnboardingActive,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    openCreateCourseModal: state.openCreateCourseModal,
    closeCreateCourseModal: state.closeCreateCourseModal,
    setOnboardingActive: state.setOnboardingActive,
  }));

export const useGraph = () =>
  useAppStore((state) => ({
    filters: state.filters,
    selectedConceptId: state.selectedConceptId,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    setSelectedConcept: state.setSelectedConcept,
  }));