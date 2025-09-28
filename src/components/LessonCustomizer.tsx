import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Lesson } from '../types/lessons';
import { geminiService } from '../services/geminiService';

interface LessonCustomizerProps {
  onCustomLessonsGenerated: (lessons: Lesson[]) => void;
}

interface CustomizationForm {
  currentLevel: number;
  learningStyle: string;
  focusAreas: string[];
  timeAvailable: number;
  additionalPreferences: string;
}

const LessonCustomizer: React.FC<LessonCustomizerProps> = ({ onCustomLessonsGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CustomizationForm>({
    currentLevel: 1,
    learningStyle: 'visual',
    focusAreas: ['basics'],
    timeAvailable: 30,
    additionalPreferences: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const customPlan = await geminiService.generatePersonalizedStudyPlan(
        form.currentLevel,
        form.focusAreas,
        form.learningStyle,
        form.timeAvailable,
        form.additionalPreferences
      );

      if (customPlan && customPlan.levels) {
        const flattenedLessons = customPlan.levels.flatMap(level => level.lessons || []);
        onCustomLessonsGenerated(flattenedLessons);
      }
    } catch (error) {
      console.error('Error generating custom plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customize Your Learning Experience
      </h3>

      <div className="space-y-4">
        {/* Current Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Level
          </label>
          <select
            value={form.currentLevel}
            onChange={(e) => setForm({ ...form, currentLevel: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {Array.from({ length: 30 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Level {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Learning Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Learning Style
          </label>
          <select
            value={form.learningStyle}
            onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="visual">Visual Learning</option>
            <option value="tactile">Tactile Learning</option>
            <option value="auditory">Auditory Learning</option>
            <option value="mixed">Mixed Approach</option>
          </select>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Focus Areas
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['basics', 'words', 'sentences', 'contractions', 'advanced'].map((area) => (
              <label key={area} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.focusAreas.includes(area)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({ ...form, focusAreas: [...form.focusAreas, area] });
                    } else {
                      setForm({
                        ...form,
                        focusAreas: form.focusAreas.filter(a => a !== area)
                      });
                    }
                  }}
                  className="rounded text-primary-600"
                />
                <span className="text-sm text-gray-700 capitalize">{area}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Available */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Daily Time Available (minutes)
          </label>
          <select
            value={form.timeAvailable}
            onChange={(e) => setForm({ ...form, timeAvailable: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        {/* Additional Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Preferences (Optional)
          </label>
          <textarea
            value={form.additionalPreferences}
            onChange={(e) => setForm({ ...form, additionalPreferences: e.target.value })}
            placeholder="Any specific learning preferences or goals..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`
            w-full py-3 rounded-lg flex items-center justify-center space-x-2
            ${loading 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-700'
            }
            text-white font-medium transition-colors
          `}
        >
          {loading ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Generating Plan...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Generate Custom Plan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonCustomizer;
