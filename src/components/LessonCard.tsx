import React from 'react';
import { Lesson, LessonProgress } from '../types/lessons';
import { Lock, CheckCircle, Clock, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  isLocked: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, progress, isLocked }) => {
  const router = useRouter();

  const handleClick = () => {
    if (!isLocked) {
      router.push(`/lesson/${lesson.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative bg-white rounded-xl shadow-sm border 
        ${isLocked ? 'border-gray-200 opacity-75' : 'border-primary-100 hover:shadow-lg'}
        transition-all duration-200 cursor-pointer overflow-hidden
        ${progress?.completed ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
      `}
    >
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : progress?.completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : null}
      </div>

      <div className="p-4">
        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">
          {lesson.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {lesson.description}
        </p>

        {/* Lesson Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {lesson.duration} min
          </div>
          <div className="flex items-center text-gray-500">
            <Award className="w-4 h-4 mr-1" />
            {lesson.exercises.length} exercises
          </div>
        </div>

        {/* Progress Bar (if started) */}
        {progress && !progress.completed && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.score || 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Complete previous lessons to unlock
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonCard;
