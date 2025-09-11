import React from 'react';
import { GraphFilters } from '../../../domain/types/Graph';

interface GraphControlsProps {
  filters: GraphFilters;
  onFiltersChange: (filters: Partial<GraphFilters>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onCenterView: () => void;
  className?: string;
}

const CONNECTION_TYPES = [
  { id: 'prerequisite', label: 'Предварительные знания', color: '#D1293D' },
  { id: 'part', label: 'Части целого', color: '#2D8659' },
  { id: 'similar', label: 'Схожие понятия', color: '#FF7700' },
  { id: 'related', label: 'Связанные темы', color: '#999999' }
] as const;

const BLOOM_LEVELS = [
  { id: 'all', label: 'Все уровни' },
  { id: 'remember', label: 'Запоминание' },
  { id: 'understand', label: 'Понимание' },
  { id: 'apply', label: 'Применение' },
  { id: 'analyze', label: 'Анализ' },
  { id: 'evaluate', label: 'Оценка' },
  { id: 'create', label: 'Создание' }
] as const;

export const GraphControls: React.FC<GraphControlsProps> = ({
  filters,
  onFiltersChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onCenterView,
  className = ''
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleConnectionTypeToggle = (typeId: string) => {
    const newTypes = filters.connectionTypes.includes(typeId as any)
      ? filters.connectionTypes.filter(t => t !== typeId)
      : [...filters.connectionTypes, typeId as any];
    
    onFiltersChange({ connectionTypes: newTypes });
  };

  const handleBloomLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ bloomLevel: e.target.value as any });
  };

  return (
    <div className={`graph-controls bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск по графу
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Найти понятие или тему..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Connection Types Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Типы связей
          </label>
          <div className="space-y-2">
            {CONNECTION_TYPES.map(type => (
              <label key={type.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.connectionTypes.includes(type.id)}
                  onChange={() => handleConnectionTypeToggle(type.id)}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                <div className="ml-3 flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bloom Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Уровень сложности (Блум)
          </label>
          <select
            value={filters.bloomLevel}
            onChange={handleBloomLevelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            {BLOOM_LEVELS.map(level => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Управление видом
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onZoomIn}
              className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Увеличить
            </button>
            <button
              onClick={onZoomOut}
              className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Уменьшить
            </button>
            <button
              onClick={onZoomReset}
              className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Сбросить
            </button>
            <button
              onClick={onCenterView}
              className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Центрировать
            </button>
          </div>
        </div>

        {/* Graph Statistics */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Статистика графа
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-lg font-semibold text-blue-900">--</div>
              <div className="text-xs text-blue-600">Узлов</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-semibold text-green-900">--</div>
              <div className="text-xs text-green-600">Связей</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};