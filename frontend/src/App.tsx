import React, { useState } from 'react';
import { UserRole } from './domain/types/User';
import { LandingPage } from './presentation/components/pages/LandingPage';
import { StudentPage } from './presentation/components/pages/StudentPage';
import { TeacherPage } from './presentation/components/pages/TeacherPage';
import { FileUpload } from './presentation/components/features/FileUpload';
import { ProcessingStatus } from './presentation/components/features/ProcessingStatus';
import { CourseGrid } from './presentation/components/features/CourseCard';
import { ErrorBoundary } from './presentation/components/common/ErrorStates';
import { SimpleHeader, Header } from './presentation/components/common/Header';
import { Footer } from './presentation/components/common/Footer';
import { useAppStore } from './presentation/stores/useAppStore';

type AppView = 'landing' | 'teacher' | 'student' | 'upload' | 'processing';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const { courses } = useAppStore();

  const handleRoleSelect = (role: UserRole) => {
    setCurrentView(role === 'teacher' ? 'teacher' : 'student');
  };

  const handleFileSelect = (file: File) => {
    setCurrentFileName(file.name);
    setCurrentView('processing');
    // Simulate file processing
    setTimeout(() => {
      // This would be replaced with actual API call
      console.log('Processing file:', file.name);
    }, 1000);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <div className="min-h-screen bg-white">
            <Header onRoleSelect={handleRoleSelect} />
            <LandingPage onRoleSelect={handleRoleSelect} />
          </div>
        );

      case 'teacher':
        return <TeacherPage onBack={handleBackToLanding} />;

      case 'student':
        return <StudentPage onBack={handleBackToLanding} />;

      case 'processing':
        return (
          <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/80 to-gray-50 flex flex-col">
            <SimpleHeader 
              title="Обработка документа" 
              onBack={() => setCurrentView('teacher')}
            />
            <div className="py-8 pt-20 flex-grow">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                  <p className="text-gray-600">
                    Создание интерактивного графа знаний
                  </p>
                </div>

              <ProcessingStatus 
                fileName={currentFileName}
                uploadStatus="processing"
                uploadProgress={75}
              />

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setCurrentView('teacher')}
                  className="btn-secondary"
                >
                  Вернуться к курсам
                </button>
              </div>
              </div>
            </div>
            <Footer />
          </div>
        );

      default:
        return <LandingPage onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {renderCurrentView()}
      </div>
    </ErrorBoundary>
  );
}

export default App;