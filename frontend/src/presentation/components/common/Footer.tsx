import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Разработано</span>
            <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold tracking-wide">
                ITMOGPT.Team
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};