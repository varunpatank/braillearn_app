import { GoogleGenerativeAI } from '@google/generative-ai';

// Use Gemini API key from environment variables only
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || '';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private isInitialized = false;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 1000,
      }
    });
  }

  private async ensureInitialized() {
    if (this.isInitialized) return;

    const modelNames = ["gemini-1.5-pro", "gemini-1.5-flash"];
    
    for (const modelName of modelNames) {
      try {
        this.model = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 1000,
          }
        });
        
        const testResult = await this.model.generateContent("Test");
        const response = await testResult.response;
        const text = response.text();
        
        if (text && text.length > 0) {
          this.isInitialized = true;
          return;
        }
      } catch (modelError) {
        continue;
      }
    }
    
    this.isInitialized = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      if (!this.isInitialized) {
        return false;
      }
      
      const result = await this.model.generateContent('Hello, respond with just "OK" if you can hear me.');
      const response = await result.response;
      const text = response.text();
      // return true only if model responded with OK (helps detect actual connectivity)
      return !!text && String(text).trim().toUpperCase().startsWith('OK');
    } catch (error) {
      return false;
    }
  }

  // List available models for debugging
  async listAvailableModels() {
    try {
      console.log('🔍 Testing common model names manually...');
      
      // Try some common model names with different formats (simplified for 2024/2025)
      const commonModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ];
      
      for (const modelName of commonModels) {
        try {
          console.log(`🔍 Testing: ${modelName}`);
          const testModel = this.genAI.getGenerativeModel({ model: modelName });
          const testResult = await testModel.generateContent('Test');
          const response = await testResult.response;
          const text = response.text();
          
          if (text && text.length > 0) {
            console.log(`✅ Working model found: ${modelName}`);
            
            // Update our model to use this working one
            this.model = testModel;
            this.isInitialized = true;
            return [{ name: modelName, working: true }];
          }
        } catch (testError) {
          console.log(`❌ ${modelName}: ${testError instanceof Error ? testError.message.substring(0, 100) : testError}`);
        }
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ Error in listAvailableModels:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async generatePersonalizedStudyPlan(
    currentLevel: number,
    focusAreas: string[],
    learningStyle: string,
    timeAvailable: number,
    customPrompt?: string
  ) {
    const basePrompt = `Create a personalized 30-level braille learning study plan with the following parameters:
    - Current Level: ${currentLevel}
    - Focus Areas: ${focusAreas.join(', ')}
    - Learning Style: ${learningStyle}
    - Daily Time Available: ${timeAvailable} minutes
    
    ${customPrompt ? `Additional Requirements: ${customPrompt}` : ''}

    Generate a comprehensive plan that includes:
    1. 30 progressive levels from beginner to expert
    2. Estimated completion time for each level
    3. Weekly schedule breakdown
    4. Learning milestones and roadmap
    5. Customized lesson types based on learning style

    Return the response as a JSON object with this structure:
    {
      "totalLessons": number,
      "estimatedWeeks": number,
      "learningStyle": string,
      "dailyTimeCommitment": number,
      "levels": [
        {
          "level": number,
          "title": string,
          "description": string,
          "estimatedHours": number,
          "lessons": [
            {
              "id": string,
              "title": string,
              "description": string,
              "duration": number,
              "category": string,
              "prerequisites": string[]
            }
          ]
        }
      ],
      "roadmap": [
        {
          "phase": string,
          "weeks": string,
          "focus": string,
          "milestone": string
        }
      ],
      "weeklySchedule": [
        {
          "week": number,
          "focus": string,
          "practiceTime": number,
          "lessons": string[]
        }
      ]
    }`;

    try {
      const result = await this.model.generateContent(basePrompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text and extract JSON
      let cleanText = text.trim();
      
      // Remove any markdown code blocks and clean up
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove any text before the first {
      const firstBrace = cleanText.indexOf('{');
      if (firstBrace > 0) {
        cleanText = cleanText.substring(firstBrace);
      }
      
      // Remove any text after the last }
      const lastBrace = cleanText.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
        cleanText = cleanText.substring(0, lastBrace + 1);
      }
      
      // Clean up common JSON issues more aggressively
      cleanText = cleanText
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .replace(/\.\.\./g, '') // Remove ellipsis
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/"\s*\.\.\.\s*"/g, '""') // Remove ellipsis in strings
        .replace(/,\s*}/g, '}') // Remove trailing comma before }
        .replace(/,\s*]/g, ']'); // Remove trailing comma before ]
      
      try {
        return JSON.parse(cleanText);
      } catch (parseError) {
        console.warn('Initial JSON parse failed, trying fallback methods:', parseError);
        
        // Try to extract just the main structure
        const structureMatch = cleanText.match(/\{[\s\S]*"levels"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
        if (structureMatch) {
          try {
            return JSON.parse(structureMatch[0]);
          } catch (structureError) {
            console.warn('Structure extraction failed:', structureError);
          }
        }
        
        // If all parsing fails, throw the original error to trigger fallback
        throw parseError;
      }
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('[503 ]')) {
        console.warn('Gemini service temporarily overloaded:', error);
      } else {
        console.error('Error generating study plan:', error);
      }
      return this.generateFallbackPlan(currentLevel, focusAreas, learningStyle, timeAvailable);
    }
  }

  // Unified chat method — prefers server-side Hack Club proxy, falls back to Google client SDK
  private async callHackClubProxy(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/hackclub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HackClub proxy error: ${res.status} ${text}`);
      }

      // return response as text — caller decides how to parse
      return await res.text();
    } catch (err) {
      console.warn('HackClub proxy unavailable or failed:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  private async chatWithModel(messages: Array<{ role: string; content: string }>, opts?: { model?: string; temperature?: number }) {
    // Try server-side Hack Club proxy first (keeps keys secret)
    const payload = {
      model: opts?.model || 'google/gemini-3-flash-preview',
      messages,
      temperature: opts?.temperature ?? 0.7
    };

    try {
      const hc = await this.callHackClubProxy(payload);

      // Hack Club proxy returns JSON-compatible string from the upstream model
      try {
        const parsed = JSON.parse(hc);
        // common shape for chat completion responses: choices[0].message.content
        if (parsed?.choices && parsed.choices[0]?.message?.content) {
          return parsed.choices[0].message.content;
        }

        // if response is direct text
        return typeof parsed === 'string' ? parsed : hc;
      } catch (e) {
        // not JSON — return raw text
        return hc;
      }
    } catch (_) {
      // Fallback to client-side GoogleGenerativeAI (existing behaviour)
      try {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err) {
        console.warn('Both HackClub proxy and local Gemini client failed:', err instanceof Error ? err.message : err);
        throw err;
      }
    }
  }

  /**
   * Create an AI-managed study plan (agentic scheduling + customization).
   * - returns a StudyPlan-shaped object (will validate/parse JSON from model)
   */
  async generateAgentStudyPlan(
    userId: string,
    currentLevel: number,
    focusAreas: string[],
    learningStyle: string,
    dailyMinutes: number,
    options?: { targetWeeks?: number; allowReschedule?: boolean; model?: string }
  ) {
    const model = options?.model || 'google/gemini-3-flash-preview';

    const systemMsg = {
      role: 'system',
      content: 'You are an expert braille tutor and study-planner. Produce structured JSON matching the StudyPlan schema used by the BrailleLearn app.'
    };

    const userMsg = {
      role: 'user',
      content: `Create an AI-managed study plan for userId=${userId} with: currentLevel=${currentLevel}, focusAreas=${focusAreas.join(',')}, learningStyle=${learningStyle}, dailyMinutes=${dailyMinutes}, targetWeeks=${options?.targetWeeks ?? 12}, allowReschedule=${String(options?.allowReschedule ?? true)}.`
    };

    const reply = await this.chatWithModel([systemMsg, userMsg], { model });

    // Attempt to extract/parse JSON the same way generatePersonalizedStudyPlan does
    let cleanText = (reply || '').trim();
    cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const firstBrace = cleanText.indexOf('{');
    if (firstBrace > 0) cleanText = cleanText.substring(firstBrace);
    const lastBrace = cleanText.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace < cleanText.length - 1) cleanText = cleanText.substring(0, lastBrace + 1);

    // sanitize common issues
    cleanText = cleanText
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/\n\s*\n/g, '\n')
      .replace(/\.{3}/g, '')
      .replace(/,\s*,/g, ',');

    try {
      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (parseError) {
      console.warn('AI study plan parse failed — returning raw text for inspection', parseError);
      return { raw: cleanText, text: reply };
    }
  }

  /** Optimize / reschedule an existing StudyPlan using the model */
  async optimizeStudyPlan(existingPlan: any, userFeedback: string) {
    const systemMsg = { role: 'system', content: 'You are an AI scheduler for braille learning plans.' };
    const userMsg = { role: 'user', content: `Optimize this study plan based on feedback: ${userFeedback}\n\nPlan:${JSON.stringify(existingPlan)}` };
    const reply = await this.chatWithModel([systemMsg, userMsg]);

    // Model should return a JSON patch or full updated plan — attempt parse
    try {
      const json = JSON.parse(reply);
      return { success: true, updatedPlan: json };
    } catch (e) {
      return { success: false, message: 'Model did not return JSON', raw: reply };
    }
  }

  /** Return feature ideas and implementation suggestions (static + AI enhanced if available) */
  async suggestFeatureIdeas(partner?: string) {
    const ideas = [
      'Adaptive daily micro-lessons that change length based on recent user accuracy',
      'Agent that auto-reschedules missed lessons and notifies users with suggested catch-up sessions',
      'AI-generated printable braille worksheets and answer keys (PDF export)',
      'Speech-to-braille conversational tutor for pronunciation and reading fluency practice',
      'Integrate classroom/teacher dashboard for shared student progress and assignments',
      'Accessibility-first UIs with partner-branded onboarding and resources'
    ];

    // If partner is provided, add partner-specific ideas
    if (partner?.toLowerCase().includes('washington')) {
      ideas.unshift('Washington State School for the Blind co-branded lesson packs and teacher guides');
    }

    // Try to ask the model for additional ideas (non-blocking)
    try {
      const systemMsg = { role: 'system', content: 'You are a product strategist for accessible education apps.' };
      const userMsg = { role: 'user', content: `Suggest 6 concrete feature ideas we can implement for a braille-learning app${partner ? ` (partner: ${partner})` : ''}. Return a JSON array of {id,title,description,effort}.` };
      const aiReply = await this.chatWithModel([systemMsg, userMsg]);
      const parsed = JSON.parse(aiReply);
      return { static: ideas, ai: parsed };
    } catch (e) {
      return { static: ideas, ai: null };
    }
  }

  /** Small helper to return partner branding metadata (logo path, color) */
  getPartnerBranding(partnerId: string) {
    if (!partnerId) return null;

    const lower = partnerId.toLowerCase();
    if (lower.includes('washington') || lower.includes('wssb') || lower.includes('school for the blind')) {
      return {
        id: 'wssb',
        name: 'Washington State School for the Blind',
        logo: '/partners/wssb.svg',
        color: '#004E98'
      };
    }

    return { id: partnerId, name: partnerId, logo: '/partners/partner-placeholder.svg', color: '#333' };
  }

  async askInstructor(question: string, context: string = '') {
    console.log('💬 AI Instructor Request:', { question, context });

    // Prefer server-side proxy -> try model chat; fallback to in-app educational responses
    const systemMsg = { role: 'system', content: 'You are an empathetic braille instructor. Answer concisely.' };
    const userMsg = { role: 'user', content: `${question}\nContext: ${context}` };
    const ai = await this.chatWithModel([systemMsg, userMsg]);
    if (ai && ai.length > 0) return ai;
    throw new Error('Empty response from AI model');
  }

  private generateFallbackPlan(currentLevel: number, focusAreas: string[], learningStyle: string, timeAvailable: number) {
    // Generate a basic fallback plan if AI fails
    const levels = [];
   const totalLessonsTarget = Math.max(50, Math.min(100, timeAvailable * 2)); // 50-100 lessons based on time
   const lessonsPerLevel = Math.ceil(totalLessonsTarget / 30); // Distribute across 30 levels
   
    for (let i = 1; i <= 30; i++) {
      const levelInfo = this.getLevelInfo(i);
      const lessons = [];
      
      for (let j = 0; j < lessonsPerLevel; j++) {
        lessons.push({
          id: `level-${i}-lesson-${j + 1}`,
          title: `${this.getLessonTitle(i, j + 1, focusAreas)}`,
          description: `${this.getLessonDescription(i, j + 1, learningStyle, focusAreas)}`,
          duration: 15 + (i * 2) + (j * 5),
          category: this.getLevelCategory(i),
          prerequisites: i > 1 ? [`level-${i-1}-lesson-1`] : [],
          exercises: this.generateLessonExercises(i, j + 1, focusAreas)
        });
      }
      
      levels.push({
        level: i,
        title: `${this.getLevelTitle(i)} (Level ${i})`,
        description: levelInfo.description,
        estimatedHours: 2 + (i * 0.5),
        lessons: lessons,
        completed: i <= currentLevel
      });
    }

    return {
     totalLessons: totalLessonsTarget,
      estimatedWeeks: Math.ceil(30 * timeAvailable / (7 * timeAvailable)),
      learningStyle: learningStyle,
      dailyTimeCommitment: timeAvailable,
      currentLevel: currentLevel,
      levels: levels,
      roadmap: [
        { phase: "Foundation", weeks: "Weeks 1-4", focus: "Basic alphabet and numbers", milestone: "Read simple words" },
        { phase: "Building", weeks: "Weeks 5-12", focus: "Words and sentences", milestone: "Read paragraphs" },
        { phase: "Advanced", weeks: "Weeks 13-20", focus: "Contractions and speed", milestone: "Fluent reading" },
        { phase: "Mastery", weeks: "Weeks 21-30", focus: "Specialized skills", milestone: "Expert level" }
      ],
      weeklySchedule: Array.from({length: 12}, (_, i) => ({
        week: i + 1,
        focus: `Week ${i + 1} focus area`,
        practiceTime: timeAvailable * 7,
        lessons: [`Level ${Math.floor(i/4) + 1} lessons`]
      }))
    };
  }

  private getLevelTitle(level: number): string {
    const titles = [
      'Alphabet Basics', 'Numbers & Punctuation', 'Simple Words', 'Contractions', 'Speed Reading',
      'Advanced Patterns', 'Technical Reading', 'Literary Skills', 'Math Notation', 'Music Braille',
      'Multi-Language', 'Teaching Skills', 'Research Methods', 'Innovation', 'Leadership',
      'Global Expertise', 'Technology', 'Accessibility', 'Community', 'Mentorship',
      'Legacy Building', 'Wisdom Sharing', 'Grand Mastery', 'Ultimate Skills', 'Legendary Status',
      'Master Teacher', 'Global Leader', 'Pioneer', 'Visionary', 'Braille Legend'
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  }

  private getLevelInfo(level: number) {
    const emojis = ['🌱', '🌿', '🌺', '🌳', '⭐', '🎯', '🚀', '💎', '🏆', '👑'];
    const titles = [
      'Alphabet Basics', 'Numbers & Punctuation', 'Simple Words', 'Contractions', 'Speed Reading',
      'Advanced Patterns', 'Technical Reading', 'Literary Skills', 'Math Notation', 'Music Braille',
      'Multi-Language', 'Teaching Skills', 'Research Methods', 'Innovation', 'Leadership',
      'Global Expertise', 'Technology', 'Accessibility', 'Community', 'Mentorship',
      'Legacy Building', 'Wisdom Sharing', 'Grand Mastery', 'Ultimate Skills', 'Legendary Status',
      'Master Teacher', 'Global Leader', 'Pioneer', 'Visionary', 'Braille Legend'
    ];
    const descriptions = [
      'Learn the braille alphabet and basic symbols',
      'Master numbers, punctuation, and simple words',
      'Read common words and simple sentences',
      'Learn contractions and advanced reading',
      'Master complex patterns and recognition',
      'Build vocabulary and word formation',
      'Read complete sentences fluently',
      'Master braille contractions and shortcuts',
      'Develop speed reading techniques',
      'Achieve championship-level skills'
    ];
    
    return {
      emoji: emojis[(level - 1) % emojis.length],
      title: titles[Math.min(level - 1, titles.length - 1)],
      description: descriptions[Math.min(level - 1, descriptions.length - 1)]
    };
  }

  private getLessonTitle(level: number, lessonNumber: number, focusAreas: string[]): string {
    const focusArea = focusAreas[0] || 'letters';
    const focusTitles = {
      'letters': ['Letter Recognition', 'Letter Formation', 'Letter Combinations', 'Letter Mastery'],
      'numbers': ['Number Basics', 'Number Patterns', 'Mathematical Symbols', 'Number Fluency'],
      'punctuation': ['Basic Punctuation', 'Advanced Punctuation', 'Formatting Marks', 'Punctuation Mastery'],
      'contractions': ['Simple Contractions', 'Word Contractions', 'Advanced Contractions', 'Contraction Fluency'],
      'speed': ['Speed Basics', 'Reading Techniques', 'Fluency Building', 'Speed Mastery'],
      'comprehension': ['Basic Comprehension', 'Text Analysis', 'Critical Reading', 'Advanced Comprehension'],
      'writing': ['Writing Basics', 'Document Creation', 'Advanced Writing', 'Writing Mastery'],
      'technology': ['Tech Basics', 'Digital Tools', 'Advanced Tech', 'Tech Integration']
    };
    
    const titles = focusTitles[focusArea as keyof typeof focusTitles] || focusTitles.letters;
    return `${titles[(lessonNumber - 1) % titles.length]} (L${level})`;
  }

  private getLessonDescription(level: number, lessonNumber: number, learningStyle: string, focusAreas: string[]): string {
    const focusArea = focusAreas[0] || 'letters';
    const styleDescriptions = {
      'visual': 'Visual learning approach with clear diagrams and patterns',
      'tactile': 'Hands-on practice with physical braille patterns',
      'auditory': 'Audio-guided learning with spoken instructions',
      'kinesthetic': 'Movement-based learning with interactive exercises',
      'mixed': 'Comprehensive approach combining multiple learning methods'
    };
    
    const baseDescription = styleDescriptions[learningStyle as keyof typeof styleDescriptions] || styleDescriptions.mixed;
    return `${baseDescription} focused on ${focusArea} for level ${level}, lesson ${lessonNumber}.`;
  }

  private generateLessonExercises(level: number, lessonNumber: number, focusAreas: string[]) {
    const focusArea = focusAreas[0] || 'letters';
    const exerciseTypes = ['multiple-choice', 'braille-to-text', 'text-to-braille', 'match', 'speech-to-braille'] as const;
    
    // Generate multiple exercises per lesson for better content
    const exercises = [];
    const exercisesPerLesson = Math.min(2 + Math.floor(level / 5), 5); // 2-5 exercises per lesson
    
    for (let i = 0; i < exercisesPerLesson; i++) {
      const currentExerciseType = exerciseTypes[i % exerciseTypes.length];
      
      // Generate realistic braille patterns based on level
      const getBrailleForLevel = (level: number, exerciseIndex: number) => {
        if (level <= 5) {
          // Basic letters
          const basicLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          const letter = basicLetters[(lessonNumber - 1 + exerciseIndex) % basicLetters.length];
          return [{ dots: this.getDotsForLetter(letter), char: letter }];
        } else if (level <= 10) {
          // Simple words
          const words = ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'RUN'];
          const word = words[(lessonNumber - 1 + exerciseIndex) % words.length];
          return [
            ...word.split('').map(char => ({ dots: this.getDotsForLetter(char), char }))
          ];
        } else if (level <= 15) {
          // Sentences
          const sentences = ['I AM HAPPY', 'THE CAT RAN', 'WE LIKE BOOKS'];
          const sentence = sentences[(lessonNumber - 1 + exerciseIndex) % sentences.length];
          return sentence.split('').map(char => ({ 
            dots: char === ' ' ? [] : this.getDotsForLetter(char), 
            char 
          }));
        } else {
          // Advanced patterns
          const patterns = [
            [{ dots: [1, 2, 3], char: 'AND' }],
            [{ dots: [1, 2, 4, 5], char: 'FOR' }],
            [{ dots: [1, 3, 5], char: 'THE' }]
          ];
          return patterns[(lessonNumber - 1 + exerciseIndex) % patterns.length];
        }
      };
    
      const getCorrectAnswer = (exerciseIndex: number): string => {
        if (currentExerciseType === 'multiple-choice') {
          if (level <= 5) return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][(lessonNumber - 1 + exerciseIndex) % 10];
          if (level <= 10) return ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'RUN'][(lessonNumber - 1 + exerciseIndex) % 6];
          return 'Pattern A';
        } else if (currentExerciseType === 'braille-to-text') {
          if (level <= 5) return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][(lessonNumber - 1 + exerciseIndex) % 10];
          if (level <= 10) return ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'RUN'][(lessonNumber - 1 + exerciseIndex) % 6];
          return 'CAT';
        } else {
          return 'Sample text';
        }
      };
    
      const getQuestionText = (exerciseIndex: number): string => {
        const focusQuestions = {
          'letters': `What letter does this braille pattern represent?`,
          'numbers': `What number does this braille pattern show?`,
          'punctuation': `What punctuation mark is this?`,
          'contractions': `What contraction does this represent?`,
          'speed': `Read this braille pattern quickly`,
          'comprehension': `What does this braille text say?`,
          'writing': `Form the braille pattern for this character`,
          'technology': `Identify this technical braille symbol`
        };
        const base = focusQuestions[focusArea as keyof typeof focusQuestions] || `What does this braille pattern represent?`;
        return `${base} (exercise ${exerciseIndex + 1})`;
      };
    
      const getOptions = (exerciseIndex: number): string[] | undefined => {
        if (currentExerciseType !== 'multiple-choice') return undefined;
        
        if (level <= 5) {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          const correct = letters[(lessonNumber - 1 + exerciseIndex) % letters.length];
          return [correct, ...letters.filter(l => l !== correct).slice(0, 3)];
        } else if (level <= 10) {
          const words = ['CAT', 'DOG', 'SUN', 'HAT', 'BAT', 'RUN'];
          const correct = words[(lessonNumber - 1 + exerciseIndex) % words.length];
          return [correct, ...words.filter(w => w !== correct).slice(0, 3)];
        } else {
          return ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D'];
        }
      };
      
      exercises.push({
        id: `custom-ex-${level}-${lessonNumber}-${i + 1}`,
        type: currentExerciseType,
        question: getQuestionText(i),
        options: getOptions(i),
        correctAnswer: getCorrectAnswer(i),
        braillePattern: getBrailleForLevel(level, i),
        points: 10 + (level * 2) + (i * 5)
      });
    }
    
    return exercises;
  }
  
  private getDotsForLetter(letter: string): number[] {
    const patterns: Record<string, number[]> = {
      'A': [1], 'B': [1, 2], 'C': [1, 4], 'D': [1, 4, 5], 'E': [1, 5],
      'F': [1, 2, 4], 'G': [1, 2, 4, 5], 'H': [1, 2, 5], 'I': [2, 4], 'J': [2, 4, 5],
      'K': [1, 3], 'L': [1, 2, 3], 'M': [1, 3, 4], 'N': [1, 3, 4, 5], 'O': [1, 3, 5],
      'P': [1, 2, 3, 4], 'Q': [1, 2, 3, 4, 5], 'R': [1, 2, 3, 5], 'S': [2, 3, 4], 'T': [2, 3, 4, 5],
      'U': [1, 3, 6], 'V': [1, 2, 3, 6], 'W': [2, 4, 5, 6], 'X': [1, 3, 4, 6], 'Y': [1, 3, 4, 5, 6], 'Z': [1, 3, 5, 6]
    };
    return patterns[letter] || [1];
  }

  private getLevelCategory(level: number): string {
    if (level <= 5) return 'basics';
    if (level <= 10) return 'words';
    if (level <= 15) return 'sentences';
    if (level <= 20) return 'contractions';
    return 'advanced';
  }
}

export const geminiService = new GeminiService();