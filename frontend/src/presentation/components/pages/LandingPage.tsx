import React, { useState, useEffect } from 'react';
import { UserRole } from '../../../domain/types/User';
import { useAppStore } from '../../stores/useAppStore';
import { Footer } from '../common/Footer';

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onRoleSelect }) => {
  const { setUserRole } = useAppStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = [
    {
      src: "/for_instructors.png",
      alt: "Для преподавателей",
      role: "teacher" as UserRole,
      decorations: {
        color: "blue",
        elements: [
          { type: "circle", size: "w-6 h-6", position: "top-4 left-8", color: "bg-blue-500", animation: "animate-pulse" },
          { type: "square", size: "w-8 h-8", position: "top-2 left-20", color: "border-2 border-blue-400", animation: "rotate-12 hover:rotate-45 transition-transform duration-700" },
          { type: "line", size: "w-12 h-1", position: "top-8 right-4", color: "bg-blue-400", animation: "animate-pulse" },
          { type: "circle", size: "w-4 h-4", position: "bottom-4 right-12", color: "bg-purple-400", animation: "opacity-70 hover:animate-bounce" },
          { type: "circle", size: "w-6 h-6", position: "bottom-2 right-24", color: "border border-purple-300", animation: "hover:animate-spin" }
        ]
      }
    },
    {
      src: "/for_students.png",
      alt: "Для студентов",
      role: "student" as UserRole,
      decorations: {
        color: "green",
        elements: [
          { type: "square", size: "w-5 h-5", position: "top-2 right-8", color: "bg-green-500", animation: "rotate-45 opacity-60 hover:rotate-90 transition-transform duration-500" },
          { type: "circle", size: "w-7 h-7", position: "top-4 right-20", color: "border-2 border-green-400", animation: "animate-pulse" },
          { type: "line", size: "w-10 h-1", position: "top-6 left-4", color: "bg-green-400", animation: "animate-pulse" },
          { type: "triangle", size: "w-4 h-4", position: "bottom-4 left-16", color: "bg-blue-400", animation: "opacity-70 hover:animate-pulse" },
          { type: "gradient", size: "w-8 h-2", position: "bottom-6 left-28", color: "bg-gradient-to-r from-green-400 to-blue-400", animation: "opacity-60 hover:opacity-100 transition-opacity duration-300" }
        ]
      }
    }
  ];

  const backgroundContent = [
    {
      background: "/background.png",
      title: "Интеллектуальный анализ",
      subtitle: "ИИ-технологии Яндекса",
      features: [
        "Извлечение понятий",
        "Семантические связи"
      ]
    },
    {
      background: "/background2.webp", 
      title: "Интерактивные графы",
      subtitle: "Современная визуализация",
      features: [
        "Динамическая навигация",
        "Адаптивное отображение"
      ]
    },
    {
      background: "/background3.webp", 
      title: "Образовательная экосистема",
      subtitle: "Интеграция с Яндекс.Образованием",
      features: [
        "Персонализация обучения",
        "Синхронизация прогресса"
      ]
    }
  ];

  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [backgroundTransitioning, setBackgroundTransitioning] = useState(false);

  useEffect(() => {
    const backgroundInterval = setInterval(() => {
      if (!backgroundTransitioning) {
        setBackgroundTransitioning(true);
        setTimeout(() => {
          setBackgroundIndex((prev) => (prev + 1) % backgroundContent.length);
          setBackgroundTransitioning(false);
        }, 150);
      }
    }, 4000); // Change every 4 seconds

    return () => clearInterval(backgroundInterval);
  }, [backgroundTransitioning]);

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    onRoleSelect(role);
  };

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 150);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 150);
  };

  const selectImage = (index: number) => {
    if (index === currentImageIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [isTransitioning]);

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Основной контент */}
      <div className="flex items-center justify-center py-16 px-4 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="relative inline-block mb-6">
            <h1 className="text-5xl font-bold text-gray-900 font-primary">
              Преобразование документов в интерактивные графы знаний
            </h1>
            
            {/* Yandex 2025 NEW Label */}
            <div className="absolute top-0 -right-8 transform rotate-12">
              <div className="bg-gradient-to-r from-brand-primary to-warning-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
                <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                  Yandex 2025 NEW
                </span>
              </div>
            </div>
          </div>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-primary">
          Система преобразования документов в интерактивные образовательные материалы
        </p>

        {/* Background Images Sequence - Chaotic Layout */}
        <div className="relative mb-12 max-w-7xl mx-auto px-4">
          {/* First Background - Left positioned */}
          <div className="relative mb-8 transform -rotate-1">
            <div className="relative h-[280px] max-w-4xl rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/background.png)` }} />
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-xs">
                  <h3 className="text-lg font-bold text-white mb-2">Интеллектуальный анализ</h3>
                  <p className="text-xs text-gray-300 mb-3">ИИ-технологии Яндекса</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full" />
                      <span className="text-white/90 text-xs">Извлечение понятий</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full" />
                      <span className="text-white/90 text-xs">Семантические связи</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Background - Right positioned */}
          <div className="relative mb-8 ml-auto max-w-4xl transform rotate-1">
            <div className="relative h-[280px] rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/background2.webp)` }} />
              <div className="absolute top-6 right-6 z-10">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-xs">
                  <h3 className="text-lg font-bold text-white mb-2">Интерактивные графы</h3>
                  <p className="text-xs text-gray-300 mb-3">Современная визуализация</p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full" />
                      <span className="text-white/90 text-xs">Динамическая навигация</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full" />
                      <span className="text-white/90 text-xs">Адаптивное отображение</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Third Background - Center positioned */}
          <div className="relative mb-8 mx-auto max-w-4xl transform -rotate-0.5">
            <div className="relative h-[280px] rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/background3.webp)` }} />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-xs text-center">
                  <h3 className="text-lg font-bold text-white mb-2">Образовательная экосистема</h3>
                  <p className="text-xs text-gray-300 mb-3">Интеграция с Яндекс.Образованием</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-1 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full" />
                      <span className="text-white/90 text-xs">Персонализация обучения</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-1 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full" />
                      <span className="text-white/90 text-xs">Синхронизация прогресса</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Декоративные элементы */}
          <div className="absolute top-8 left-1/4 w-16 h-16 border-2 border-brand-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute top-12 right-1/3 w-12 h-12 bg-warning-orange/10 rotate-45 animate-bounce"></div>
          <div className="absolute bottom-8 left-1/2 w-24 h-1 bg-gradient-to-r from-brand-primary to-warning-orange rounded-full"></div>
          
          {/* Carousel Image Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className={`transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="relative flex justify-center items-center w-full h-[500px]">
                {/* Dynamic Geometric Decorations */}
                {currentImage.decorations.elements.map((decoration, index) => (
                  <div
                    key={index}
                    className={`absolute ${decoration.size} ${decoration.color} ${decoration.position} ${decoration.animation}`}
                    style={decoration.type === 'triangle' ? {clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'} : {}}
                  />
                ))}
                
                {/* Main Carousel Image */}
                <div className="relative mx-auto max-w-2xl">
                  <img 
                    src={currentImage.src} 
                    alt={currentImage.alt} 
                    className="w-full h-auto object-contain max-h-[450px]"
                  />
                  
                  {/* Click to select role */}
                  <button
                    onClick={() => handleRoleSelection(currentImage.role)}
                    className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors duration-200 rounded-lg group"
                    title={`Войти как ${currentImage.alt.toLowerCase()}`}
                  >
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
                        Войти как {currentImage.alt.toLowerCase()}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <button
              onClick={prevImage}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextImage}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-brand-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                } disabled:opacity-50`}
              />
            ))}
          </div>

          
          {/* Дополнительные декоративные элементы */}
          <div className="absolute bottom-4 left-1/4 w-14 h-14 border border-warning-orange/30 rounded-full animate-spin" style={{animationDuration: '15s'}}></div>
          <div className="absolute top-16 right-1/4 w-6 h-6 bg-brand-primary/20 rotate-45 hover:rotate-90 transition-transform duration-500"></div>
        </div>

        {/* Feature Highlights - Yandex Practicum Style */}
        <div className="mt-16 max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Умный анализ */}
            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 shadow-md flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Умный анализ</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Автоматическое извлечение ключевых понятий и связей из документов
              </p>
              <div className="flex items-center text-xs text-blue-600 font-semibold group-hover:text-blue-700">
                <span>AI-технологии</span>
                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Интерактивные графы */}
            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 shadow-md flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Интерактивные графы</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Визуализация знаний в виде интерактивных графов с навигацией
              </p>
              <div className="flex items-center text-xs text-green-600 font-semibold group-hover:text-green-700">
                <span>Визуализация</span>
                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Экосистема Яндекса */}
            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 shadow-md flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-warning-orange rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Экосистема Яндекса</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Интеграция с сервисами Яндекс Образования и инструментами разработки
              </p>
              <div className="flex items-center text-xs text-orange-600 font-semibold group-hover:text-orange-700">
                <span>Интеграция</span>
                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Limitations - Modern Design */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Технические ограничения</h4>
              <p className="text-gray-600">Текущие лимиты платформы для оптимальной работы</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">50MB</div>
                <div className="text-sm text-gray-600 font-medium">Размер файла</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">200</div>
                <div className="text-sm text-gray-600 font-medium">Узлы графа</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">500</div>
                <div className="text-sm text-gray-600 font-medium">Связи</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};