import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../infrastructure/api/client';
import { GraphContainer } from '../graph/GraphContainer';
import { GraphData, GraphNode, GraphLink } from '../../../domain/types/Graph';
import { ConnectionType, BloomLevel } from '../../../shared/types';
import { GraphBuildingAnimation } from '../common/GraphBuildingAnimation';

interface CourseGraphPageProps {}

export const CourseGraphPage: React.FC<CourseGraphPageProps> = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showGraphAnimation, setShowGraphAnimation] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const response: any = await apiClient.get(`/teacher/courses/${courseId}`);
      setCourse(response);
    } catch (err) {
      setError('Ошибка загрузки курса');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildGraph = async () => {
    if (!courseId || !course) return;
    
    setIsGeneratingGraph(true);
    setShowGraphAnimation(true);
    
    try {
      // Convert course concepts and connections to graph format
      const activeConcepts = course.concepts?.filter((c: any) => !c.isDeleted) || [];
      const activeConnections = course.connections?.filter((c: any) => !c.isDeleted) || [];
      
      console.log('Debug - Course data:', { 
        concepts: activeConcepts.slice(0, 2), 
        connections: activeConnections.slice(0, 2) 
      });
      
      // Create nodes from concepts
      const nodes: GraphNode[] = activeConcepts.map((concept: any, index: number) => ({
        id: concept.id?.toString() || `concept-${index}`,
        title: concept.title || 'Без названия',
        description: concept.description || '',
        type: 'concept' as const,
        level: index % 3 + 1, // Distribute concepts across 3 levels
        bloomLevel: concept.bloom_level as BloomLevel,
        keywords: []
      }));

      // Create links from connections - handle different possible property names
      let links: GraphLink[] = activeConnections.map((connection: any, index: number) => {
        const sourceId = connection.source_concept_id || connection.sourceId || connection.source;
        const targetId = connection.target_concept_id || connection.targetId || connection.target;
        const connectionType = connection.connection_type || connection.type;
        
        return {
          id: connection.id?.toString() || `connection-${index}`,
          source: sourceId?.toString() || '',
          target: targetId?.toString() || '',
          type: connectionType as ConnectionType || 'related',
          weight: connection.strength || connection.weight || 1
        };
      }).filter((link: GraphLink) => link.source && link.target); // Filter out invalid links

      // If no connections exist, create some sample connections for demonstration
      if (links.length === 0 && nodes.length > 1) {
        links = [
          {
            id: 'demo-1',
            source: nodes[0].id,
            target: nodes[1].id,
            type: 'prerequisite' as ConnectionType,
            weight: 1
          }
        ];
        if (nodes.length > 2) {
          links.push({
            id: 'demo-2',
            source: nodes[1].id,
            target: nodes[2].id,
            type: 'related' as ConnectionType,
            weight: 1
          });
        }
      }

      const graphData: GraphData = { nodes, links };
      setGraphData(graphData);
      
      console.log('Graph built successfully!', { 
        nodes: nodes.length, 
        links: links.length,
        graphData 
      });
    } catch (err) {
      setError('Ошибка построения графа');
      console.error('Error building graph:', err);
    } finally {
      setIsGeneratingGraph(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowGraphAnimation(false);
    setShowGraph(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/teacher')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Вернуться к курсам
          </button>
        </div>
      </div>
    );
  }

  const activeConcepts = course?.concepts?.filter((c: any) => !c.isDeleted) || [];
  const hasDescriptions = activeConcepts.some((c: any) => c.description && c.description.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teacher')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
                <p className="text-sm text-gray-500">Граф знаний курса</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {activeConcepts.length} концептов
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-sm text-gray-500">
                {course?.connections?.filter((c: any) => !c.isDeleted)?.length || 0} связей
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {showGraph && graphData ? (
          // Graph Visualization
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Граф знаний</h2>
                  <p className="text-gray-600 mt-1">Интерактивная визуализация курса</p>
                </div>
                <button
                  onClick={() => setShowGraph(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Вернуться к настройкам
                </button>
              </div>
            </div>
            <div className="p-6">
              <GraphContainer 
                data={graphData} 
                onNodeSelect={(node) => console.log('Selected node:', node)}
              />
            </div>
          </div>
        ) : !hasDescriptions ? (
          // No descriptions - show warning and generate button
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Описания концептов не найдены
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Для построения качественного графа знаний необходимо сначала сгенерировать описания для всех концептов курса.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate(`/teacher`)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Вернуться к курсам
                </button>
                <button
                  onClick={async () => {
                    setIsGeneratingGraph(true);
                    try {
                      await apiClient.post(`/teacher/courses/${courseId}/generate-descriptions`);
                      await loadCourse(); // Reload course with descriptions
                    } catch (err) {
                      setError('Ошибка генерации описаний');
                    } finally {
                      setIsGeneratingGraph(false);
                    }
                  }}
                  disabled={isGeneratingGraph}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGeneratingGraph ? (
                    <>
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Генерация описаний...
                    </>
                  ) : (
                    <>🤖 Сгенерировать описания</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Has descriptions - show graph building interface
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Готов к показу графа знаний
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Все концепты имеют описания. Система готова показать интерактивный граф знаний для визуализации связей между концептами.
              </p>
            </div>

            {/* Concepts Preview */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Концепты курса</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeConcepts.slice(0, 6).map((concept: any) => (
                  <div key={concept.id} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{concept.title}</h5>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {concept.description?.substring(0, 120)}...
                    </p>
                  </div>
                ))}
              </div>
              {activeConcepts.length > 6 && (
                <p className="text-center text-gray-500 mt-4">
                  И ещё {activeConcepts.length - 6} концептов...
                </p>
              )}
            </div>

            {/* Build Graph Button */}
            <div className="text-center">
              <button
                onClick={buildGraph}
                disabled={isGeneratingGraph}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg font-semibold shadow-lg"
              >
                {isGeneratingGraph ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Загружается граф...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    🚀 Показать граф знаний
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Graph Building Animation */}
      <GraphBuildingAnimation
        isVisible={showGraphAnimation}
        onComplete={handleAnimationComplete}
        concepts={course?.concepts?.filter((c: any) => !c.isDeleted) || []}
      />
    </div>
  );
};
