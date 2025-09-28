import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Star, Clock, BookOpen, Target, Zap, Award, Brain, Sparkles } from 'lucide-react';
import { Lesson, LessonProgress } from '../../types/types';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  isLocked?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, progress, isLocked = false }) => {
  const isCompleted = progress?.completed || false;
  const score = progress?.score || 0;
  
  // Generate stars based on score (1-5 scale)
  const stars = Math.round(score / 20); // Convert 0-100 to 0-5
  
  // Format the lesson duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  
  // Get category icon and color
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'basics':
        return { icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'words':
        return { icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' };
      case 'sentences':
        return { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'contractions':
        return { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'advanced':
        return { icon: Brain, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Award, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const categoryInfo = getCategoryInfo(lesson.category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className={`relative rounded-xl shadow-lg border overflow-hidden transition-all duration-300 h-64 flex flex-col group hover:shadow-xl hover:scale-105 ${
      isLocked ? 'opacity-70' : 'hover:shadow-md transform hover:-translate-y-1'
    } ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
        : 'bg-white border-gray-200'
    }`}>
      
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
          <Lock size={32} className="text-gray-500" />
        </div>
      )}
      
      {/* Category icon and level */}
      <div className="absolute top-3 left-3 flex items-center space-x-2">
        <div className={`w-8 h-8 ${categoryInfo.bg} rounded-full flex items-center justify-center`}>
          <CategoryIcon size={16} className={categoryInfo.color} />
        </div>
        <div className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          Level {lesson.level}
        </div>
      </div>
      
      {/* Completed badge */}
      {isCompleted && !isLocked && (
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          ✓
        </div>
      )}
      
      <div className="p-4 pt-12 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {lesson.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-2 leading-relaxed">
          {lesson.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="capitalize font-medium text-xs">{lesson.category}</span>
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {formatDuration(lesson.duration)}
            </span>
          </div>
          
          {!isLocked && score > 0 && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                />
              ))}
            </div>
          )}
        </div>
        
        {!isLocked && (
          <Link
            to={`/learn/${lesson.id}`}
            className={`block w-full text-center rounded-lg py-2 px-4 font-semibold transition-all transform group-hover:scale-105 text-sm ${
              isCompleted 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
            }`}
          >
            {isCompleted ? '🔄 Review Lesson' : '🚀 Start Lesson'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default LessonCard;