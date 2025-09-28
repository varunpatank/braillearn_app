import React, { useState } from 'react';
import { AnimatePresence, motion } from '@/components/motion';
import { ClassDashboard } from '@/components/ClassDashboard';
import { X, Calendar, Clock, Users, Globe, Video, FileText, Link as LinkIcon } from 'lucide-react';
import { BrailleClass } from '@/types/classTypes';
import { ClassService } from '@/services/classService';
import { toast } from '@/components/ui/use-toast';

interface ClassDetailModalProps {
  show: boolean;
  onClose: () => void;
  selectedClass: BrailleClass | null;
  userId?: string;
  onEnrollSuccess: () => Promise<void>;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  show,
  onClose,
  selectedClass,
  userId,
  onEnrollSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'analytics'>('details');
  
  if (!show || !selectedClass) return null;

  const handleEnroll = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please sign in to enroll in a class",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await ClassService.enrollInClass(selectedClass.id, userId);
      if (error) throw error;
      
      // Open the meeting link in a new tab immediately
      if (selectedClass.meetingLink) {
        window.location.href = selectedClass.meetingLink;
      }

      toast({
        title: "Success",
        description: "Successfully enrolled in class! Redirecting to class meeting...",
        variant: "default"
      });
      
      await onEnrollSuccess();
      onClose();
    } catch (error) {
      console.error('Error enrolling in class:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in class",
        variant: "destructive"
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white rounded-2xl p-6 relative overflow-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.title}</h3>
                  <p className="text-gray-600">{selectedClass.description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 ${
                    activeTab === 'details'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Class Details
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </div>

              {activeTab === 'details' && (
                <>
                  {selectedClass.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden mb-6">
                  <img
                    src={selectedClass.imageUrl}
                    alt={selectedClass.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3 text-blue-600" />
                    <span>{selectedClass.schedule.days.join(', ')} at {selectedClass.schedule.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-3 text-green-600" />
                    <span>{selectedClass.schedule.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users size={18} className="mr-3 text-purple-600" />
                    <span>{selectedClass.enrolledStudents.length}/{selectedClass.maxStudents} students</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe size={18} className="mr-3 text-orange-600" />
                    <a href={selectedClass.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                      Join Meeting Link
                    </a>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Free Class</h4>
                  <p className="text-sm text-green-700">
                    This class is provided free of charge by volunteer instructors.
                  </p>
                </div>
              </div>

              {selectedClass.chapters.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h4>
                  <div className="space-y-4">
                    {selectedClass.chapters.map((chapter, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{chapter.title}</h5>
                        <p className="text-sm text-gray-600 mb-4">{chapter.content}</p>
                        
                        {chapter.resources.length > 0 && (
                          <div className="space-y-2">
                            <h6 className="text-sm font-medium text-gray-700">Resources:</h6>
                            {chapter.resources.map((resource, rIndex) => (
                              <div key={rIndex} className="flex items-center text-sm text-gray-600">
                                {resource.type === 'video' ? (
                                  <Video size={16} className="mr-2" />
                                ) : resource.type === 'document' ? (
                                  <FileText size={16} className="mr-2" />
                                ) : (
                                  <LinkIcon size={16} className="mr-2" />
                                )}
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary-600"
                                >
                                  {resource.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                </>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <ClassDashboard 
                    classData={selectedClass} 
                    onClose={() => setActiveTab('details')}
                  />
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleEnroll}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enroll for Free
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};