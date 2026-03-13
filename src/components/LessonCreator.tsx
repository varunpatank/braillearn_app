import { useState } from 'react';
import { motion } from '@/components/motion';
import { Sparkles, Plus, Trash2, Save, Wand2, BookOpen, Loader2 } from 'lucide-react';
import { BrailleCellVisual } from '@/components/BrailleDiagramEditor';

const BRAILLE_MAP: Record<string, number[]> = {
  A: [1], B: [1,2], C: [1,4], D: [1,4,5], E: [1,5], F: [1,2,4], G: [1,2,4,5], H: [1,2,5],
  I: [2,4], J: [2,4,5], K: [1,3], L: [1,2,3], M: [1,3,4], N: [1,3,4,5], O: [1,3,5],
  P: [1,2,3,4], Q: [1,2,3,4,5], R: [1,2,3,5], S: [2,3,4], T: [2,3,4,5], U: [1,3,6],
  V: [1,2,3,6], W: [2,4,5,6], X: [1,3,4,6], Y: [1,3,4,5,6], Z: [1,3,5,6],
  '1': [1], '2': [1,2], '3': [1,4], '4': [1,4,5], '5': [1,5],
  '6': [1,2,4], '7': [1,2,4,5], '8': [1,2,5], '9': [2,4], '0': [2,4,5],
};

interface Exercise {
  id: string;
  type: 'multiple-choice' | 'braille-to-text' | 'text-to-braille';
  question: string;
  options?: string[];
  correctAnswer: string;
  braillePattern: Array<{ dots: number[]; char: string }>;
  points: number;
}

interface LessonCreatorProps {
  onSave: (data: { title: string; description: string; level: number; category: string; duration: number; exercises: Exercise[]; ai_generated: boolean; ai_prompt: string }) => void;
  onCancel: () => void;
  geminiAvailable?: boolean;
}

