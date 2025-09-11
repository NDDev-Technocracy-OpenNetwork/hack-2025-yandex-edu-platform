import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './presentation/components/common/ErrorStates';
import { LandingPage } from './presentation/components/pages/LandingPage';
import { StudentPage } from './presentation/components/pages/StudentPage';
import { TeacherPage } from './presentation/components/pages/TeacherPage';
import { Header } from './presentation/components/common/Header';
import { UserRole } from './domain/types/User';

const AppRouter: React.FC = () => {
  const handleRoleSelect = (role: UserRole) => {
    if (role === 'teacher') {
      window.location.href = '/teacher';
    } else {
      window.location.href = '/student';
    }
  };

  const handleBackToLanding = () => {
    window.location.href = '/';
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="min-h-screen bg-white">
                  <Header onRoleSelect={handleRoleSelect} />
                  <LandingPage onRoleSelect={handleRoleSelect} />
                </div>
              } 
            />
            <Route 
              path="/student" 
              element={<StudentPage onBack={handleBackToLanding} />} 
            />
            <Route 
              path="/teacher" 
              element={<TeacherPage onBack={handleBackToLanding} />} 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default AppRouter;