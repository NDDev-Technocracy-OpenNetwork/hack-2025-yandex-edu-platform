import React, { useEffect } from 'react';
import { SimpleHeader } from '../common/Header';
import { Footer } from '../common/Footer';
import { useStudentCourses } from '../../hooks/useStudentCourses';

interface StudentPageProps {
  onBack?: () => void;
}

export const StudentPage: React.FC<StudentPageProps> = ({ onBack }) => {
  const { courses, stats, loading, error, markConceptCompleted, clearError } = useStudentCourses();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const statsFormatted = [
    { label: 'Завершено курсов', value: stats.completed_courses.toString(), icon: '🎓' },
    { label: 'Часов обучения', value: stats.learning_hours.toString(), icon: '⏱️' },
    { label: 'Изучено понятий', value: stats.studied_concepts.toString(), icon: '🧠' },
    { label: 'Построено связей', value: stats.built_connections.toString(), icon: '🔗' }
  ];

  // Mock recommendations for now
  const recommendations = [
    {
      title: 'Дополнительные курсы',
      reason: 'Скоро будут доступны',
      difficulty: 'Различный',
      nodes: 0
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'Начальный';
      case 'Intermediate': return 'Средний';
      case 'Advanced': return 'Продвинутый';
      default: return difficulty;
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/80 to-gray-50 flex flex-col">
        <SimpleHeader title="Студент" onBack={onBack} />
        <div className="py-8 pt-20 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка курсов...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/80 to-gray-50 flex flex-col">
        <SimpleHeader title="Студент" onBack={onBack} />
        <div className="py-8 pt-20 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={clearError}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Повторить
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/80 to-gray-50 flex flex-col">
      <SimpleHeader title="Студент" onBack={onBack} />
      
      <div className="py-8 pt-20 flex-grow">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать в YaGraph! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Изучайте материалы через интерактивные графы знаний
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsFormatted.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Current Courses */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Текущие курсы</h2>
                  <p className="text-gray-600 text-sm">Продолжите изучение материалов</p>
                </div>
                
                <div className="p-6 space-y-4">
                  {courses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Пока нет доступных курсов</h3>
                      <p className="text-gray-600 text-sm">Курсы появятся здесь, когда преподаватели их опубликуют</p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                        
                        {/* Course Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                              {course.title}
                            </h3>
                            
                            {course.description && (
                              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
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
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                              {getDifficultyText(course.difficulty)}
                            </span>
                            
                            {course.progress_percentage >= 100 && (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {course.progress_percentage < 100 && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Прогресс</span>
                              <span className="text-sm font-medium text-gray-900">{Math.round(course.progress_percentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Course Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>Опубликован: {formatDate(course.published_at || course.created_at)}</span>
                            <span>Пройдено: {course.completed_concepts}/{course.total_concepts}</span>
                          </div>
                          
                          <button 
                            onClick={() => {
                              // TODO: Navigate to course detail view
                              alert(`Откроется курс: ${course.title}`);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform group-hover:scale-105"
                          >
                            {course.progress_percentage >= 100 ? 'Повторить' : 'Продолжить'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Learning Path */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </span>
                  Учебная траектория
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Основы программирования</div>
                      <div className="text-xs text-gray-600">Завершено</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Алгоритмы и структуры данных</div>
                      <div className="text-xs text-gray-600">В процессе</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600 text-sm">Системное программирование</div>
                      <div className="text-xs text-gray-500">Заблокировано</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Рекомендации
                </h3>
                
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300">
                      <h4 className="font-medium text-gray-900 text-sm mb-2">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mb-3">{rec.reason}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(rec.difficulty)}`}>
                            {rec.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{rec.nodes} узлов</span>
                        </div>
                        
                        <button className="text-xs text-orange-600 font-medium hover:text-orange-700">
                          Начать →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">🏆</div>
                  <div>
                    <h3 className="font-bold mb-1">Достижение разблокировано!</h3>
                    <p className="text-purple-100 text-sm">«Знаток алгоритмов»</p>
                  </div>
                </div>
                <p className="text-purple-100 text-xs">
                  Вы изучили 50+ алгоритмических понятий и построили 200+ связей между ними
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};