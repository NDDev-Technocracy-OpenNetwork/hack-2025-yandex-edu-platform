import React from 'react';
import { Course } from '../../../domain/entities/Course';
import { formatFileSize, formatDate } from '../../../infrastructure/utils/formatters';

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
  showActions?: boolean;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onClick,
  showActions = true,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(course);
    }
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'text-success-green bg-green-50 border-green-200';
      case 'draft':
        return 'text-warning-orange bg-orange-50 border-orange-200';
      case 'archived':
        return 'text-gray-500 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архивный';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div 
      className={`card cursor-pointer transition-all duration-normal ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {course.description}
          </p>
        </div>
        
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ml-4
          ${getStatusColor(course.status)}
        `}>
          {getStatusText(course.status)}
        </span>
      </div>

      <div className="space-y-3">
        {/* Course Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">
              {course.metadata?.nodeCount || 0}
            </div>
            <div className="text-xs text-gray-500">узлов</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">
              {course.metadata?.connectionCount || 0}
            </div>
            <div className="text-xs text-gray-500">связей</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">
              {course.metadata?.fileSize ? formatFileSize(course.metadata.fileSize) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">размер</div>
          </div>
        </div>

        {/* Course Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {course.metadata?.originalFileName && (
              <span className="font-mono text-xs">
                {course.metadata.originalFileName}
              </span>
            )}
          </div>
          <span>
            {formatDate(course.createdAt)}
          </span>
        </div>

        {/* Progress bar for processing status */}
        {course.status === 'draft' && course.metadata?.processingProgress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Обработка</span>
              <span className="text-gray-500">{course.metadata.processingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-brand-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${course.metadata.processingProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle view action
              }}
            >
              Просмотр
            </button>
            
            {course.status === 'active' && (
              <button
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit action
                }}
              >
                Редактировать
              </button>
            )}
            
            <button
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle more options
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Loading overlay for processing courses */}
      {course.status === 'draft' && course.metadata?.processingProgress !== undefined && course.metadata.processingProgress < 100 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Обработка...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Course grid component for displaying multiple courses
interface CourseGridProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  onCourseClick,
  loading = false,
  emptyMessage = 'Курсы не найдены',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onClick={onCourseClick}
        />
      ))}
    </div>
  );
};