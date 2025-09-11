import { Concept } from '../entities/Concept';
import { ConceptConnection, Position } from '../../shared/types';
import { GRAPH_LIMITS } from '../../shared/constants';

export interface GraphLayoutService {
  calculatePositions(concepts: Concept[], connections: ConceptConnection[]): Position[];
  
  optimizeLayout(concepts: Concept[], connections: ConceptConnection[]): void;
  
  validateGraphSize(concepts: Concept[], connections: ConceptConnection[]): void;
}

export class DefaultGraphLayoutService implements GraphLayoutService {
  
  calculatePositions(concepts: Concept[], connections: ConceptConnection[]): Position[] {
    this.validateGraphSize(concepts, connections);
    
    if (concepts.length === 0) {
      return [];
    }
    
    if (concepts.length === 1) {
      return [{ x: 400, y: 300 }];
    }
    
    // Use force-directed layout algorithm
    return this.forceDirectedLayout(concepts, connections);
  }
  
  private forceDirectedLayout(concepts: Concept[], connections: ConceptConnection[]): Position[] {
    const positions: Position[] = [];
    const center = { x: 400, y: 300 };
    const radius = Math.min(200, 50 + concepts.length * 10);
    
    // Initial circular positioning
    concepts.forEach((concept, index) => {
      const angle = (2 * Math.PI * index) / concepts.length;
      positions[index] = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });
    
    // Apply force-directed positioning
    const iterations = 50;
    const springConstant = 0.1;
    const repulsionConstant = 1000;
    const damping = 0.9;
    
    for (let iter = 0; iter < iterations; iter++) {
      const forces: { x: number; y: number }[] = positions.map(() => ({ x: 0, y: 0 }));
      
      // Repulsion forces between all nodes
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const repulsion = repulsionConstant / (distance * distance);
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            forces[i].x += repulsion * unitX;
            forces[i].y += repulsion * unitY;
            forces[j].x -= repulsion * unitX;
            forces[j].y -= repulsion * unitY;
          }
        }
      }
      
      // Spring forces for connected nodes
      connections.forEach(connection => {
        const sourceIndex = concepts.findIndex(c => c.id === connection.sourceId);
        const targetIndex = concepts.findIndex(c => c.id === connection.targetId);
        
        if (sourceIndex >= 0 && targetIndex >= 0) {
          const dx = positions[targetIndex].x - positions[sourceIndex].x;
          const dy = positions[targetIndex].y - positions[sourceIndex].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const idealDistance = 150;
          const spring = springConstant * (distance - idealDistance);
          
          if (distance > 0) {
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            forces[sourceIndex].x += spring * unitX;
            forces[sourceIndex].y += spring * unitY;
            forces[targetIndex].x -= spring * unitX;
            forces[targetIndex].y -= spring * unitY;
          }
        }
      });
      
      // Apply forces with damping
      positions.forEach((pos, index) => {
        pos.x += forces[index].x * damping;
        pos.y += forces[index].y * damping;
        
        // Keep within bounds
        pos.x = Math.max(50, Math.min(750, pos.x));
        pos.y = Math.max(50, Math.min(550, pos.y));
      });
    }
    
    return positions;
  }
  
  optimizeLayout(concepts: Concept[], connections: ConceptConnection[]): void {
    const newPositions = this.calculatePositions(concepts, connections);
    
    concepts.forEach((concept, index) => {
      if (newPositions[index]) {
        concept.updatePosition(newPositions[index]);
      }
    });
  }
  
  validateGraphSize(concepts: Concept[], connections: ConceptConnection[]): void {
    if (concepts.length > GRAPH_LIMITS.MAX_NODES) {
      throw new Error(`Превышено максимальное количество концепций: ${GRAPH_LIMITS.MAX_NODES}`);
    }
    
    if (connections.length > GRAPH_LIMITS.MAX_CONNECTIONS) {
      throw new Error(`Превышено максимальное количество связей: ${GRAPH_LIMITS.MAX_CONNECTIONS}`);
    }
  }
  
  shouldUseVirtualization(conceptCount: number): boolean {
    return conceptCount > GRAPH_LIMITS.VIRTUALIZATION_THRESHOLD;
  }
  
  getVisibleConcepts(concepts: Concept[], centerConcept: Concept, maxDistance: number = GRAPH_LIMITS.LAZY_LOAD_DISTANCE): Concept[] {
    if (!this.shouldUseVirtualization(concepts.length)) {
      return concepts;
    }
    
    return concepts.filter(concept => {
      if (concept.id === centerConcept.id) return true;
      return concept.distanceFrom(centerConcept) <= maxDistance * 200; // 200px per distance unit
    });
  }
}