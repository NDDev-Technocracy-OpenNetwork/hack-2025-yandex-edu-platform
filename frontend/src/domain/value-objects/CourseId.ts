export class CourseId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('CourseId cannot be empty');
    }
    
    // Validate UUID format or custom format
    if (!this.isValidFormat(value)) {
      throw new Error('Invalid CourseId format');
    }
    
    this._value = value.trim();
  }

  private isValidFormat(value: string): boolean {
    // Accept UUID format or alphanumeric with dashes
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const customIdRegex = /^[a-zA-Z0-9-_]+$/;
    
    return uuidRegex.test(value) || (customIdRegex.test(value) && value.length >= 3);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CourseId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): CourseId {
    return new CourseId(value);
  }

  static generate(): CourseId {
    // Generate a simple ID for now - in real app would use proper UUID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return new CourseId(`course-${timestamp}-${random}`);
  }
}