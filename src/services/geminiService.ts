import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private isInitialized = false;

  constructor() {
    console.log('🚀 Initializing Gemini service...');
    console.log('Environment check:', {
      envKeyExists: !!import.meta.env.VITE_GOOGLE_AI_API_KEY,
      keyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'No key found',
      envMode: import.meta.env.MODE
    });
    
    if (!API_KEY) {
      console.error('❌ No Gemini API key found in environment variables!');
      throw new Error('Gemini API key is required. Please check your .env file.');
    }
    
    this.genAI = new GoogleGenerativeAI(API_KEY);
    // Initialize with the most common model name
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('✅ Gemini service initialized with gemini-pro model');
  }

  private async ensureInitialized() {
    if (this.isInitialized) return;

    // Try different model names with the correct API format (models/ prefix is often required)
    const modelNames = [
      "models/gemini-1.5-flash-latest",
      "models/gemini-1.5-pro-latest", 
      "models/gemini-1.5-flash",
      "models/gemini-1.5-pro",
      "models/gemini-pro",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest", 
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro-latest",
      "gemini-pro"
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Testing model: ${modelName}`);
        this.model = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 1000,
          }
        });
        
        // Test the model with a simple request
        const testResult = await this.model.generateContent("Test");
        const response = await testResult.response;
        const text = response.text();
        
        if (text && text.length > 0) {
          console.log(`✅ Successfully verified model: ${modelName}`);
          this.isInitialized = true;
          return;
        }
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} failed:`, modelError instanceof Error ? modelError.message.substring(0, 150) + '...' : modelError);
      }
    }
    
    console.error('❌ All models failed, using fallback mode');
    this.isInitialized = false;
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    console.log('🔍 Testing Gemini API connection...');
    try {
      await this.ensureInitialized();
      
      if (!this.isInitialized) {
        console.log('📋 Attempting to list available models...');
        await this.listAvailableModels();
        return false;
      }
      
      const result = await this.model.generateContent('Hello, respond with just "OK" if you can hear me.');
      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini API test successful. Response:', text);
      return true;
    } catch (error) {
      console.error('❌ Gemini API test failed:', error);
      console.log('📋 Attempting to list available models...');
      await this.listAvailableModels();
      return false;
    }
  }

  // List available models for debugging
  async listAvailableModels() {
    try {
      console.log('🔍 Testing common model names manually...');
      
      // Try some common model names with different formats
      const commonModels = [
        'models/gemini-pro',
        'models/gemini-1.5-flash', 
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-pro-latest',
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
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
      const result = await this.model.generateContent(prompt);
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

  async askInstructor(question: string, context: string = '') {
    console.log('💬 AI Instructor Request:', { question, context });
    
    const prompt = `You are BrailleLearn's helpful AI instructor. A student is asking for help with their braille lesson.

    Student's Context: ${context}
    Student's Question: ${question}

    Please provide a helpful, encouraging response (2-3 sentences) that:
    1. Directly addresses their specific question
    2. Gives practical braille learning tips
    3. Encourages continued practice
    4. Uses a supportive, teaching tone

    Remember to be specific and actionable in your advice. Always respond with text.`;

    try {
      console.log('🔄 Sending request to Gemini API...');
      console.log('📝 Prompt being sent:', prompt.substring(0, 200) + '...');
      await this.ensureInitialized();
      
      if (!this.isInitialized) {
        console.warn('⚠️ Models not properly initialized, using fallback response');
        return "I'm having some technical difficulties right now, but I'm still here to help! Remember that practice makes perfect with braille - focus on one pattern at a time and build your muscle memory gradually.";
      }
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('✅ AI Instructor Response received:', responseText);
      console.log('📏 Response length:', responseText?.length || 0);
      
      // Check if response is empty or just whitespace
      if (!responseText || responseText.trim().length === 0) {
        console.warn('⚠️ Received empty response from AI, using fallback');
        return "Great question! Remember that braille patterns use combinations of 6 dots. Take your time to feel each pattern and practice regularly. You're making excellent progress!";
      }
      
      return responseText.trim();
    } catch (error) {
      console.error('❌ AI Instructor Error Details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        if (error.message.includes('[503 ]')) {
          console.warn('🚨 Gemini service temporarily overloaded');
          return "I'm temporarily overloaded but I'll be back soon! In the meantime, remember to practice each braille pattern slowly and build up your muscle memory. You're doing great!";
        } else if (error.message.includes('[429 ]')) {
          console.warn('🚨 Rate limit reached');
          return "I need to take a quick break due to too many requests. Keep practicing those braille patterns - consistency is key to mastering braille reading!";
        } else if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
          console.error('🚨 API Key issue detected');
          return "I'm having authentication troubles. While I get that sorted, remember that each braille cell has 6 dots and practice makes perfect!";
        } else if (error.message.includes('[404 ]') || error.message.includes('not found')) {
          console.error('🚨 Model not found - trying fallback approach');
          return "I'm updating my systems right now. While I do that, focus on the fundamentals: each braille character uses a combination of the 6 dots. Take your time and you'll master it!";
        }
      }
      
      return "I'm having trouble connecting right now, but don't let that stop you! Remember to take your time with each braille pattern and practice regularly. Each dot position is important for forming the correct character!";
    }
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
          title: `${levelInfo.title} - ${this.getLessonTitle(i, j + 1, focusAreas)}`,
          description: `${this.getLessonDescription(i, j + 1, learningStyle, focusAreas)}`,
          duration: 15 + (i * 2) + (j * 5),
          category: this.getLevelCategory(i),
          prerequisites: i > 1 ? [`level-${i-1}-lesson-1`] : [],
          exercises: this.generateLessonExercises(i, j + 1, focusAreas)
        });
      }
      
      levels.push({
        level: i,
        title: `Level ${i} - ${levelInfo.title}`,
        description: levelInfo.description,
        estimatedHours: 2 + (i * 0.5),
        lessons: lessons
      });
    }

    return {
     totalLessons: totalLessonsTarget,
      estimatedWeeks: Math.ceil(30 * timeAvailable / (7 * timeAvailable)),
      learningStyle: learningStyle,
      dailyTimeCommitment: timeAvailable,
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
    return titles[(lessonNumber - 1) % titles.length];
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
    return `${baseDescription} focused on ${focusArea} for level ${level}`;
  }

  private generateLessonExercises(level: number, lessonNumber: number, focusAreas: string[]) {
    const focusArea = focusAreas[0] || 'letters';
    const exerciseTypes = ['multiple-choice', 'braille-to-text', 'text-to-braille', 'match', 'speech-to-braille'] as const;
    const exerciseType = exerciseTypes[(lessonNumber - 1) % exerciseTypes.length];
    
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
        return focusQuestions[focusArea as keyof typeof focusQuestions] || `What does this braille pattern represent?`;
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