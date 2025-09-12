import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '../common/Header';
import { Footer } from '../common/Footer';
import { useTeacherCourses, useTeacherAnalytics, useTeacherActivity } from '../../hooks/useTeacher';
import { useUI } from '../../stores/useAppStore';
import { CourseCreationModal } from '../features/CourseCreationModal';
import { ConfirmationModal } from '../features/ConfirmationModal';
import { CourseConceptsModal } from '../features/CourseConceptsModal';
import { Course } from '../../../domain/entities/Course';
import { apiClient } from '../../../infrastructure/api/client';

interface TeacherPageProps {
  onBack?: () => void;
}

export const TeacherPage: React.FC<TeacherPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'analytics' | 'library'>('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseName: string;
  }>({
    isOpen: false,
    courseId: '',
    courseName: ''
  });
  const [conceptsModal, setConceptsModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseTitle: string;
  }>({
    isOpen: false,
    courseId: '',
    courseTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { courses, refreshCourses } = useTeacherCourses();
  const { analytics } = useTeacherAnalytics();
  const { activity } = useTeacherActivity();
  const { isCreateCourseModalOpen, openCreateCourseModal, closeCreateCourseModal, setError } = useUI();

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    openCreateCourseModal();
  };

  const handleCloseModal = () => {
    setEditingCourse(null);
    closeCreateCourseModal();
  };

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    setConfirmationModal({
      isOpen: true,
      courseId,
      courseName
    });
  };

  const handleViewConcepts = (courseId: string, courseTitle: string) => {
    setConceptsModal({
      isOpen: true,
      courseId,
      courseTitle
    });
  };

  const confirmDeleteCourse = async () => {
    if (!confirmationModal.courseId) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/teacher/courses/${confirmationModal.courseId}`);
      await refreshCourses(); // Refresh courses list
      setError({ message: 'Курс успешно удален', code: 'SUCCESS' });
    } catch (error) {
      setError({ message: 'Не удалось удалить курс', code: 'DELETE_ERROR' });
    } finally {
      setIsDeleting(false);
      setConfirmationModal({ isOpen: false, courseId: '', courseName: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50 border-green-200';
      case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'question':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'progress':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/80 to-gray-50 flex flex-col">
      <SimpleHeader title="Преподаватель" onBack={onBack} />
      
      <div className="py-8 pt-20 flex-grow">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Панель преподавателя 👨‍🏫
            </h1>
            <p className="text-gray-600 text-lg">
              Создавайте интерактивные курсы и отслеживайте прогресс студентов
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics?.totalStudents || 0}</div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Всего студентов</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics?.activeCourses || 0}</div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Активных курсов</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics?.avgCompletion || 0}%</div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Среднее завершение</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics?.totalInteractions?.toLocaleString() || 0}</div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Взаимодействий</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === 'courses'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Мои курсы
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Аналитика
                </button>
                <button
                  onClick={() => setActiveTab('library')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === 'library'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Библиотека материалов
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'courses' && (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Course List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Управление курсами</h2>
                      <p className="text-gray-600 text-sm">Создавайте и редактируйте образовательный контент</p>
                    </div>
                    <button 
                      onClick={openCreateCourseModal}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                    >
                      + Создать курс
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {courses && courses.length > 0 ? (
                      courses.map((course) => {
                        const isPublished = course.concepts.length > 0; // Consider course published if it has concepts
                        const activeConcepts = course.concepts?.filter((c: any) => !c.isDeleted) || [];
                        const hasDescriptions = activeConcepts.some((c: any) => c.description && c.description.trim() !== '');
                        const progressPercentage = course.progress?.completed || 0;
                        const lastUpdated = new Date(course.updatedAt).toLocaleDateString('ru-RU');
                        
                        return (
                          <div key={course.id} className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                            
                            {/* Course Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-grow">
                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                  {course.title}
                                </h3>
                                
                                {course.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                                )}
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    {course.concepts.length} концепций
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    {course.connections.length} связей
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    {course.difficulty}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(isPublished ? 'published' : 'draft')}`}>
                                  {isPublished ? 'Опубликован' : 'Черновик'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Progress */}
                            {isPublished && progressPercentage > 0 && (
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Прогресс курса</span>
                                  <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {/* Course Footer */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Обновлен: {lastUpdated}</span>
                              
                              <div className="flex items-center space-x-2">
                                {/* Редактировать - всегда доступно */}
                                <button 
                                  onClick={() => handleEditCourse(course)}
                                  className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                                >
                                  Редактировать
                                </button>
                                
                                {/* Концепты - активно, если есть концепты */}
                                <button 
                                  onClick={course.concepts.length > 0 ? () => handleViewConcepts(course.id, course.title) : undefined}
                                  disabled={course.concepts.length === 0}
                                  className={`px-3 py-1 text-xs border rounded-lg transition-colors duration-300 ${
                                    course.concepts.length > 0 
                                      ? 'text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer' 
                                      : 'text-gray-400 border-gray-200 cursor-not-allowed'
                                  }`}
                                >
                                  Концепты
                                </button>
                                
                                {/* Граф - доступно если есть описания концептов */}
                                <button 
                                  disabled={!hasDescriptions}
                                  onClick={() => hasDescriptions && navigate(`/course/${course.id}/graph`)}
                                  className={`px-3 py-1 text-xs border rounded-lg transition-colors duration-300 ${
                                    hasDescriptions 
                                      ? 'text-purple-600 border-purple-300 hover:bg-purple-50 cursor-pointer' 
                                      : 'text-gray-400 border-gray-200 cursor-not-allowed'
                                  }`}
                                >
                                  Граф
                                </button>
                                
                                {/* Аналитика - активно, если опубликован */}
                                <button 
                                  disabled={!isPublished}
                                  className={`px-3 py-1 text-xs border rounded-lg transition-colors duration-300 ${
                                    isPublished 
                                      ? 'text-green-600 border-green-300 hover:bg-green-50 cursor-pointer' 
                                      : 'text-gray-400 border-gray-200 cursor-not-allowed'
                                  }`}
                                >
                                  Аналитика
                                </button>
                                
                                {/* Удалить - всегда доступно */}
                                <button 
                                  onClick={() => handleDeleteCourse(course.id, course.title)}
                                  className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-300"
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет курсов</h3>
                        <p className="text-gray-600 mb-4">Создайте свой первый курс, загрузив образовательные материалы</p>
                        <button 
                          onClick={openCreateCourseModal}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Создать первый курс
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Быстрые действия</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={openCreateCourseModal}
                      className="w-full p-3 text-left border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Создать курс</div>
                          <div className="text-xs text-gray-600">Загрузить документы</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full p-3 text-left border border-gray-100 rounded-lg hover:border-green-200 hover:bg-green-50/30 transition-all duration-300">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Отчеты</div>
                          <div className="text-xs text-gray-600">Аналитика курсов</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Последняя активность</h3>
                  <div className="space-y-4">
                    {activity && activity.length > 0 ? (
                      activity.map((activityItem, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          {getActivityIcon(activityItem.type)}
                          <div className="flex-grow">
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{activityItem.student}</span>
                              {activityItem.type === 'completion' && ' завершил курс '}
                              {activityItem.type === 'question' && ' задал вопрос в '}
                              {activityItem.type === 'progress' && ' продвинулся в '}
                              <span className="font-medium">{activityItem.course}</span>
                            </p>
                            <p className="text-xs text-gray-500">{activityItem.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Нет недавней активности</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Подробная аналитика</h3>
              <p className="text-gray-600 mb-6">Детальные отчеты и метрики эффективности курсов будут доступны в следующей версии</p>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
                Запросить доступ
              </button>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Библиотека материалов</h3>
              <p className="text-gray-600 mb-6">Шаблоны курсов, готовые материалы и ресурсы для создания образовательного контента</p>
              <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                Обзор материалов
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      
      <CourseCreationModal
        isOpen={isCreateCourseModalOpen}
        onClose={handleCloseModal}
        onCourseCreated={refreshCourses}
        editingCourse={editingCourse}
      />

      {/* Course Concepts Modal */}
      <CourseConceptsModal
        isOpen={conceptsModal.isOpen}
        onClose={() => setConceptsModal({ isOpen: false, courseId: '', courseTitle: '' })}
        courseId={conceptsModal.courseId}
        courseTitle={conceptsModal.courseTitle}
      />

      {/* Course Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, courseId: '', courseName: '' })}
        onConfirm={confirmDeleteCourse}
        title="Удалить курс"
        message={`Вы уверены, что хотите удалить курс "${confirmationModal.courseName}"? Будут удалены все файлы, концепты и связи. Это действие нельзя отменить.`}
        confirmText="Удалить курс"
        cancelText="Отмена"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};