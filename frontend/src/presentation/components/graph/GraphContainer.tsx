import React, { useState, useRef, useCallback } from 'react';
import { GraphVisualization } from './GraphVisualization';
import { GraphControls } from './GraphControls';
import { GraphDetailsPanel } from './GraphDetailsPanel';
import { GraphData, GraphNode, GraphFilters } from '../../../domain/types/Graph';
import * as d3 from 'd3';

interface GraphContainerProps {
  data: GraphData;
  onNodeSelect?: (node: GraphNode) => void;
  className?: string;
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
  data,
  onNodeSelect,
  className = ''
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [filters, setFilters] = useState<GraphFilters>({
    search: '',
    connectionTypes: ['prerequisite', 'part', 'similar', 'related'],
    bloomLevel: 'all'
  });

  const graphRef = useRef<SVGSVGElement>(null);

  // Filter graph data based on current filters
  const filteredData = React.useMemo(() => {
    let filteredNodes = data.nodes;
    let filteredLinks = data.links;

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filteredNodes = filteredNodes.filter(node =>
        node.title.toLowerCase().includes(searchTerm) ||
        node.description?.toLowerCase().includes(searchTerm) ||
        node.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
      
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => 
        nodeIds.has(link.source) && nodeIds.has(link.target)
      );
    }

    // Apply connection type filter
    filteredLinks = filteredLinks.filter(link => 
      filters.connectionTypes.includes(link.type)
    );

    // Apply bloom level filter
    if (filters.bloomLevel !== 'all') {
      filteredNodes = filteredNodes.filter(node => 
        node.bloomLevel === filters.bloomLevel
      );
      
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => 
        nodeIds.has(link.source) && nodeIds.has(link.target)
      );
    }

    return { nodes: filteredNodes, links: filteredLinks };
  }, [data, filters]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setShowDetailsPanel(true);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

  const handleFiltersChange = useCallback((newFilters: Partial<GraphFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!graphRef.current) return;
    const svg = d3.select(graphRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!graphRef.current) return;
    const svg = d3.select(graphRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1 / 1.5
    );
  }, []);

  const handleZoomReset = useCallback(() => {
    if (!graphRef.current) return;
    const svg = d3.select(graphRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  }, []);

  const handleCenterView = useCallback(() => {
    handleZoomReset();
  }, [handleZoomReset]);

  const handleCloseDetailsPanel = useCallback(() => {
    setShowDetailsPanel(false);
    setSelectedNode(null);
  }, []);

  return (
    <div className={`graph-container ${className}`}>
      <div className="grid lg:grid-cols-12 gap-6 h-full">
        {/* Controls Sidebar */}
        <div className="lg:col-span-3">
          <GraphControls
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onCenterView={handleCenterView}
            className="sticky top-4"
          />
        </div>

        {/* Main Graph Area */}
        <div className="lg:col-span-9 relative">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Граф знаний
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Узлов: {filteredData.nodes.length}</span>
                <span>Связей: {filteredData.links.length}</span>
              </div>
            </div>

            <div className="relative">
              <GraphVisualization
                data={filteredData}
                width={800}
                height={600}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                selectedNodeId={selectedNode?.id}
              />

              {/* Details Panel Overlay */}
              {showDetailsPanel && selectedNode && (
                <div className="absolute top-4 right-4 w-80">
                  <GraphDetailsPanel
                    selectedNode={selectedNode}
                    isVisible={showDetailsPanel}
                    onClose={handleCloseDetailsPanel}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Graph Legend */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Обозначения</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Node Types */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Типы узлов</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                    <span className="text-sm text-gray-700">Понятие</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                    <span className="text-sm text-gray-700">Тема</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-sm text-gray-700">Подтема</span>
                  </div>
                </div>
              </div>

              {/* Connection Types */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Типы связей</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-red-600 mr-3"></div>
                    <span className="text-sm text-gray-700">Предварительные знания</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-green-600 mr-3"></div>
                    <span className="text-sm text-gray-700">Части целого</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-orange-600 mr-3"></div>
                    <span className="text-sm text-gray-700">Схожие понятия</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-gray-600 mr-3"></div>
                    <span className="text-sm text-gray-700">Связанные темы</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};