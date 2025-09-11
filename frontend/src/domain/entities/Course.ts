import { Course as CourseInterface, Concept, ConceptConnection, CourseProgress } from '../../shared/types';
import { CONTENT_LIMITS } from '../../shared/constants';

export class Course implements CourseInterface {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    public concepts: Concept[] = [],
    public connections: ConceptConnection[] = [],
    public progress?: CourseProgress
  ) {
    this.validateTitle(title);
    this.validateDescription(description);
  }

  private validateTitle(title: string): void {
    if (!title.trim()) {
      throw new Error('Название курса не может быть пустым');
    }
    if (title.length > CONTENT_LIMITS.COURSE_TITLE_MAX) {
      throw new Error(`Название курса не может превышать ${CONTENT_LIMITS.COURSE_TITLE_MAX} символов`);
    }
  }

  private validateDescription(description: string): void {
    if (description.length > CONTENT_LIMITS.COURSE_DESCRIPTION_MAX) {
      throw new Error(`Описание курса не может превышать ${CONTENT_LIMITS.COURSE_DESCRIPTION_MAX} символов`);
    }
  }

  updateTitle(newTitle: string): void {
    this.validateTitle(newTitle);
    this.title = newTitle;
    this.updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    this.validateDescription(newDescription);
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  addConcept(concept: Concept): void {
    if (this.concepts.find(c => c.id === concept.id)) {
      throw new Error('Концепция уже существует в курсе');
    }
    this.concepts.push(concept);
    this.updatedAt = new Date();
  }

  removeConcept(conceptId: string): void {
    const index = this.concepts.findIndex(c => c.id === conceptId);
    if (index === -1) {
      throw new Error('Концепция не найдена');
    }
    
    // Remove concept
    this.concepts.splice(index, 1);
    
    // Remove related connections
    this.connections = this.connections.filter(
      conn => conn.sourceId !== conceptId && conn.targetId !== conceptId
    );
    
    this.updatedAt = new Date();
  }

  addConnection(connection: ConceptConnection): void {
    // Validate that both concepts exist
    const sourceExists = this.concepts.find(c => c.id === connection.sourceId);
    const targetExists = this.concepts.find(c => c.id === connection.targetId);
    
    if (!sourceExists || !targetExists) {
      throw new Error('Одна или обе концепции не существуют');
    }
    
    // Check if connection already exists
    const connectionExists = this.connections.find(
      conn => conn.sourceId === connection.sourceId && 
              conn.targetId === connection.targetId &&
              conn.type === connection.type
    );
    
    if (connectionExists) {
      throw new Error('Связь уже существует');
    }
    
    this.connections.push(connection);
    this.updatedAt = new Date();
  }

  removeConnection(connectionId: string): void {
    const index = this.connections.findIndex(conn => conn.id === connectionId);
    if (index === -1) {
      throw new Error('Связь не найдена');
    }
    
    this.connections.splice(index, 1);
    this.updatedAt = new Date();
  }

  calculateProgress(): CourseProgress {
    if (this.concepts.length === 0) {
      return { completed: 0, total: 0 };
    }
    
    const totalProgress = this.concepts.reduce((sum, concept) => sum + concept.progress, 0);
    const averageProgress = Math.round(totalProgress / this.concepts.length);
    
    return {
      completed: averageProgress,
      total: 100,
      currentConcept: this.findCurrentConcept()
    };
  }

  private findCurrentConcept(): string | undefined {
    // Find first concept that is not fully completed
    const incompleteConcept = this.concepts.find(concept => concept.progress < 100);
    return incompleteConcept?.id;
  }

  getConceptById(conceptId: string): Concept | undefined {
    return this.concepts.find(c => c.id === conceptId);
  }

  getConnectionsForConcept(conceptId: string): ConceptConnection[] {
    return this.connections.filter(
      conn => conn.sourceId === conceptId || conn.targetId === conceptId
    );
  }

  toJSON(): CourseInterface {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      difficulty: this.difficulty,
      concepts: this.concepts,
      connections: this.connections,
      progress: this.calculateProgress()
    };
  }
}