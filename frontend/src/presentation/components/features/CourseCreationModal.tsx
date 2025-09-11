import React, { useState } from 'react';
import { useCourseCreation } from '../../hooks/useTeacher';
import { useUI, useUpload } from '../../stores/useAppStore';
import { PROCESSING_STATES } from '../../../shared/constants';

interface CourseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
}

export const CourseCreationModal: React.FC<CourseCreationModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated
}) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'upload' | 'processing'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  
  const { createCourse, uploadFiles, isCreating } = useCourseCreation();
  const { uploadState, setUploadState, resetUploadState } = useUpload();
  const { setError } = useUI();

  const handleClose = () => {
    setCurrentStep('form');
    setTitle('');
    setDescription('');
    setSelectedFiles([]);
    setCreatedCourseId(null);
    resetUploadState();
    onClose();
  };

  const handleCreateCourse = async () => {
    if (!title.trim()) {
      setError({ message: 'Название курса обязательно', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const course = await createCourse(title.trim(), description.trim());
      setCreatedCourseId(course.id);
      setCurrentStep('upload');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.md', '.txt', '.csv', '.xlsx'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(extension);
      const isValidSize = file.size <= maxSize;

      if (!isValidType) {
        setError({ message: `Неподдерживаемый тип файла: ${file.name}`, code: 'INVALID_FILE_TYPE' });
        return false;
      }
      if (!isValidSize) {
        setError({ message: `Файл слишком большой: ${file.name}`, code: 'FILE_TOO_LARGE' });
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUploadFiles = async () => {
    if (!createdCourseId || selectedFiles.length === 0) {
      setError({ message: 'Выберите файлы для загрузки', code: 'NO_FILES_SELECTED' });
      return;
    }

    try {
      setCurrentStep('processing');
      setUploadState({ state: PROCESSING_STATES.UPLOADING });
      
      await uploadFiles(createdCourseId, selectedFiles);
      
      // Simulate processing steps
      setUploadState({ state: PROCESSING_STATES.PROCESSING });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadState({ state: PROCESSING_STATES.EXTRACTING });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setUploadState({ state: PROCESSING_STATES.LINKING });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadState({ state: PROCESSING_STATES.SUCCESS });
      
      // Wait a bit to show success, then close
      setTimeout(() => {
        onCourseCreated?.();
        handleClose();
      }, 1500);
      
    } catch (error) {
      setUploadState({ state: PROCESSING_STATES.ERROR });
    }
  };

  const getProcessingMessage = () => {
    switch (uploadState.state) {
      case PROCESSING_STATES.UPLOADING:
        return 'Загрузка файлов...';
      case PROCESSING_STATES.PROCESSING:
        return 'Обработка документов...';
      case PROCESSING_STATES.EXTRACTING:
        return 'Извлечение концепций...';
      case PROCESSING_STATES.LINKING:
        return 'Создание связей...';
      case PROCESSING_STATES.SUCCESS:
        return 'Курс успешно создан!';
      case PROCESSING_STATES.ERROR:
        return 'Произошла ошибка при обработке';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep === 'form' && 'Создание нового курса'}
            {currentStep === 'upload' && 'Загрузка материалов'}
            {currentStep === 'processing' && 'Обработка курса'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={currentStep === 'processing'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'form' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>1</div>
            <div className="w-16 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-500 transition-all duration-300 ${
                currentStep !== 'form' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'form' ? 'bg-gray-200 text-gray-500' :
              currentStep === 'upload' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>2</div>
            <div className="w-16 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-500 transition-all duration-300 ${
                currentStep === 'processing' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>3</div>
          </div>
        </div>

        {/* Step 1: Course Form */}
        {currentStep === 'form' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название курса *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите название курса"
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание курса
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Краткое описание курса (необязательно)"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-1">
                {description.length}/500 символов
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={!title.trim() || isCreating}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Создание...' : 'Продолжить'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: File Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Курс создан успешно!</h3>
              <p className="text-sm text-blue-700">
                Теперь загрузите материалы для автоматического создания карты концепций
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите файлы
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.md,.txt,.csv,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Выберите файлы для загрузки</p>
                  <p className="text-sm text-gray-600">
                    PDF, DOCX, PPTX, MD, TXT, CSV, XLSX до 20 МБ каждый
                  </p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Выбранные файлы:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} МБ</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleUploadFiles}
                disabled={selectedFiles.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Загрузить и обработать
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 'processing' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              {uploadState.state === PROCESSING_STATES.SUCCESS ? (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : uploadState.state === PROCESSING_STATES.ERROR ? (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getProcessingMessage()}
              </h3>
              {uploadState.state !== PROCESSING_STATES.SUCCESS && uploadState.state !== PROCESSING_STATES.ERROR && (
                <p className="text-sm text-gray-600">
                  Это может занять несколько минут
                </p>
              )}
            </div>

            {uploadState.state === PROCESSING_STATES.ERROR && (
              <div className="flex items-center justify-center pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};