export default function LessonCreator({ onSave, onCancel, geminiAvailable: _geminiAvailable = false }: LessonCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(1);
  const [category, setCategory] = useState('custom');
  const [duration, setDuration] = useState(15);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const addExercise = (type: Exercise['type'] = 'multiple-choice') => {
    const id = `ex-${Date.now()}-${exercises.length}`;
    const blank: Exercise = {
      id,
      type,
      question: '',
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: '',
      braillePattern: [],
      points: 10,
    };
    setExercises(p => [...p, blank]);
  };

  const removeExercise = (i: number) => setExercises(p => p.filter((_, idx) => idx !== i));

  const updateExercise = (i: number, updates: Partial<Exercise>) => {
    setExercises(p => p.map((ex, idx) => idx === i ? { ...ex, ...updates } : ex));
  };

  const updateOption = (exIdx: number, optIdx: number, value: string) => {
    setExercises(p => p.map((ex, i) => {
      if (i !== exIdx || !ex.options) return ex;
      const opts = [...ex.options];
      opts[optIdx] = value;
      return { ...ex, options: opts };
    }));
  };

  const autoBraille = (text: string): Array<{ dots: number[]; char: string }> => {
    return text.toUpperCase().split('').map(ch => ({
      dots: BRAILLE_MAP[ch] || [],
      char: ch,
    }));
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      if (!apiKey) throw new Error('No API key');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a braille education expert. Generate a braille lesson based on this request: "${aiPrompt}"

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "title": "Lesson Title",
  "description": "Short description",
  "level": 1,
  "category": "basics",
  "duration": 15,
  "exercises": [
    {
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "word": "CAT",
      "points": 10
    },
    {
      "type": "braille-to-text",
      "question": "Read this braille word:",
      "correctAnswer": "DOG",
      "word": "DOG",
      "points": 15
    }
  ]
}

Generate 4-6 exercises. For each exercise include a "word" field with the key braille word. Use types: multiple-choice, braille-to-text, text-to-braille. Categories: basics, words, sentences, contractions, advanced.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      setTitle(parsed.title || title);
      setDescription(parsed.description || description);
      setLevel(parsed.level || level);
      setCategory(parsed.category || category);
      setDuration(parsed.duration || duration);

      const aiExercises: Exercise[] = (parsed.exercises || []).map((ex: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        type: ex.type || 'multiple-choice',
        question: ex.question,
        options: ex.options,
        correctAnswer: ex.correctAnswer,
        braillePattern: autoBraille(ex.word || ex.correctAnswer || ''),
        points: ex.points || 10,
      }));

      setExercises(aiExercises);
      setShowAiPanel(false);
    } catch (err) {
      console.error('AI generation error:', err);
      const words = aiPrompt.split(/\s+/).filter(w => w.length >= 3).slice(0, 4);
      if (words.length > 0) {
        setTitle(`Custom: ${aiPrompt.slice(0, 30)}`);
        setDescription(aiPrompt);
        const fallbackExercises: Exercise[] = words.map((word, i) => ({
          id: `fb-${Date.now()}-${i}`,
          type: 'braille-to-text' as const,
          question: `Read this word in braille:`,
          correctAnswer: word.toUpperCase(),
          braillePattern: autoBraille(word),
          points: 15,
        }));
        setExercises(fallbackExercises);
        setShowAiPanel(false);
      }
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {showAiPanel && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-900">Generate with Gemini AI</h3>
          </div>
          <p className="text-sm text-purple-700 mb-3">Describe the lesson you want and AI will create exercises with braille patterns automatically.</p>
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder='e.g. "Teach animals vocabulary for beginners" or "Practice Grade 2 contractions for AND, FOR, THE"'
            className="w-full p-3 rounded-xl border-2 border-purple-200 bg-white text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none text-sm resize-none h-20 shadow-sm"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={generateWithAI}
              disabled={generating || !aiPrompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {generating ? 'Generating...' : 'Generate Lesson'}
            </button>
            <button onClick={() => setShowAiPanel(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Lesson title..."
            className="w-full text-xl font-bold bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 placeholder-gray-400 shadow-sm"
          />
        </div>
        <div className="md:col-span-2">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Lesson description..."
            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-gray-900 placeholder-gray-400 resize-none h-16 shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-700 mb-1 block">Level</label>
            <select value={level} onChange={e => setLevel(Number(e.target.value))} className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm">
              {Array.from({ length: 30 }, (_, i) => <option key={i+1} value={i+1}>Level {i+1}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-700 mb-1 block">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm">
              {['basics', 'words', 'sentences', 'contractions', 'advanced', 'custom'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-700 mb-1 block">Duration (min)</label>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={5} max={120} className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => setShowAiPanel(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
            <Sparkles className="w-4 h-4" /> AI Generate
          </button>
          <button onClick={() => addExercise('multiple-choice')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No exercises yet</p>
            <p className="text-gray-400 text-sm">Click "AI Generate" or "Add Exercise" to start</p>
          </div>
        )}
        {exercises.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <select
                  value={ex.type}
                  onChange={e => updateExercise(i, { type: e.target.value as Exercise['type'], options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined })}
                  className="text-sm bg-white border-2 border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:border-blue-500 outline-none shadow-sm"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="braille-to-text">Braille → Text</option>
                  <option value="text-to-braille">Text → Braille</option>
                </select>
                <input
                  type="number"
                  value={ex.points}
                  onChange={e => updateExercise(i, { points: Number(e.target.value) })}
                  className="w-16 text-sm bg-white border-2 border-gray-200 rounded-lg px-2 py-1.5 text-center text-gray-900 focus:border-blue-500 outline-none shadow-sm"
                  min={5}
                  max={100}
                />
                <span className="text-xs text-gray-400">pts</span>
              </div>
              <button onClick={() => removeExercise(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={ex.question}
              onChange={e => updateExercise(i, { question: e.target.value })}
              placeholder="Question..."
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
            />

            {ex.type === 'multiple-choice' && ex.options && (
              <div className="grid grid-cols-2 gap-2">
                {ex.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${ex.id}`}
                      checked={ex.correctAnswer === opt && opt !== ''}
                      onChange={() => updateOption(i, optIdx, opt)}
                      className="accent-blue-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        updateOption(i, optIdx, e.target.value);
                        if (ex.correctAnswer === opt) updateExercise(i, { correctAnswer: e.target.value });
                      }}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-none shadow-sm"
                    />
                    {ex.correctAnswer === opt && opt !== '' && (
                      <span className="text-xs text-green-600 font-medium">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {ex.type !== 'multiple-choice' && (
              <div>
                <input
                  type="text"
                  value={ex.correctAnswer}
                  onChange={e => {
                    const val = e.target.value;
                    updateExercise(i, { correctAnswer: val, braillePattern: autoBraille(val) });
                  }}
                  placeholder="Correct answer..."
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                />
              </div>
            )}

            {ex.braillePattern.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-xl">
                {ex.braillePattern.filter(bp => bp.dots.length > 0).map((bp, bpi) => (
                  <div key={bpi} className="flex flex-col items-center">
                    <BrailleCellVisual dots={bp.dots} size="small" />
                    <span className="text-[10px] text-blue-600 font-bold mt-0.5">{bp.char}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSave({
            title, description, level, category, duration, exercises,
            ai_generated: exercises.some(e => e.id.startsWith('ai-')),
            ai_prompt: aiPrompt,
          })}
          disabled={!title.trim() || exercises.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Lesson
        </button>
      </div>
    </div>
  );
}