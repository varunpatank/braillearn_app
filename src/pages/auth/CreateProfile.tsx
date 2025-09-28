import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types/types';
import { Mail, User as UserIcon, ChevronRight } from 'lucide-react';

const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    learningGoal: 'personal',
    experienceLevel: 'beginner',
    dailyGoal: '15',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      progress: {
        level: 1,
        experience: 0,
        streak: 0,
        lastActive: new Date().toISOString()
      },
      preferences: {
        theme: 'light',
        fontSize: 'medium',
        audioFeedback: true,
        arduinoMode: false,
        dailyGoal: parseInt(formData.dailyGoal),
        learningGoal: formData.learningGoal,
        experienceLevel: formData.experienceLevel
      }
    };

    setUser(newUser);
    navigate('/learn');
  };

  const nextStep = () => {
    if ((step === 1 && formData.name && formData.email) || step === 2) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Profile
          </h1>
          <p className="text-primary-100">
            Let's personalize your braille learning journey
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-1/3 h-1 rounded-full ${
                    i <= step ? 'bg-primary-600' : 'bg-gray-200'
                  } ${i < 3 ? 'mr-1' : ''}`}
                ></div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Step {step} of 3
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Learning Preferences
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why are you learning braille?
                  </label>
                  <select
                    name="learningGoal"
                    value={formData.learningGoal}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="personal">Personal Interest</option>
                    <option value="professional">Professional Development</option>
                    <option value="education">Educational Requirement</option>
                    <option value="teaching">Teaching Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your experience with braille
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="beginner">Complete Beginner</option>
                    <option value="intermediate">Some Knowledge</option>
                    <option value="advanced">Experienced</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Set Your Goals
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily learning goal (minutes)
                  </label>
                  <select
                    name="dailyGoal"
                    value={formData.dailyGoal}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>

                <div className="bg-primary-50 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-primary-900 mb-2">
                    Your learning path is ready!
                  </h3>
                  <p className="text-sm text-primary-700">
                    Based on your preferences, we've customized a learning path to help you achieve your braille learning goals.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                  disabled={step === 1 && (!formData.name || !formData.email)}
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Start Learning
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;