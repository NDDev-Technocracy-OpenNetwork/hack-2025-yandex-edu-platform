import React, { useState, useEffect } from 'react';
import { UserRole } from '../../../domain/types/User';

interface HeaderProps {
  onRoleSelect?: (role: UserRole) => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onRoleSelect, className = '' }) => {
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const roles = [
    { text: 'Преподаватель', value: 'teacher' as UserRole },
    { text: 'Студент', value: 'student' as UserRole }
  ];

  useEffect(() => {
    const currentRole = roles[currentIndex];
    const fullText = currentRole.text;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Печатаем символы
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        } else {
          // Пауза перед удалением
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Удаляем символы
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        } else {
          // Переходим к следующему элементу
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, isDeleting ? 50 : 100); // Быстрее удаляем, медленнее печатаем

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentIndex]);

  // Анимация курсора
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleRoleClick = () => {
    const currentRole = roles[currentIndex];
    onRoleSelect?.(currentRole.value);
  };

  const toggleHeaderVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Кнопка показа хедера когда он скрыт */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
          title="Показать заголовок"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть - Логотип и название */}
          <div className="flex items-center">
            {/* Логотип в отдельном блоке */}
            <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <img 
                src="/edu_yandex.svg" 
                alt="Яндекс Образование" 
                className="h-6 w-auto"
              />
            </div>
            
            {/* Разделительная линия */}
            <div className="mx-4 h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            
            {/* Название платформы */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                Образовательная платформа 
                <span className="ml-2 font-bold text-brand-primary bg-gradient-to-r from-brand-primary to-warning-orange bg-clip-text text-transparent drop-shadow-sm hover:drop-shadow-md transition-all duration-200">
                  ВыготскийГраф
                </span>
              </h1>
            </div>
          </div>

          {/* Правая часть - Анимированные кнопки */}
          <div className="flex items-center space-x-3">
            {/* Статус индикатор */}
            <div className="hidden sm:flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Онлайн
            </div>
            
            <div className="relative group">
              {/* Анимированная кнопка с эффектом терминала */}
              <button
                onClick={handleRoleClick}
                className="relative inline-flex items-center px-4 py-2 bg-gray-900 text-green-400 font-mono text-sm rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl w-[180px] justify-start"
              >
                <span className="mr-2 text-green-500 font-bold">$</span>
                <span className="flex items-center overflow-hidden">
                  <span className="block">
                    {currentText}
                  </span>
                  <span 
                    className={`ml-1 w-2 h-4 bg-green-400 transition-opacity duration-100 ${
                      showCursor ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ minWidth: '2px' }}
                  />
                </span>
                
                {/* Hover эффект */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 group-hover:opacity-100 rounded-lg transition-all duration-300" />
                
                {/* Сканирующая линия */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent w-full h-full rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/30 to-transparent w-1/3 h-full animate-pulse"></div>
                </div>
              </button>

              {/* Подсказка с улучшенным дизайном */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-4 py-2 bg-gray-900 text-green-400 text-xs rounded-lg font-mono opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 border border-green-400/20 shadow-lg">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-t border-l border-green-400/20"></div>
                <span className="text-green-300">&gt;</span> Войти как {roles[currentIndex].text.toLowerCase()}
              </div>
            </div>

            {/* Дополнительная кнопка для переключения с современным дизайном */}
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % roles.length)}
              className="group relative p-2 text-gray-400 hover:text-brand-primary transition-all duration-200 rounded-lg hover:bg-gray-50"
              title="Переключить роль"
            >
              <svg className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              
              {/* Кольцевой эффект при hover */}
              <div className="absolute inset-0 rounded-lg bg-brand-primary opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </button>

            {/* Кнопка скрытия хедера */}
            <button
              onClick={toggleHeaderVisibility}
              className="group relative p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 rounded-lg hover:bg-gray-50"
              title={isVisible ? "Скрыть заголовок" : "Показать заголовок"}
            >
              <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isVisible ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </header>
    </>
  );
};

// Упрощенный header для внутренних страниц
interface SimpleHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ 
  title, 
  onBack, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  return (
    <>
      {/* Кнопка показа хедера когда он скрыт */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
          title="Показать заголовок"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Логотип в отдельном блоке */}
            <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <img 
                src="/edu_yandex.svg" 
                alt="Яндекс Образование" 
                className="h-6 w-auto"
              />
            </div>
            
            {/* Разделительная линия */}
            <div className="mx-4 h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            
            {/* Название страницы */}
            <div className="flex items-center">
              <div className="flex items-center mr-3">
                <span className="text-sm font-bold text-brand-primary bg-gradient-to-r from-brand-primary to-warning-orange bg-clip-text text-transparent">
                  ВГ
                </span>
                <span className="text-xs text-gray-400 ml-1">•</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="group inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Назад
              </button>
            )}

            {/* Кнопка скрытия хедера */}
            <button
              onClick={() => setIsVisible(false)}
              className="group relative p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 rounded-lg hover:bg-gray-50"
              title="Скрыть заголовок"
            >
              <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </header>
    </>
  );
};