import React from 'react';
import { AnimatePresence, motion } from '@/components/motion';
import { X, Plus, Save, Upload, Trash } from 'lucide-react';
import { BrailleClassForm } from '@/types/classTypes';

interface CreateClassModalProps {
  show: boolean;
  onClose: () => void;
  classForm: BrailleClassForm;
  setClassForm: (form: BrailleClassForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  show,
  onClose,
  classForm,
  setClassForm,
  onSubmit
}) => {
  if (!show) return null;

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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create New Class</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Title
                    </label>
                    <input
                      type="text"
                      value={classForm.title}
                      onChange={(e) => setClassForm({...classForm, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Introduction to Braille Reading"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={classForm.category}
                      onChange={(e) => setClassForm({...classForm, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Beginner Braille, Math Notation"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={classForm.description}
                    onChange={(e) => setClassForm({...classForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Describe what students will learn in this class..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Image
                  </label>
                  <div
                    onClick={() => document.getElementById('classImageInput')?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    {classForm.imageFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(classForm.imageFile)}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClassForm(prev => ({ ...prev, imageFile: null }))
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload course image</p>
                      </div>
                    )}
                    <input
                      id="classImageInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setClassForm(prev => ({ ...prev, imageFile: file }));
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      value={classForm.level}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        level: e.target.value as typeof classForm.level
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Students
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={classForm.maxStudents}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        maxStudents: parseInt(e.target.value)
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <select
                      value={classForm.schedule.duration}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, duration: parseInt(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = classForm.schedule.days.includes(day)
                              ? classForm.schedule.days.filter(d => d !== day)
                              : [...classForm.schedule.days, day];
                            setClassForm(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, days }
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            classForm.schedule.days.includes(day)
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <input
                      type="time"
                      value={classForm.schedule.time}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, time: e.target.value }
                      }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={classForm.meetingLink}
                    onChange={(e) => setClassForm(prev => ({
                      ...prev,
                      meetingLink: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://zoom.us/..."
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Course Chapters</h4>
                    <button
                      type="button"
                      onClick={() => setClassForm(prev => ({
                        ...prev,
                        chapters: [
                          ...prev.chapters,
                          { title: '', content: '', resources: [] }
                        ]
                      }))}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center space-x-1"
                    >
                      <Plus size={16} />
                      <span>Add Chapter</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {classForm.chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => {
                              const newChapters = [...classForm.chapters];
                              newChapters[chapterIndex] = {
                                ...chapter,
                                title: e.target.value
                              };
                              setClassForm(prev => ({ ...prev, chapters: newChapters }));
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mr-2"
                            placeholder="Chapter Title"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newChapters = classForm.chapters.filter((_, i) => i !== chapterIndex);
                              setClassForm(prev => ({ ...prev, chapters: newChapters }));
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                        
                        <textarea
                          value={chapter.content}
                          onChange={(e) => {
                            const newChapters = [...classForm.chapters];
                            newChapters[chapterIndex] = {
                              ...chapter,
                              content: e.target.value
                            };
                            setClassForm(prev => ({ ...prev, chapters: newChapters }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
                          rows={3}
                          placeholder="Chapter Content"
                          required
                        />
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-gray-700">Resources</h5>
                            <button
                              type="button"
                              onClick={() => {
                                const newChapters = [...classForm.chapters];
                                newChapters[chapterIndex].resources.push({
                                  type: 'link',
                                  title: '',
                                  url: '',
                                  description: ''
                                });
                                setClassForm(prev => ({ ...prev, chapters: newChapters }));
                              }}
                              className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                            >
                              <Plus size={14} />
                              <span>Add Resource</span>
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {chapter.resources.map((resource, resourceIndex) => (
                              <div key={resourceIndex} className="flex items-start space-x-2">
                                <select
                                  value={resource.type}
                                  onChange={(e) => {
                                    const newChapters = [...classForm.chapters];
                                    newChapters[chapterIndex].resources[resourceIndex] = {
                                      ...resource,
                                      type: e.target.value as typeof resource.type
                                    };
                                    setClassForm(prev => ({ ...prev, chapters: newChapters }));
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  required
                                >
                                  <option value="video">Video</option>
                                  <option value="document">Document</option>
                                  <option value="link">Link</option>
                                </select>
                                
                                <input
                                  type="text"
                                  value={resource.title}
                                  onChange={(e) => {
                                    const newChapters = [...classForm.chapters];
                                    newChapters[chapterIndex].resources[resourceIndex] = {
                                      ...resource,
                                      title: e.target.value
                                    };
                                    setClassForm(prev => ({ ...prev, chapters: newChapters }));
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  placeholder="Resource Title"
                                  required
                                />
                                
                                <input
                                  type="url"
                                  value={resource.url}
                                  onChange={(e) => {
                                    const newChapters = [...classForm.chapters];
                                    newChapters[chapterIndex].resources[resourceIndex] = {
                                      ...resource,
                                      url: e.target.value
                                    };
                                    setClassForm(prev => ({ ...prev, chapters: newChapters }));
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  placeholder="Resource URL"
                                  required
                                />
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newChapters = [...classForm.chapters];
                                    newChapters[chapterIndex].resources.splice(resourceIndex, 1);
                                    setClassForm(prev => ({ ...prev, chapters: newChapters }));
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={classForm.isPublic}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        isPublic: e.target.checked
                      }))}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Make this class public
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Public classes can be discovered and joined by anyone
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Create Class</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};