import React from 'react';
import { SimpleHeader } from '../common/Header';
import { Footer } from '../common/Footer';

interface StudentPageProps {
  onBack?: () => void;
}

export const StudentPage: React.FC<StudentPageProps> = ({ onBack }) => {
  const courses = [
    {
      id: 1,
      title: 'Основы алгоритмов и структур данных',
      progress: 75,
      status: 'active',
      nodes: 45,
      connections: 120,
      lastActivity: '2 дня назад',
      difficulty: 'Средний',
      estimatedTime: '4 недели'
    },
    {
      id: 2,
      title: 'Машинное обучение: введение',
      progress: 30,
      status: 'active',
      nodes: 67,
      connections: 180,
      lastActivity: '5 дней назад',
      difficulty: 'Высокий',
      estimatedTime: '6 недель'
    },
    {
      id: 3,
      title: 'Веб-разработка на Python',
      progress: 100,
      status: 'completed',
      nodes: 38,
      connections: 95,
      lastActivity: '1 неделя назад',
      difficulty: 'Низкий',
      estimatedTime: '3 недели'
    }
  ];

  const stats = [
    { label: 'Завершено курсов', value: '12', icon: '🎓' },
    { label: 'Часов обучения', value: '240', icon: '⏱️' },
    { label: 'Изучено понятий', value: '1,245', icon: '🧠' },
    { label: 'Построено связей', value: '3,890', icon: '🔗' }
  ];

  const recommendations = [
    {
      title: 'Базы данных и SQL',
      reason: 'Основано на вашем интересе к веб-разработке',
      difficulty: 'Средний',
      nodes: 52
    },
    {
      title: 'Системное программирование',
      reason: 'Продолжение изучения алгоритмов',
      difficulty: 'Высокий',
      nodes: 74
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Низкий': return 'text-green-600 bg-green-50 border-green-200';
      case 'Средний': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Высокий': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
            {stats.map((stat, index) => (
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
                  {courses.map((course) => (
                    <div key={course.id} className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                      
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                            {course.title}
                          </h3>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              {course.nodes} узлов
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              {course.connections} связей
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                            {course.difficulty}
                          </span>
                          
                          {course.status === 'completed' && (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {course.status !== 'completed' && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Прогресс</span>
                            <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Course Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>Активность: {course.lastActivity}</span>
                          <span>Примерно: {course.estimatedTime}</span>
                        </div>
                        
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform group-hover:scale-105">
                          {course.status === 'completed' ? 'Повторить' : 'Продолжить'}
                        </button>
                      </div>
                    </div>
                  ))}
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