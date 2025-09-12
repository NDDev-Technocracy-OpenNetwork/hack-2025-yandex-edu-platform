import React, { useState, useEffect } from 'react';
import { useCourseCreation } from '../../hooks/useTeacher';
import { useUI, useUpload } from '../../stores/useAppStore';
import { PROCESSING_STATES } from '../../../shared/constants';
import { Course } from '../../../domain/entities/Course';
import { FileTextModal } from './FileTextModal';
import { ConfirmationModal } from './ConfirmationModal';
import { CourseConceptsModal } from './CourseConceptsModal';
import { apiClient } from '../../../infrastructure/api/client';

interface CourseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
  editingCourse?: Course | null;
}

export const CourseCreationModal: React.FC<CourseCreationModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
  editingCourse
}) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'upload' | 'processing' | 'concepts' | 'graph'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [isEditingExistingCourse, setIsEditingExistingCourse] = useState(false);
  const [complexity, setComplexity] = useState<'simple' | 'complex'>('simple');
  const [concepts, setConcepts] = useState<any[]>([]);
  const [parsedText, setParsedText] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isFileTextModalOpen, setIsFileTextModalOpen] = useState(false);
  const [selectedFileForViewing, setSelectedFileForViewing] = useState<{courseId: string, fileId: string, filename: string} | null>(null);
  const [processingFiles, setProcessingFiles] = useState<{[key: string]: 'parsing' | 'completed' | 'error'}>({});
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'file' | 'course';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'file',
    id: '',
    name: ''
  });
  const [isConceptsModalOpen, setIsConceptsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { createCourse, uploadFiles, isCreating } = useCourseCreation();
  const { uploadState, setUploadState, resetUploadState } = useUpload();
  const { setError } = useUI();

  // Initialize modal for editing
  useEffect(() => {
    if (editingCourse && isOpen) {
      setTitle(editingCourse.title);
      setDescription(editingCourse.description || '');
      setCreatedCourseId(editingCourse.id);
      setIsEditingExistingCourse(true);
      
      // If course has concepts, skip concept editing and go straight to upload
      if (editingCourse.concepts && editingCourse.concepts.length > 0) {
        setCurrentStep('upload');
      } else {
        setCurrentStep('upload');
      }
    } else if (isOpen) {
      // For new courses, start at form step
      setCurrentStep('form');
      setIsEditingExistingCourse(false);
    }
  }, [editingCourse, isOpen]);

  const handleClose = () => {
    setCurrentStep('form');
    setTitle('');
    setDescription('');
    setCreatedCourseId(null);
    setIsEditingExistingCourse(false);
    setComplexity('simple');
    setConcepts([]);
    setParsedText('');
    setUploadedFiles([]);
    setIsFileTextModalOpen(false);
    setSelectedFileForViewing(null);
    setConfirmationModal({ isOpen: false, type: 'file', id: '', name: '' });
    setIsConceptsModalOpen(false);
    setIsDeleting(false);
    setProcessingFiles({});
    resetUploadState();
    onClose();
  };

  // Load uploaded files when courseId is available
  useEffect(() => {
    if (createdCourseId) {
      fetchUploadedFiles();
    }
  }, [createdCourseId]);

  const fetchUploadedFiles = async () => {
    if (!createdCourseId) return;
    
    try {
      const files = await apiClient.get(`/teacher/courses/${createdCourseId}/files`);
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleViewFile = (fileId: string, filename: string) => {
    if (!createdCourseId) return;
    
    setSelectedFileForViewing({
      courseId: createdCourseId,
      fileId,
      filename
    });
    setIsFileTextModalOpen(true);
  };

  const handleDeleteFile = (fileId: string, filename: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'file',
      id: fileId,
      name: filename
    });
  };

  const confirmDelete = async () => {
    if (!createdCourseId) return;
    
    setIsDeleting(true);
    try {
      if (confirmationModal.type === 'file') {
        await apiClient.delete(`/teacher/courses/${createdCourseId}/files/${confirmationModal.id}`);
        await fetchUploadedFiles(); // Refresh files list
        setError({ message: 'Файл успешно удален', code: 'SUCCESS' });
      }
    } catch (error) {
      setError({ message: 'Не удалось удалить файл', code: 'DELETE_ERROR' });
    } finally {
      setIsDeleting(false);
      setConfirmationModal({ isOpen: false, type: 'file', id: '', name: '' });
    }
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.md', '.txt', '.csv', '.xlsx'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!createdCourseId) {
      setError({ message: 'Сначала создайте курс', code: 'NO_COURSE_ID' });
      return;
    }

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

    if (validFiles.length === 0) return;

    // Initialize parsing status for each valid file
    const initialProcessingState = { ...processingFiles };
    validFiles.forEach((file) => {
      initialProcessingState[file.name] = 'parsing';
    });
    setProcessingFiles(initialProcessingState);

    // Upload files immediately
    try {
      await uploadFiles(createdCourseId, validFiles, complexity);
      
      // Mark files as completed after successful upload
      const completedProcessingState = { ...processingFiles };
      validFiles.forEach((file) => {
        completedProcessingState[file.name] = 'completed';
      });
      setProcessingFiles(completedProcessingState);
      
      // Refresh files list after successful upload
      await fetchUploadedFiles();
      
      // Clear file input
      event.target.value = '';
      
      // Clear processing state after a short delay to show success
      setTimeout(() => {
        const clearedProcessingState = { ...processingFiles };
        validFiles.forEach((file) => {
          delete clearedProcessingState[file.name];
        });
        setProcessingFiles(clearedProcessingState);
      }, 2000);
      
    } catch (error) {
      // Mark files as error
      const errorProcessingState = { ...processingFiles };
      validFiles.forEach((file) => {
        errorProcessingState[file.name] = 'error';
      });
      setProcessingFiles(errorProcessingState);
      
      console.error('Error uploading files:', error);
      setError({ message: 'Не удалось загрузить файлы', code: 'UPLOAD_ERROR' });
    }
  };

  const handleContinue = async () => {
    if (!createdCourseId) {
      setError({ message: 'Ошибка: курс не создан', code: 'NO_COURSE_ID' });
      return;
    }

    // If editing existing course with concepts, load them and go to concepts step
    if (isEditingExistingCourse && editingCourse?.concepts && editingCourse.concepts.length > 0) {
      try {
        // Load existing concepts
        const conceptsResponse = await apiClient.get(`/teacher/courses/${createdCourseId}/concepts`);
        
        setCurrentStep('concepts');
        setConcepts(conceptsResponse.concepts || []);
        setParsedText(`Курс содержит ${conceptsResponse.count || 0} концептов. Вы можете перейти к созданию графа или отредактировать концепты.`);
      } catch (conceptError) {
        console.error('Error loading existing concepts:', conceptError);
        setCurrentStep('concepts');
        setConcepts([]);
        setParsedText(`Курс содержит концепты, но произошла ошибка при их загрузке. Попробуйте обновить страницу.`);
      }
      return;
    }

    if (uploadedFiles.length === 0) {
      setError({ message: 'Загрузите хотя бы один файл для продолжения', code: 'NO_FILES_UPLOADED' });
      return;
    }

    try {
      setCurrentStep('processing');
      setUploadState({ state: PROCESSING_STATES.PROCESSING });
      
      // Call backend API to generate concepts
      const response = await apiClient.post(`/teacher/courses/${createdCourseId}/generate-concepts`);
      
      setUploadState({ state: PROCESSING_STATES.EXTRACTING });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadState({ state: PROCESSING_STATES.LINKING });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadState({ state: PROCESSING_STATES.SUCCESS });
      
      // Wait a bit to show success, then go to concepts step
      setTimeout(async () => {
        try {
          // Load generated concepts
          const conceptsResponse = await apiClient.get(`/teacher/courses/${createdCourseId}/concepts`);
          
          setCurrentStep('concepts');
          setConcepts(conceptsResponse.concepts || []);
          setParsedText(`Успешно сгенерированы ${conceptsResponse.count || 0} концептов из ${uploadedFiles.length} файлов. Символов текста: ${response.extracted_text_length || 0}`);
        } catch (conceptError) {
          console.error('Error loading concepts:', conceptError);
          setCurrentStep('concepts');
          setConcepts([]);
          setParsedText(`Концепты сгенерированы, но произошла ошибка при их загрузке. Попробуйте обновить страницу.`);
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error generating concepts:', error);
      setUploadState({ state: PROCESSING_STATES.ERROR });
      setError({ 
        message: error instanceof Error ? error.message : 'Произошла ошибка при обработке запроса',
        code: 'CONCEPT_GENERATION_ERROR'
      });
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
            {currentStep === 'form' && (editingCourse ? 'Редактирование курса' : 'Создание нового курса')}
            {currentStep === 'upload' && (editingCourse ? 'Добавление материалов' : 'Загрузка материалов')}
            {currentStep === 'processing' && 'Обработка курса'}
            {currentStep === 'concepts' && 'Редактирование концептов'}
            {currentStep === 'graph' && 'Создание графа'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={currentStep === 'processing' || currentStep === 'graph'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'form' ? 'bg-blue-500 text-white' : 
              editingCourse ? 'bg-green-500 text-white' : 'bg-green-500 text-white'
            }`}>1</div>
            <div className="w-8 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-500 transition-all duration-300 ${
                currentStep !== 'form' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'form' ? 'bg-gray-200 text-gray-500' :
              currentStep === 'upload' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>2</div>
            <div className="w-8 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-500 transition-all duration-300 ${
                ['processing', 'concepts', 'graph'].includes(currentStep) ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'processing' ? 'bg-blue-500 text-white' : 
              ['concepts', 'graph'].includes(currentStep) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>3</div>
            <div className="w-8 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-500 transition-all duration-300 ${
                ['concepts', 'graph'].includes(currentStep) ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'concepts' ? 'bg-blue-500 text-white' : 
              currentStep === 'graph' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>4</div>
            <div className="w-8 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-500 transition-all duration-300 ${
                currentStep === 'graph' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'graph' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>5</div>
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
              <h3 className="font-medium text-blue-900 mb-2">
                {editingCourse ? `Редактирование курса "${editingCourse.title}"` : 'Курс создан успешно!'}
              </h3>
              <p className="text-sm text-blue-700">
                {editingCourse 
                  ? 'Выберите сложность графа и загрузите дополнительные материалы для обновления карты концепций'
                  : 'Теперь выберите сложность графа и загрузите материалы для автоматического создания карты концепций'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сложность графа
              </label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setComplexity('simple')}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    complexity === 'simple' 
                      ? 'border-blue-500 bg-blue-50 text-blue-900' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-sm">Простая</div>
                  <div className="text-xs text-gray-600">Меньше узлов и связей</div>
                </button>
                <button
                  onClick={() => setComplexity('complex')}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    complexity === 'complex' 
                      ? 'border-blue-500 bg-blue-50 text-blue-900' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-sm">Сложная</div>
                  <div className="text-xs text-gray-600">Больше узлов и связей</div>
                </button>
              </div>
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

              {/* Show processing files */}
              {Object.keys(processingFiles).length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Обрабатываемые файлы:</h4>
                  {Object.entries(processingFiles).map(([fileName, status]) => (
                    <div key={fileName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {status === 'parsing' && (
                            <>
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span className="text-sm text-blue-700 font-medium">Парсинг...</span>
                            </>
                          )}
                          {status === 'completed' && (
                            <>
                              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-green-700 font-medium">Обработан</span>
                            </>
                          )}
                          {status === 'error' && (
                            <>
                              <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-sm text-red-700 font-medium">Ошибка</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{fileName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All Files - Always visible */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Файлы курса:</h4>
                  <span className="text-xs text-gray-500">{uploadedFiles.length} файл(ов)</span>
                </div>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    Файлы не загружены. Выберите файлы выше для добавления в курс.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{file.originalFilename}</span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-600">
                            <span>{(file.fileSize / 1024 / 1024).toFixed(2)} МБ</span>
                            <span className="mx-2">•</span>
                            <span>{file.extractedTextLength} символов</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleViewFile(file.id, file.originalFilename)}
                            className="px-2 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                          >
                            Текст
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, file.originalFilename)}
                            className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                onClick={handleContinue}
                disabled={uploadedFiles.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditingExistingCourse && editingCourse?.concepts && editingCourse.concepts.length > 0 
                  ? 'Сохранить изменения' 
                  : 'Продолжить'
                }
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
              <div className="space-y-4 pt-4">
                <p className="text-center text-sm text-red-600 mb-4">
                  Произошла ошибка при обработке запроса. Попробуйте еще раз.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Попробовать снова
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Concepts Editing */}
        {currentStep === 'concepts' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-green-900">Концепты сгенерированы!</h3>
                {createdCourseId && (
                  <button
                    onClick={() => setIsConceptsModalOpen(true)}
                    className="px-3 py-1 text-xs bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
                  >
                    🔗 Просмотр связей
                  </button>
                )}
              </div>
              <p className="text-sm text-green-700">
                ИИ извлек {concepts.length} концептов из загруженных материалов. Отредактируйте названия при необходимости.
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              <h4 className="font-medium text-gray-900">Извлеченные концепты:</h4>
              {concepts.map((concept, index) => (
                <div key={concept.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название концепта
                    </label>
                    <input
                      type="text"
                      value={concept.title}
                      onChange={(e) => {
                        const updatedConcepts = [...concepts];
                        updatedConcepts[index] = { ...concept, title: e.target.value };
                        setConcepts(updatedConcepts);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Уровень: <span className="font-medium">{concept.bloomLevel || 'не определен'}</span>
                    </span>
                    <button
                      onClick={() => {
                        const updatedConcepts = concepts.filter((_, i) => i !== index);
                        setConcepts(updatedConcepts);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {concepts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Концепты не найдены
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={() => setCurrentStep('graph')}
                disabled={concepts.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Построить граф
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Graph Building */}
        {currentStep === 'graph' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Создание графа знаний</h3>
              <p className="text-sm text-blue-700">
                Система генерирует описания для каждого концепта и создает связи между ними
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Создание контента для концептов...
              </h3>
              <p className="text-sm text-gray-600">
                ИИ анализирует материалы и создает подробные описания
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Статистика графа:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Концептов:</span>
                  <span className="ml-2 font-medium">{concepts.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Сложность:</span>
                  <span className="ml-2 font-medium">{complexity === 'simple' ? 'Простая' : 'Сложная'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Файлов обработано:</span>
                  <span className="ml-2 font-medium">{uploadedFiles.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Статус:</span>
                  <span className="ml-2 font-medium text-blue-600">Обработка...</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-4">
              <button
                onClick={() => {
                  // Simulate graph creation completion
                  setTimeout(() => {
                    setError({ message: 'Курс успешно создан! Переходим к просмотру...', code: 'SUCCESS' });
                    setTimeout(() => {
                      if (onCourseCreated) onCourseCreated();
                      handleClose();
                    }, 1500);
                  }, 3000);
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Завершить создание курса
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Text Modal */}
      {selectedFileForViewing && (
        <FileTextModal
          isOpen={isFileTextModalOpen}
          onClose={() => {
            setIsFileTextModalOpen(false);
            setSelectedFileForViewing(null);
          }}
          courseId={selectedFileForViewing.courseId}
          fileId={selectedFileForViewing.fileId}
          filename={selectedFileForViewing.filename}
        />
      )}

      {/* Course Concepts Modal */}
      {createdCourseId && (
        <CourseConceptsModal
          isOpen={isConceptsModalOpen}
          onClose={() => setIsConceptsModalOpen(false)}
          courseId={createdCourseId}
          courseTitle={title || 'Курс'}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: 'file', id: '', name: '' })}
        onConfirm={confirmDelete}
        title={confirmationModal.type === 'file' ? 'Удалить файл' : 'Удалить курс'}
        message={
          confirmationModal.type === 'file'
            ? `Вы уверены, что хотите удалить файл "${confirmationModal.name}"? Это действие нельзя отменить.`
            : `Вы уверены, что хотите удалить курс "${confirmationModal.name}"? Будут удалены все файлы, концепты и связи. Это действие нельзя отменить.`
        }
        confirmText="Удалить"
        cancelText="Отмена"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};