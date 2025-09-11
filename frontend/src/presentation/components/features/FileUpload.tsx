import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Размер файла превышает максимальный лимит (20MB). Текущий размер: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Неподдерживаемый тип файла. Разрешенные типы: PDF, Word, TXT, Markdown`;
    }

    return null;
  }, []);

  const handleFileSelection = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-normal
          ${isDragOver 
            ? 'border-brand-primary bg-bg-hover' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploadError ? 'border-danger-red bg-red-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors
            ${isDragOver ? 'bg-brand-primary' : 'bg-gray-100'}
          `}>
            <svg 
              className={`w-8 h-8 ${isDragOver ? 'text-white' : 'text-gray-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Отпустите файл для загрузки' : 'Загрузите документ'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Перетащите файл сюда или нажмите для выбора
            </p>
            <button
              onClick={handleButtonClick}
              className="btn-primary focus-ring"
            >
              Выбрать файл
            </button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Поддерживаемые форматы: PDF, Word, TXT, Markdown</p>
            <p>Максимальный размер: 20MB</p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Ошибка загрузки</h4>
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};