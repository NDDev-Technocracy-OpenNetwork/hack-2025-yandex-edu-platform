import React from 'react';

interface ProcessingStatusProps {
  fileName?: string;
  uploadStatus?: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  uploadProgress?: number;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'upload',
    title: 'Загрузка файла',
    description: 'Передача документа на сервер',
    status: 'pending'
  },
  {
    id: 'parsing',
    title: 'Анализ документа',
    description: 'Извлечение текста и структуры',
    status: 'pending'
  },
  {
    id: 'extraction',
    title: 'Извлечение знаний',
    description: 'Выделение ключевых понятий и связей',
    status: 'pending'
  },
  {
    id: 'graph',
    title: 'Построение графа',
    description: 'Создание интерактивной карты знаний',
    status: 'pending'
  }
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  fileName = '',
  uploadStatus = 'idle',
  uploadProgress = 0 
}) => {

  const getStepStatus = (stepId: string): ProcessingStep['status'] => {
    if (uploadStatus === 'idle') return 'pending';
    if (uploadStatus === 'error') return 'error';
    
    switch (stepId) {
      case 'upload':
        return uploadStatus === 'uploading' ? 'processing' : 
               uploadStatus === 'processing' || uploadStatus === 'completed' ? 'completed' : 'pending';
      case 'parsing':
        return uploadStatus === 'processing' ? 'processing' : 
               uploadStatus === 'completed' ? 'completed' : 'pending';
      case 'extraction':
        return uploadStatus === 'processing' ? 'processing' : 
               uploadStatus === 'completed' ? 'completed' : 'pending';
      case 'graph':
        return uploadStatus === 'completed' ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 bg-danger-red rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        );
    }
  };

  if (uploadStatus === 'idle') {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        {fileName && (
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Обработка документа
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              {fileName}
            </p>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Загрузка</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {PROCESSING_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isActive = status === 'processing';
            
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getStatusIcon(status)}
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-base font-medium mb-1 ${
                    isActive ? 'text-brand-primary' : 
                    status === 'completed' ? 'text-success-green' : 
                    status === 'error' ? 'text-danger-red' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                  
                  {isActive && (
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-brand-primary">
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse mr-2"></div>
                        Обработка...
                      </div>
                    </div>
                  )}
                </div>

                {index < PROCESSING_STEPS.length - 1 && (
                  <div className={`absolute left-4 mt-8 w-0.5 h-8 ${
                    status === 'completed' ? 'bg-success-green' : 'bg-gray-200'
                  }`} style={{ marginLeft: '15px' }}></div>
                )}
              </div>
            );
          })}
        </div>

        {uploadStatus === 'completed' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-green-800">Обработка завершена</h4>
                <p className="text-sm text-green-700 mt-1">
                  Граф знаний успешно создан и готов к использованию
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">Ошибка обработки</h4>
                <p className="text-sm text-red-700 mt-1">
                  Не удалось обработать документ. Попробуйте загрузить файл заново.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};