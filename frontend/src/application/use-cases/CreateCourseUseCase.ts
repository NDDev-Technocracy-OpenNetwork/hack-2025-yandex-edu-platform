import { Course } from '../../domain/entities/Course';
import { Concept } from '../../domain/entities/Concept';
import { CourseId } from '../../domain/value-objects/CourseId';
import { ConceptId } from '../../domain/value-objects/ConceptId';
import { FileInfo } from '../../domain/value-objects/FileInfo';
import { CourseRepository, FileUploadRepository } from '../../domain/repositories/CourseRepository';
import { GraphLayoutService } from '../../domain/services/GraphLayoutService';
import { ApiResponse, ConceptConnection } from '../../shared/types';

export interface CreateCourseRequest {
  file: File;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  userId: string;
}

export interface CreateCourseResponse {
  course: Course;
  fileId: string;
}

export class CreateCourseUseCase {
  constructor(
    private courseRepository: CourseRepository,
    private fileUploadRepository: FileUploadRepository,
    private graphLayoutService: GraphLayoutService
  ) {}

  async execute(request: CreateCourseRequest): Promise<ApiResponse<CreateCourseResponse>> {
    try {
      // Step 1: Validate file
      const fileInfo = FileInfo.fromFile(request.file);
      
      // Step 2: Upload file
      const uploadResult = await this.fileUploadRepository.upload(request.file);
      
      if (!uploadResult.success || !uploadResult.data) {
        return {
          success: false,
          error: uploadResult.error || { message: 'Ошибка загрузки файла' }
        };
      }

      const fileId = uploadResult.data;

      // Step 3: Generate concept graph from file
      const graphResult = await this.fileUploadRepository.generateGraph(fileId);
      
      if (!graphResult.success || !graphResult.data) {
        return {
          success: false,
          error: graphResult.error || { message: 'Ошибка генерации графа' }
        };
      }

      // Step 4: Create concepts from AI response
      const concepts = this.createConceptsFromAIResponse(graphResult.data.concepts);
      const connections = this.createConnectionsFromAIResponse(graphResult.data.connections);

      // Step 5: Apply graph layout
      this.graphLayoutService.optimizeLayout(concepts, connections);

      // Step 6: Create course entity
      const courseId = CourseId.generate();
      const course = new Course(
        courseId.value,
        request.title,
        request.description,
        request.userId,
        new Date(),
        new Date(),
        request.difficulty,
        concepts,
        connections
      );

      // Step 7: Save course
      const saveResult = await this.courseRepository.save(course);
      
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || { message: 'Ошибка сохранения курса' }
        };
      }

      return {
        success: true,
        data: {
          course,
          fileId
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Неизвестная ошибка'
        }
      };
    }
  }

  private createConceptsFromAIResponse(aiConcepts: any[]): Concept[] {
    return aiConcepts.map((aiConcept, index) => {
      const conceptId = ConceptId.generate();
      
      return new Concept(
        conceptId.value,
        aiConcept.title || `Концепция ${index + 1}`,
        aiConcept.description || '',
        aiConcept.bloomLevel || 'understand',
        { x: 0, y: 0 }, // Will be updated by layout service
        0, // Initial progress
        [] // No comments initially
      );
    });
  }

  private createConnectionsFromAIResponse(aiConnections: any[]): ConceptConnection[] {
    return aiConnections.map((aiConnection) => ({
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId: aiConnection.sourceId,
      targetId: aiConnection.targetId,
      type: aiConnection.type || 'related',
      strength: aiConnection.strength || 0.5
    }));
  }
}