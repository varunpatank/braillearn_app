import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { Sparkles, Send, Brain } from 'lucide-react';

interface LessonCustomizerProps {
  onCustomLessonsGenerated: (lessons: any) => void;
}

export default function LessonCustomizer({ onCustomLessonsGenerated }: LessonCustomizerProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCustomization = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const customPlan = await geminiService.generatePersonalizedStudyPlan(
        1, // default level
        ['custom'], // custom focus area
        'custom', // custom learning style
        30, // default time
        prompt // user's custom prompt
      );
      
      onCustomLessonsGenerated(customPlan);
    } catch (error) {
      console.error('Error generating custom lessons:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Customize Your Learning Path
        </h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Tell me how you'd like to learn braille. You can specify:
          • The order of topics
          • Specific areas you want to focus on
          • Your preferred learning style
          • Time constraints
          • Any special requirements
        </p>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., I want to focus on numbers first, then letters. I learn best with practical examples..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          
          <button
            onClick={handleCustomization}
            disabled={isGenerating || !prompt.trim()}
            className={`absolute bottom-3 right-3 p-2 rounded-full ${
              isGenerating || !prompt.trim()
                ? 'bg-gray-100 text-gray-400'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors`}
          >
            {isGenerating ? (
              <div className="animate-spin">
                <Sparkles className="w-5 h-5" />
              </div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-primary-600">
            <div className="animate-spin">
              <Sparkles className="w-4 h-4" />
            </div>
            Generating your custom learning path...
          </div>
        )}
      </div>
    </div>
  );
}
