import { Concept as ConceptInterface, ConceptComment, BloomLevel, Position } from '../../shared/types';
import { CONTENT_LIMITS } from '../../shared/constants';

export class Concept implements ConceptInterface {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public bloomLevel: BloomLevel,
    public position: Position,
    public progress: number = 0,
    public comments: ConceptComment[] = []
  ) {
    this.validateTitle(title);
    this.validateProgress(progress);
  }

  private validateTitle(title: string): void {
    if (!title.trim()) {
      throw new Error('Название концепции не может быть пустым');
    }
    if (title.length > CONTENT_LIMITS.CONCEPT_TITLE_MAX) {
      throw new Error(`Название концепции не может превышать ${CONTENT_LIMITS.CONCEPT_TITLE_MAX} символов`);
    }
  }

  private validateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Прогресс должен быть от 0 до 100');
    }
  }

  updateTitle(newTitle: string): void {
    this.validateTitle(newTitle);
    this.title = newTitle;
  }

  updateDescription(newDescription: string): void {
    this.description = newDescription;
  }

  updateBloomLevel(newBloomLevel: BloomLevel): void {
    this.bloomLevel = newBloomLevel;
  }

  updatePosition(newPosition: Position): void {
    this.position = { ...newPosition };
  }

  updateProgress(newProgress: number): void {
    this.validateProgress(newProgress);
    this.progress = newProgress;
  }

  addComment(comment: ConceptComment): void {
    if (comment.text.length > CONTENT_LIMITS.CONCEPT_COMMENT_MAX) {
      throw new Error(`Комментарий не может превышать ${CONTENT_LIMITS.CONCEPT_COMMENT_MAX} символов`);
    }
    
    this.comments.push(comment);
  }

  removeComment(commentId: string): void {
    const index = this.comments.findIndex(c => c.id === commentId);
    if (index === -1) {
      throw new Error('Комментарий не найден');
    }
    
    this.comments.splice(index, 1);
  }

  updateComment(commentId: string, newText: string): void {
    if (newText.length > CONTENT_LIMITS.CONCEPT_COMMENT_MAX) {
      throw new Error(`Комментарий не может превышать ${CONTENT_LIMITS.CONCEPT_COMMENT_MAX} символов`);
    }
    
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Комментарий не найден');
    }
    
    comment.text = newText;
  }

  getCommentsByAuthor(authorId: string): ConceptComment[] {
    return this.comments.filter(comment => comment.authorId === authorId);
  }

  isCompleted(): boolean {
    return this.progress === 100;
  }

  isStarted(): boolean {
    return this.progress > 0;
  }

  getProgressStatus(): 'not-started' | 'in-progress' | 'completed' {
    if (this.progress === 0) return 'not-started';
    if (this.progress === 100) return 'completed';
    return 'in-progress';
  }

  // Calculate distance from another concept for graph layout
  distanceFrom(otherConcept: Concept): number {
    const dx = this.position.x - otherConcept.position.x;
    const dy = this.position.y - otherConcept.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  toJSON(): ConceptInterface {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      bloomLevel: this.bloomLevel,
      position: { ...this.position },
      progress: this.progress,
      comments: [...this.comments]
    };
  }
}