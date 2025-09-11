import { Course } from '../../domain/entities/Course';
import { CourseId } from '../../domain/value-objects/CourseId';
import { CourseRepository, FileUploadRepository, UserRepository } from '../../domain/repositories/CourseRepository';
import { ApiResponse } from '../../shared/types';

export class MockCourseRepository implements CourseRepository {
  private courses: Map<string, Course> = new Map();

  async findById(id: CourseId): Promise<Course | null> {
    // Simulate API delay
    await this.delay(200);
    
    const course = this.courses.get(id.value);
    return course || null;
  }

  async findAll(): Promise<Course[]> {
    await this.delay(300);
    
    return Array.from(this.courses.values());
  }

  async findByCreatedBy(userId: string): Promise<Course[]> {
    await this.delay(250);
    
    return Array.from(this.courses.values())
      .filter(course => course.createdBy === userId);
  }

  async save(course: Course): Promise<ApiResponse<Course>> {
    await this.delay(400);
    
    try {
      // Simulate occasional save failures
      if (Math.random() < 0.05) {
        throw new Error('Временная ошибка сервера');
      }
      
      this.courses.set(course.id, course);
      
      return {
        success: true,
        data: course
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Ошибка сохранения'
        }
      };
    }
  }

  async delete(id: CourseId): Promise<ApiResponse<void>> {
    await this.delay(300);
    
    const existed = this.courses.has(id.value);
    this.courses.delete(id.value);
    
    if (!existed) {
      return {
        success: false,
        error: { message: 'Курс не найден' }
      };
    }
    
    return { success: true };
  }

  async exists(id: CourseId): Promise<boolean> {
    await this.delay(100);
    
    return this.courses.has(id.value);
  }

  async search(query: string): Promise<Course[]> {
    await this.delay(200);
    
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.courses.values())
      .filter(course => 
        course.title.toLowerCase().includes(lowercaseQuery) ||
        course.description.toLowerCase().includes(lowercaseQuery)
      );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper method to seed data for development
  seed(): void {
    const sampleCourses = this.createSampleCourses();
    sampleCourses.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  private createSampleCourses(): Course[] {
    return [
      new Course(
        'python-basics',
        'Основы Python',
        'Изучите основы программирования на Python',
        'teacher-1',
        new Date('2024-01-15'),
        new Date('2024-01-20'),
        'Beginner',
        [],
        []
      ),
      new Course(
        'web-development',
        'Веб-разработка',
        'HTML, CSS и JavaScript для создания веб-сайтов',
        'teacher-1',
        new Date('2024-02-01'),
        new Date('2024-02-05'),
        'Intermediate',
        [],
        []
      ),
      new Course(
        'data-structures',
        'Структуры данных',
        'Алгоритмы и структуры данных для эффективного программирования',
        'teacher-2',
        new Date('2024-02-10'),
        new Date('2024-02-12'),
        'Advanced',
        [],
        []
      )
    ];
  }
}

export class MockFileUploadRepository implements FileUploadRepository {
  private uploadProgress: Map<string, number> = new Map();

  async upload(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<string>> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await this.delay(100);
      this.uploadProgress.set(fileId, progress);
      onProgress?.(progress);
    }
    
    // Simulate occasional upload failures
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: { message: 'Ошибка загрузки файла' }
      };
    }
    
    return {
      success: true,
      data: fileId
    };
  }

  async generateGraph(fileId: string): Promise<ApiResponse<{ concepts: any[], connections: any[] }>> {
    // Simulate AI processing time
    await this.delay(2000);
    
    // Simulate occasional processing failures
    if (Math.random() < 0.15) {
      return {
        success: false,
        error: { message: 'Не удалось обработать документ' }
      };
    }
    
    // Generate sample concepts and connections
    const concepts = this.generateMockConcepts();
    const connections = this.generateMockConnections(concepts);
    
    return {
      success: true,
      data: { concepts, connections }
    };
  }

  async getUploadStatus(fileId: string): Promise<ApiResponse<{ status: string, progress: number }>> {
    await this.delay(50);
    
    const progress = this.uploadProgress.get(fileId) || 0;
    const status = progress === 100 ? 'completed' : 'uploading';
    
    return {
      success: true,
      data: { status, progress }
    };
  }

  private generateMockConcepts(): any[] {
    const sampleConcepts = [
      { title: 'Переменные', description: 'Основы работы с переменными', bloomLevel: 'understand' },
      { title: 'Функции', description: 'Создание и использование функций', bloomLevel: 'apply' },
      { title: 'Циклы', description: 'Циклы for и while', bloomLevel: 'apply' },
      { title: 'Условия', description: 'Условные конструкции if-else', bloomLevel: 'understand' },
      { title: 'Списки', description: 'Работа со списками и массивами', bloomLevel: 'apply' },
      { title: 'Словари', description: 'Структуры данных типа ключ-значение', bloomLevel: 'analyze' },
    ];
    
    return sampleConcepts.slice(0, 3 + Math.floor(Math.random() * 4));
  }

  private generateMockConnections(concepts: any[]): any[] {
    const connections = [];
    
    for (let i = 1; i < concepts.length; i++) {
      connections.push({
        sourceId: `concept-${i}`,
        targetId: `concept-${i + 1}`,
        type: 'prerequisite',
        strength: 0.7 + Math.random() * 0.3
      });
    }
    
    return connections;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class MockUserRepository implements UserRepository {
  private currentUser = {
    id: 'user-1',
    name: 'Учитель',
    email: 'teacher@example.com',
    role: 'teacher'
  };

  async getCurrentUser(): Promise<ApiResponse<{ id: string, name: string, email: string, role: string }>> {
    await this.delay(100);
    
    return {
      success: true,
      data: this.currentUser
    };
  }

  async login(credentials: { email: string, password: string }): Promise<ApiResponse<string>> {
    await this.delay(500);
    
    // Mock authentication - accept any credentials for demo
    if (credentials.email && credentials.password) {
      const token = `mock-token-${Date.now()}`;
      
      // Set user role based on email
      this.currentUser.role = credentials.email.includes('student') ? 'student' : 'teacher';
      this.currentUser.email = credentials.email;
      
      return {
        success: true,
        data: token
      };
    }
    
    return {
      success: false,
      error: { message: 'Неверные учетные данные' }
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await this.delay(200);
    
    return { success: true };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}