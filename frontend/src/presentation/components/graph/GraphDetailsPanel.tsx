import React from 'react';
import { GraphNode } from '../../../domain/types/Graph';

interface GraphDetailsPanelProps {
  selectedNode: GraphNode | null;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const NODE_TYPE_LABELS = {
  concept: 'Понятие',
  topic: 'Тема',
  subtopic: 'Подтема'
};

const NODE_TYPE_COLORS = {
  concept: 'bg-red-50 text-red-700 border-red-200',
  topic: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  subtopic: 'bg-blue-50 text-blue-700 border-blue-200'
};

export const GraphDetailsPanel: React.FC<GraphDetailsPanelProps> = ({
  selectedNode,
  isVisible,
  onClose,
  className = ''
}) => {
  if (!isVisible || !selectedNode) {
    return null;
  }

  return (
    <div className={`graph-details-panel bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="flex items-center mb-2">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mr-3
                ${NODE_TYPE_COLORS[selectedNode.type]}
              `}>
                {NODE_TYPE_LABELS[selectedNode.type]}
              </span>
              <span className="text-sm text-gray-500">
                Уровень {selectedNode.level}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedNode.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {selectedNode.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Описание</h4>
            <p className="text-gray-600 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-4">
          {/* Keywords */}
          {selectedNode.keywords && selectedNode.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ключевые слова</h4>
              <div className="flex flex-wrap gap-2">
                {selectedNode.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bloom Level */}
          {selectedNode.bloomLevel && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Уровень сложности</h4>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-brand-primary rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 capitalize">
                  {selectedNode.bloomLevel}
                </span>
              </div>
            </div>
          )}

          {/* Position in document */}
          {selectedNode.position && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Расположение в документе</h4>
              <div className="text-sm text-gray-600">
                <div>Страница: {selectedNode.position.page}</div>
                <div>Параграф: {selectedNode.position.paragraph}</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button className="btn-primary text-sm">
              Подробнее
            </button>
            <button className="btn-secondary text-sm">
              Добавить заметку
            </button>
          </div>
        </div>

        {/* Connection Statistics */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Связи с другими понятиями</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {/* This would be calculated from the graph data */}
                --
              </div>
              <div className="text-xs text-gray-500">Исходящие</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {/* This would be calculated from the graph data */}
                --
              </div>
              <div className="text-xs text-gray-500">Входящие</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini version for hover tooltips
interface GraphTooltipProps {
  node: GraphNode;
  position: { x: number; y: number };
  className?: string;
}

export const GraphTooltip: React.FC<GraphTooltipProps> = ({
  node,
  position,
  className = ''
}) => {
  return (
    <div
      className={`
        absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs pointer-events-none
        ${className}
      `}
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="text-sm font-medium mb-1">{node.title}</div>
      <div className="text-xs text-gray-300 mb-2">
        {NODE_TYPE_LABELS[node.type]} • Уровень {node.level}
      </div>
      {node.description && (
        <div className="text-xs text-gray-400 line-clamp-3">
          {node.description}
        </div>
      )}
      
      {/* Arrow pointing down */}
      <div
        className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
      ></div>
    </div>
  );
};