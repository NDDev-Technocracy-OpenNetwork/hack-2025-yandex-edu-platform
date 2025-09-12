import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../infrastructure/api/client';

interface FileTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  fileId: string;
  filename: string;
}

interface FileText {
  id: string;
  originalFilename: string;
  extractedText: string;
  fileSize: number;
  uploadedAt: string;
}

export const FileTextModal: React.FC<FileTextModalProps> = ({
  isOpen,
  onClose,
  courseId,
  fileId,
  filename
}) => {
  const [fileText, setFileText] = useState<FileText | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId && fileId) {
      fetchFileText();
    }
  }, [isOpen, courseId, fileId]);

  const fetchFileText = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<FileText>(
        `/teacher/courses/${courseId}/files/${fileId}/text`
      );
      setFileText(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить текст файла');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFileText(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Извлеченный текст</h2>
            <p className="text-sm text-gray-600 mt-1">{filename}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка текста...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 mb-2">Ошибка загрузки</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchFileText}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          ) : fileText ? (
            <div className="h-full flex flex-col">
              {/* File Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Размер файла:</span>
                    <span className="ml-2 font-medium">{(fileText.fileSize / 1024 / 1024).toFixed(2)} МБ</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Загружен:</span>
                    <span className="ml-2 font-medium">
                      {new Date(fileText.uploadedAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Символов текста:</span>
                    <span className="ml-2 font-medium">{fileText.extractedText.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Строк:</span>
                    <span className="ml-2 font-medium">{fileText.extractedText.split('\n').length}</span>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto min-h-0">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {fileText.extractedText || 'Текст не извлечен или файл пустой'}
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};