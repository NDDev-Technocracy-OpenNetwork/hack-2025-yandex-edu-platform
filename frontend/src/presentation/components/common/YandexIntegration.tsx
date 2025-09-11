import React from 'react';

interface YandexIntegrationProps {
  showRover?: boolean;
  className?: string;
}

export const YandexIntegration: React.FC<YandexIntegrationProps> = ({
  showRover = false,
  className = ''
}) => {
  return (
    <div className={`yandex-integration ${className}`}>
      {showRover && (
        <div className="mb-8 text-center">
          <img 
            src="/background2.webp"
            alt="Яндекс Ровер - интеграция с экосистемой" 
            className="max-w-md mx-auto rounded-2xl shadow-lg"
          />
          <p className="text-sm text-gray-500 mt-3">
            Платформа работает в экосистеме Яндекс Образования
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center mb-4">
          <img 
            src="/edu_yandex.svg" 
            alt="Яндекс Образование" 
            className="h-8 mr-3"
          />
          <h3 className="text-lg font-semibold text-gray-900">
            Интеграция с экосистемой Яндекса
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Доступные интеграции</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Яндекс.Диск для хранения материалов
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Яндекс.Телемост для онлайн-занятий
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Яндекс.Учебник для создания заданий
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                API для внешних сервисов
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Технологии</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Yandex Cloud для обработки документов
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                YandexGPT для анализа содержания
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Yandex DataSphere для ML-моделей
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Yandex Tracker для управления проектами
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-purple-100">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">
                Разработано для образовательных учреждений
              </h5>
              <p className="text-sm text-gray-600">
                Платформа создана специально для интеграции в образовательный процесс 
                с учетом требований безопасности и производительности Яндекс Образования.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения логотипа в хедере
export const YandexLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <img 
      src="/edu_yandex.svg" 
      alt="Яндекс Образование" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

// Мини-компонент для ровера
export const RoverImage: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className={`text-center ${className}`}>
      <img 
        src="/background2.webp"
        alt="Яндекс Ровер" 
        className={`${sizeClasses[size]} mx-auto rounded-xl shadow-md`}
      />
    </div>
  );
};