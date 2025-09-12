import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">ГрафиУм</h3>
            <p className="text-sm text-gray-600">Образовательная платформа для создания интерактивных графов знаний</p>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            {/* Разработано командой */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Разработано командой</span>
              <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold tracking-wide">
                  ITMOGPT.Team
                </span>
              </div>
              <span className="text-gray-600">для</span>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm">
                <img src="/edu_yandex.svg" alt="Яндекс Образование" className="h-4 w-auto" />
              </div>
            </div>

            {/* С любовью и котиками */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>С любовью</span>
              <div className="animate-pulse">❤️</div>
              <span>и котиками</span>
              <div className="flex space-x-1">
                <span className="animate-bounce" style={{animationDelay: '0s'}}>🐱</span>
                <span className="animate-bounce" style={{animationDelay: '0.1s'}}>🐈</span>
                <span className="animate-bounce" style={{animationDelay: '0.2s'}}>😸</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              MIT License • Open Source • Основано на принципах российской педагогической школы Л.С. Выготского
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};