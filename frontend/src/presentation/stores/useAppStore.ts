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
export const useAuth = () => {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userRole = useAppStore((state) => state.userRole);
  const setUser = useAppStore((state) => state.setUser);
  const logout = useAppStore((state) => state.logout);

  return {
    user,
    isAuthenticated,
    userRole,
    setUser,
    logout,
  };
};

export const useCourses = () => {
  const courses = useAppStore((state) => state.courses);
  const currentCourse = useAppStore((state) => state.currentCourse);
  const isLoading = useAppStore((state) => state.isCoursesLoading);
  const setCourses = useAppStore((state) => state.setCourses);
  const addCourse = useAppStore((state) => state.addCourse);
  const updateCourse = useAppStore((state) => state.updateCourse);
  const removeCourse = useAppStore((state) => state.removeCourse);
  const setCurrentCourse = useAppStore((state) => state.setCurrentCourse);
  const setLoading = useAppStore((state) => state.setCoursesLoading);

  return {
    courses,
    currentCourse,
    isLoading,
    setCourses,
    addCourse,
    updateCourse,
    removeCourse,
    setCurrentCourse,
    setLoading,
  };
};

export const useUpload = () => {
  const uploadState = useAppStore((state) => state.uploadState);
  const setUploadState = useAppStore((state) => state.setUploadState);
  const resetUploadState = useAppStore((state) => state.resetUploadState);
  const updateProgress = useAppStore((state) => state.updateUploadProgress);
  const setError = useAppStore((state) => state.setUploadError);

  return {
    uploadState,
    setUploadState,
    resetUploadState,
    updateProgress,
    setError,
  };
};

export const useUI = () => {
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const isCreateCourseModalOpen = useAppStore((state) => state.isCreateCourseModalOpen);
  const isOnboardingActive = useAppStore((state) => state.isOnboardingActive);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);
  const openCreateCourseModal = useAppStore((state) => state.openCreateCourseModal);
  const closeCreateCourseModal = useAppStore((state) => state.closeCreateCourseModal);
  const setOnboardingActive = useAppStore((state) => state.setOnboardingActive);

  return {
    isLoading,
    error,
    isCreateCourseModalOpen,
    isOnboardingActive,
    setLoading,
    setError,
    clearError,
    openCreateCourseModal,
    closeCreateCourseModal,
    setOnboardingActive,
  };
};

export const useGraph = () => {
  const filters = useAppStore((state) => state.filters);
  const selectedConceptId = useAppStore((state) => state.selectedConceptId);
  const setFilters = useAppStore((state) => state.setFilters);
  const resetFilters = useAppStore((state) => state.resetFilters);
  const setSelectedConcept = useAppStore((state) => state.setSelectedConcept);

  return {
    filters,
    selectedConceptId,
    setFilters,
    resetFilters,
    setSelectedConcept,
  };
};