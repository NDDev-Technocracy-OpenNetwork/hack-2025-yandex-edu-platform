import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, GraphData } from '../../../domain/types/Graph';

interface GraphVisualizationProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
  className?: string;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: 'concept' | 'topic' | 'subtopic';
  level: number;
  description?: string;
  connections: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  type: 'prerequisite' | 'part' | 'similar' | 'related';
  weight: number;
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<D3Node, D3Link> | null>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  const nodeColors = {
    concept: '#FC3F1D',
    topic: '#FFCC00', 
    subtopic: '#0D44A0'
  };

  const linkColors = {
    prerequisite: '#D1293D',
    part: '#2D8659',
    similar: '#FF7700',
    related: '#999999'
  };

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Convert data to D3 format
    const nodes: D3Node[] = data.nodes.map(node => ({
      id: node.id,
      title: node.title,
      type: node.type,
      level: node.level,
      description: node.description,
      connections: data.links.filter(link => 
        link.source === node.id || link.target === node.id
      ).length
    }));

    const links: D3Link[] = data.links.map(link => ({
      id: link.id,
      source: link.source,
      target: link.target,
      type: link.type,
      weight: link.weight
    }));

    // Create simulation
    const newSimulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links)
        .id(d => d.id)
        .distance(d => 50 + (d.weight * 30))
        .strength(d => d.weight * 0.1)
      )
      .force('charge', d3.forceManyBody<D3Node>()
        .strength(d => -200 - (d.connections * 50))
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<D3Node>()
        .radius(d => 20 + (d.connections * 2))
      );

    setSimulation(newSimulation);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    svg.call(zoom);

    // Create container group
    const container = svg.append('g')
      .attr('class', 'graph-container');

    // Create arrow markers for directed links
    const defs = svg.append('defs');
    
    Object.entries(linkColors).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 25)
        .attr('refY', 3)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,0 L0,6 L9,3 z')
        .attr('fill', color);
    });

    // Create links
    const linkElements = container.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => linkColors[d.type])
      .attr('stroke-width', d => 1 + d.weight)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Create nodes
    const nodeElements = container.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Node circles
    nodeElements.append('circle')
      .attr('r', d => 10 + d.connections * 2)
      .attr('fill', d => nodeColors[d.type])
      .attr('stroke', '#white')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Node labels
    nodeElements.append('text')
      .text(d => d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', d => 15 + d.connections * 2 + 5)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .style('pointer-events', 'none');

    // Node interactions
    nodeElements
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(data.nodes.find(n => n.id === d.id)!);
      })
      .on('mouseenter', (event, d) => {
        onNodeHover?.(data.nodes.find(n => n.id === d.id)!);
        
        // Highlight connected nodes and links
        const connectedNodeIds = new Set<string>();
        links.forEach(link => {
          if (link.source === d.id || link.target === d.id) {
            connectedNodeIds.add(typeof link.source === 'string' ? link.source : link.source.id);
            connectedNodeIds.add(typeof link.target === 'string' ? link.target : link.target.id);
          }
        });

        nodeElements.style('opacity', node => 
          connectedNodeIds.has(node.id) ? 1 : 0.3
        );
        linkElements.style('opacity', link => 
          link.source === d.id || link.target === d.id ? 1 : 0.1
        );
      })
      .on('mouseleave', () => {
        onNodeHover?.(null);
        nodeElements.style('opacity', 1);
        linkElements.style('opacity', 0.6);
      });

    // Drag behavior
    const drag = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) newSimulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) newSimulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    // Update positions on simulation tick
    newSimulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!);

      nodeElements
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      newSimulation.stop();
    };
  }, [data, width, height, onNodeClick, onNodeHover]);

  // Apply transform updates
  useEffect(() => {
    if (!svgRef.current) return;
    
    d3.select(svgRef.current)
      .select('.graph-container')
      .attr('transform', transform.toString());
  }, [transform]);

  // Highlight selected node
  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current)
      .selectAll('.node circle')
      .attr('stroke', (d: any) => 
        d.id === selectedNodeId ? '#FC3F1D' : '#white'
      )
      .attr('stroke-width', (d: any) => 
        d.id === selectedNodeId ? 4 : 2
      );
  }, [selectedNodeId]);

  return (
    <div className={`graph-visualization ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white"
      >
        {data.nodes.length === 0 && (
          <foreignObject width={width} height={height}>
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm">Граф знаний не создан</p>
              </div>
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
};
