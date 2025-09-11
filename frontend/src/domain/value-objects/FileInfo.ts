import { FILE_UPLOAD } from '../../shared/constants';
import { AllowedFileType } from '../../shared/types';

export class FileInfo {
  constructor(
    public readonly name: string,
    public readonly size: number,
    public readonly type: string,
    public readonly lastModified: number
  ) {
    this.validateFile();
  }

  private validateFile(): void {
    this.validateSize();
    this.validateType();
    this.validateName();
  }

  private validateSize(): void {
    if (this.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
      throw new Error(`Размер файла ${this.getSizeInMB()}MB превышает лимит ${FILE_UPLOAD.MAX_SIZE_MB}MB`);
    }
    
    if (this.size === 0) {
      throw new Error('Файл не может быть пустым');
    }
  }

  private validateType(): void {
    const extension = this.getExtension();
    
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(extension as AllowedFileType)) {
      const allowedTypes = FILE_UPLOAD.ALLOWED_TYPES.join(', ');
      throw new Error(`Неподдерживаемый формат файла. Разрешены: ${allowedTypes}`);
    }
  }

  private validateName(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Имя файла не может быть пустым');
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(this.name)) {
      throw new Error('Имя файла содержит недопустимые символы');
    }
  }

  getExtension(): string {
    const dotIndex = this.name.lastIndexOf('.');
    return dotIndex === -1 ? '' : this.name.substring(dotIndex).toLowerCase();
  }

  getSizeInMB(): number {
    return Math.round((this.size / (1024 * 1024)) * 100) / 100;
  }

  getSizeFormatted(): string {
    const mb = this.getSizeInMB();
    if (mb < 1) {
      const kb = Math.round((this.size / 1024) * 10) / 10;
      return `${kb} KB`;
    }
    return `${mb} MB`;
  }

  getBaseName(): string {
    const dotIndex = this.name.lastIndexOf('.');
    return dotIndex === -1 ? this.name : this.name.substring(0, dotIndex);
  }

  isTextFile(): boolean {
    const textExtensions = ['.txt', '.md'];
    return textExtensions.includes(this.getExtension());
  }

  isDocumentFile(): boolean {
    const documentExtensions = ['.pdf', '.docx'];
    return documentExtensions.includes(this.getExtension());
  }

  equals(other: FileInfo): boolean {
    return (
      this.name === other.name &&
      this.size === other.size &&
      this.type === other.type &&
      this.lastModified === other.lastModified
    );
  }

  static fromFile(file: File): FileInfo {
    return new FileInfo(
      file.name,
      file.size,
      file.type,
      file.lastModified
    );
  }

  toJSON() {
    return {
      name: this.name,
      size: this.size,
      sizeFormatted: this.getSizeFormatted(),
      type: this.type,
      extension: this.getExtension(),
      baseName: this.getBaseName(),
      lastModified: this.lastModified,
      isTextFile: this.isTextFile(),
      isDocumentFile: this.isDocumentFile()
    };
  }
}