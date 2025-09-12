import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../infrastructure/api/client';

interface CourseConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

interface Concept {
  id: string;
  title: string;
  description: string;
  bloomLevel: string;
  position: { x: number; y: number };
  progress: number;
  comments: any[];
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  strength: number;
}

interface CourseData {
  concepts: Concept[];
  connections: Connection[];
  complexity?: string;
}

export const CourseConceptsModal: React.FC<CourseConceptsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle
}) => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [updatingComplexity, setUpdatingComplexity] = useState(false);
  const [activeTab, setActiveTab] = useState<'concepts' | 'connections'>('concepts');

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseData();
    }
  }, [isOpen, courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<any>(`/teacher/courses/${courseId}`);
      setCourseData({
        concepts: response.concepts || [],
        connections: response.connections || [],
        complexity: response.complexity || 'simple' // Use the complexity field directly
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные курса');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCourseData(null);
    setError(null);
    setRegenerating(false);
    setUpdatingComplexity(false);
    setActiveTab('concepts');
    onClose();
  };

  const handleComplexityChange = async (newComplexity: string) => {
    setUpdatingComplexity(true);
    setError(null);
    try {
      await apiClient.patch(`/teacher/courses/${courseId}/complexity`, {
        complexity: newComplexity
      });
      
      // Update local state immediately
      setCourseData(prev => prev ? {
        ...prev,
        complexity: newComplexity
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить сложность');
    } finally {
      setUpdatingComplexity(false);
    }
  };

  const handleRegenerateConcepts = async () => {
    setRegenerating(true);
    setError(null);
    try {
      await apiClient.post(`/teacher/courses/${courseId}/generate-concepts`);
      // Reload course data after regeneration
      await fetchCourseData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сгенерировать концепты');
    } finally {
      setRegenerating(false);
    }
  };

  const getBloomLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'remember': return 'bg-green-100 text-green-800 border-green-200';
      case 'understand': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'apply': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'analyze': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'evaluate': return 'bg-red-100 text-red-800 border-red-200';
      case 'create': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBloomLevelText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'remember': return 'Запоминание';
      case 'understand': return 'Понимание';
      case 'apply': return 'Применение';
      case 'analyze': return 'Анализ';
      case 'evaluate': return 'Оценка';
      case 'create': return 'Создание';
      default: return level;
    }
  };

  const getConnectionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prerequisite': return 'bg-red-100 text-red-800 border-red-200';
      case 'part': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'similar': return 'bg-green-100 text-green-800 border-green-200';
      case 'related': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectionTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prerequisite': return 'Предварительное условие';
      case 'part': return 'Часть целого';
      case 'similar': return 'Похожие';
      case 'related': return 'Связанные';
      default: return type;
    }
  };

  const getConceptTitle = (conceptId: string) => {
    const concept = courseData?.concepts.find(c => c.id === conceptId);
    return concept ? concept.title : `Концепт #${conceptId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Концепты и связи курса</h2>
                <p className="text-sm text-gray-600 mt-1">{courseTitle}</p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Complexity Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-medium">Сложность:</span>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => courseData?.complexity !== 'simple' && handleComplexityChange('simple')}
                      disabled={updatingComplexity || loading || regenerating}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        courseData?.complexity === 'simple'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      } disabled:opacity-50`}
                    >
                      Простая
                    </button>
                    <button
                      onClick={() => courseData?.complexity !== 'complex' && handleComplexityChange('complex')}
                      disabled={updatingComplexity || loading || regenerating}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        courseData?.complexity === 'complex'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      } disabled:opacity-50`}
                    >
                      Сложная
                    </button>
                  </div>
                  {updatingComplexity && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                <button
                  onClick={handleRegenerateConcepts}
                  disabled={regenerating || loading || updatingComplexity}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {regenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Генерируем...
                    </>
                  ) : (
                    <>
                      🔄 Сгенерировать еще раз
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'concepts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Концепты ({courseData?.concepts.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'connections'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Связи ({courseData?.connections.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка данных курса...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 mb-2">Ошибка загрузки</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchCourseData}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              
              {/* Concepts Tab */}
              {activeTab === 'concepts' && courseData && (
                <div className="flex-1 overflow-y-auto">
                  {courseData.concepts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Нет концептов</h3>
                      <p className="text-gray-600">Концепты пока не созданы для этого курса</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {courseData.concepts.map((concept, index) => (
                        <div key={concept.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 mr-3">{concept.title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getBloomLevelColor(concept.bloomLevel)}`}>
                                  {getBloomLevelText(concept.bloomLevel)}
                                </span>
                              </div>
                              {concept.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">{concept.description}</p>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <span>ID: {concept.id}</span>
                            <span>Позиция: ({concept.position.x.toFixed(1)}, {concept.position.y.toFixed(1)})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Connections Tab */}
              {activeTab === 'connections' && courseData && (
                <div className="flex-1 overflow-y-auto">
                  {courseData.connections.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Нет связей</h3>
                      <p className="text-gray-600">Связи между концептами пока не созданы</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {courseData.connections.map((connection, index) => (
                        <div key={connection.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-md">
                                  <span className="text-sm font-medium text-blue-900">
                                    {getConceptTitle(connection.sourceId)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </div>
                                
                                <div className="flex items-center bg-green-50 px-3 py-1 rounded-md">
                                  <span className="text-sm font-medium text-green-900">
                                    {getConceptTitle(connection.targetId)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center mt-2 space-x-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getConnectionTypeColor(connection.type)}`}>
                                  {getConnectionTypeText(connection.type)}
                                </span>
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-2">Сила связи:</span>
                                  <div className="flex items-center">
                                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                                      <div 
                                        className="h-2 bg-blue-500 rounded-full"
                                        style={{ width: `${connection.strength * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600 ml-2">
                                      {(connection.strength * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <span>ID: {connection.id}</span>
                            <span>{connection.sourceId} → {connection.targetId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {courseData ? (
                <>
                  Всего: {courseData.concepts.length} концепций, {courseData.connections.length} связей
                </>
              ) : (
                'Загрузка статистики...'
              )}
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};