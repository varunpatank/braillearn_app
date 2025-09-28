import React from 'react';
import { AnimatePresence, motion } from '@/components/motion';
import { Star, MapPin, X } from 'lucide-react';
import { Tutor } from '@/types/tutorTypes';

interface TutorDetailModalProps {
  show: boolean;
  onClose: () => void;
  selectedTutor: Tutor | null;
}

export const TutorDetailModal: React.FC<TutorDetailModalProps> = ({
  show,
  onClose,
  selectedTutor
}) => {
  if (!show || !selectedTutor) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-2xl p-6 relative overflow-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedTutor.avatar}
                    alt={selectedTutor.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedTutor.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin size={16} className="mr-1" />
                      <span>{selectedTutor.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{selectedTutor.rating}</span>
                      <span className="text-gray-500 ml-1">({selectedTutor.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">About</h4>
                  <p className="text-gray-600 mb-6">{selectedTutor.bio}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Specialties</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedTutor.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Languages</h5>
                      <p className="text-gray-600">{selectedTutor.languages.join(', ')}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Availability</h5>
                      <p className="text-gray-600">{selectedTutor.availability.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Teaching Resources</h4>
                  <div className="space-y-4">
                    {selectedTutor.resources.map((resource) => (
                      <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={resource.thumbnail}
                            alt={resource.title}
                            className="w-16 h-12 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?w=300';
                            }}
                          />
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">{resource.title}</h6>
                            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                              {resource.duration && (
                                <span className="text-xs text-gray-500">{resource.duration}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <a
                  href={`mailto:${selectedTutor.email}?subject=Free Braille Tutoring Request&body=Hi ${selectedTutor.name}, I'd like to schedule a free braille learning session.`}
                  className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Schedule Free Session
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};