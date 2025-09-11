import React from 'react';

interface ErrorStateProps {
  type: 'network' | 'fileSize' | 'fileType' | 'processing' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}

const ERROR_CONFIGS = {
  network: {
    title: 'Ошибка соединения',
    message: 'Не удалось подключиться к серверу. Проверьте интернет-соединение и повторите попытку.',
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    showRetry: true
  },
  fileSize: {
    title: 'Файл слишком большой',
    message: 'Размер файла превышает максимально допустимый лимит в 50MB. Попробуйте загрузить файл меньшего размера.',
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
      </svg>
    ),
    showRetry: false
  },
  fileType: {
    title: 'Неподдерживаемый формат',
    message: 'Загруженный файл имеет неподдерживаемый формат. Используйте файлы PDF, Word, TXT или Markdown.',
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    showRetry: false
  },
  processing: {
    title: 'Ошибка обработки',
    message: 'Не удалось обработать загруженный документ. Возможно, файл поврежден или содержит нечитаемый контент.',
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    showRetry: true
  },
  generic: {
    title: 'Произошла ошибка',
    message: 'Что-то пошло не так. Попробуйте обновить страницу или повторить действие.',
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    showRetry: true
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  title,
  message,
  onRetry,
  onGoBack,
  className = ''
}) => {
  const config = ERROR_CONFIGS[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          {config.icon}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {displayTitle}
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {displayMessage}
        </p>
        
        <div className="space-y-4">
          {config.showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary w-full focus-ring"
            >
              Повторить попытку
            </button>
          )}
          
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="btn-secondary w-full focus-ring"
            >
              Вернуться назад
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized error components for common scenarios
export const NetworkError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState type="network" {...props} />
);

export const FileSizeError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState type="fileSize" {...props} />
);

export const FileTypeError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState type="fileType" {...props} />
);

export const ProcessingError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState type="processing" {...props} />
);

export const GenericError: React.FC<Omit<ErrorStateProps, 'type'>> = (props) => (
  <ErrorState type="generic" {...props} />
);

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<any> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<any> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || GenericError;
      return (
        <FallbackComponent 
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}