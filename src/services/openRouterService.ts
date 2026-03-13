
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface StudyPlanLevel {
  level: number;
  title: string;
  description: string;
  estimatedHours: number;
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    duration: number;
    category: string;
    prerequisites: string[];
    exercises: any[];
  }>;
}

interface StudyPlan {
  totalLessons: number;
  estimatedWeeks: number;
  learningStyle: string;
  dailyTimeCommitment: number;
  currentLevel: number;
  levels: StudyPlanLevel[];
  roadmap: Array<{
    phase: string;
    weeks: string;
    focus: string;
    milestone: string;
  }>;
  weeklySchedule: Array<{
    week: number;
    focus: string;
    practiceTime: number;
    lessons: string[];
  }>;
}

class OpenRouterService {
  private isInitialized: boolean = false;

  constructor() {
  }

  async testConnection(): Promise<boolean> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent('Say "OK" if you can hear me.');
      const response = await result.response;
      const text = response.text();
      this.isInitialized = !!text && text.toUpperCase().includes('OK');
      return this.isInitialized;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw error;
    }
  }

  async analyzeImage(imageUrl: string, prompt?: string): Promise<string> {
    const systemPrompt = `You are an expert braille reader and teacher. Analyze the provided image for braille patterns and provide detailed information about what you see. If the image contains braille, identify each character and explain the dot patterns used.`;
    const userPrompt = prompt || 'Please analyze this image and identify any braille patterns you can see. Explain what each character represents.';

    try {
      let imageParts: any[] = [];

      if (imageUrl.startsWith('data:')) {
        const matches = imageUrl.match(/^data:(.+?);base64,(.+)$/);
        if (matches) {
          imageParts = [{
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            }
          }];
        }
      } else {
        try {
          const resp = await fetch(imageUrl);
          const blob = await resp.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          imageParts = [{
            inlineData: {
              mimeType: blob.type || 'image/png',
              data: base64,
            }
          }];
        } catch {
          return await this.chat(systemPrompt, `${userPrompt}\n\n[Image URL: ${imageUrl}]`);
        }
      }

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent([userPrompt, ...imageParts]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Image analysis error:', error);
      return 'Unable to analyze the image. Please ensure the image is clear and contains visible braille patterns.';
    }
  }

  async getPracticeHint(
    mode: string,
    currentQuestion: any,
    userAnswer?: string,
    correctAnswer?: string
  ): Promise<string> {
    const systemPrompt = `You are an encouraging braille tutor helping students practice. Provide helpful hints without giving away the answer directly. Be concise and supportive.`;

    let userPrompt = `The student is practicing "${mode}" mode. `;

    if (currentQuestion?.braillePattern) {
      const dots = currentQuestion.braillePattern.map((p: any) => p.dots?.join(',') || '').join(' | ');
      userPrompt += `Current braille pattern dots: ${dots}. `;
    }

    if (userAnswer && correctAnswer) {
      userPrompt += `They answered "${userAnswer}" but the correct answer is "${correctAnswer}". Give gentle correction and a tip.`;
    } else {
      userPrompt += `Give them a helpful hint to recognize this pattern.`;
    }

    try {
      return await this.chat(systemPrompt, userPrompt, { maxTokens: 200, temperature: 0.8 });
    } catch (error) {
      console.error('Practice hint error:', error);
      return this.getLocalPracticeHint(mode, currentQuestion);
    }
  }

  async generateStudyPlan(
    currentLevel: number,
    focusAreas: string[],
    learningStyle: string,
    dailyMinutes: number,
    customPrompt?: string
  ): Promise<StudyPlan> {
    const systemPrompt = `You are an expert braille education curriculum designer. Create comprehensive, structured study plans that help students learn braille effectively. Always respond with valid JSON only — no markdown, no explanations, no code fences.`;

    const userPrompt = `Create a personalized braille learning study plan with:
- Current Level: ${currentLevel}
- Focus Areas: ${focusAreas.join(', ')}
- Learning Style: ${learningStyle}
- Daily Time Available: ${dailyMinutes} minutes
${customPrompt ? `- Additional Requirements: ${customPrompt}` : ''}

Generate a JSON plan with this structure (keep it compact, max 5 levels with 3 lessons each):
{
  "title": "Plan title",
  "description": "Short plan description",
  "totalLessons": number,
  "estimatedWeeks": number,
  "weeklyGoal": 3,
  "focusAreas": ["basics"],
  "difficultyProgression": "gradual",
  "levels": [
    {
      "level": 1,
      "title": "Level title",
      "lessons": [
        {"id": "plan-1", "title": "Lesson title", "description": "Brief desc", "duration": 15, "category": "basics"}
      ]
    }
  ],
  "roadmap": [
    {"phase": "Phase name", "weeks": "1-4", "focus": "Focus", "milestone": "Goal"}
  ]
}

Return ONLY valid JSON, no markdown. Keep levels to 5 max with 2-4 lessons each.`;

    try {
      const response = await this.chat(systemPrompt, userPrompt, { maxTokens: 3000 });
      const cleanedJson = this.cleanJsonResponse(response);
      const plan = JSON.parse(cleanedJson);
      return plan;
    } catch (error) {
      console.error('Study plan generation error:', error);
      return this.generateFallbackStudyPlan(currentLevel, focusAreas, learningStyle, dailyMinutes);
    }
  }

  async customizeLesson(
    lessonId: string,
    userPreferences: {
      difficulty?: string;
      focusAreas?: string[];
      learningStyle?: string;
      timeLimit?: number;
      includeAudio?: boolean;
      includeHaptic?: boolean;
    },
    existingExercises?: any[]
  ): Promise<any[]> {
    const systemPrompt = `You are a braille curriculum expert. Customize braille learning exercises based on user preferences. Return valid JSON arrays of exercise objects only — no markdown, no explanations, no code fences.`;

    const userPrompt = `Customize lesson "${lessonId}" with these preferences:
- Difficulty: ${userPreferences.difficulty || 'medium'}
- Focus Areas: ${userPreferences.focusAreas?.join(', ') || 'general'}
- Learning Style: ${userPreferences.learningStyle || 'mixed'}
- Time Limit: ${userPreferences.timeLimit || 15} minutes
- Audio Support: ${userPreferences.includeAudio ? 'Yes' : 'No'}
- Haptic Feedback: ${userPreferences.includeHaptic ? 'Yes' : 'No'}

BRAILLE DOT REFERENCE (use these exact patterns):
A=[1], B=[1,2], C=[1,4], D=[1,4,5], E=[1,5], F=[1,2,4], G=[1,2,4,5], H=[1,2,5], I=[2,4], J=[2,4,5],
K=[1,3], L=[1,2,3], M=[1,3,4], N=[1,3,4,5], O=[1,3,5], P=[1,2,3,4], Q=[1,2,3,4,5], R=[1,2,3,5],
S=[2,3,4], T=[2,3,4,5], U=[1,3,6], V=[1,2,3,6], W=[2,4,5,6], X=[1,3,4,6], Y=[1,3,4,5,6], Z=[1,3,5,6]

Generate 5-10 customized exercises. Each exercise:
{
  "id": "unique-id",
  "type": "multiple-choice|braille-to-text|text-to-braille|match|speech-to-braille",
  "question": "Question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "correct answer",
  "braillePattern": [{"dots": [1,2,3], "char": "L"}],
  "points": 10,
  "hint": "Optional hint",
  "audioEnabled": ${userPreferences.includeAudio || false},
  "hapticEnabled": ${userPreferences.includeHaptic || false}
}

Return ONLY a valid JSON array of exercises.`;

    try {
      const response = await this.chat(systemPrompt, userPrompt, { maxTokens: 2048 });
      const cleanedJson = this.cleanJsonResponse(response);
      const exercises = JSON.parse(cleanedJson);
      return Array.isArray(exercises) ? exercises : [];
    } catch (error) {
      console.error('Lesson customization error:', error);
      return existingExercises || this.generateDefaultExercises(lessonId, userPreferences);
    }
  }

  async askInstructor(question: string, context?: string): Promise<string> {
    const systemPrompt = `You are a patient, knowledgeable, and encouraging braille instructor. Help students understand braille patterns, techniques, and concepts. Keep answers concise but thorough. Use emojis occasionally for warmth.`;

    const userPrompt = context
      ? `Question: ${question}\n\nContext: ${context}`
      : question;

    return await this.chat(systemPrompt, userPrompt, { maxTokens: 500, temperature: 0.8 });
  }

  async generateAdaptivePractice(
    modeId: string,
    userPerformance: {
      accuracy: number;
      speed: number;
      recentMistakes: string[];
      masteredPatterns: string[];
      currentStreak: number;
    },
    difficulty: string
  ): Promise<any[]> {
    const systemPrompt = `You are a braille practice content generator. Create adaptive exercises that challenge the student appropriately based on their performance. Return valid JSON arrays only — no markdown, no code fences.`;

    const userPrompt = `Generate adaptive practice content for "${modeId}" mode:
- Current Accuracy: ${userPerformance.accuracy}%
- Speed Performance: ${userPerformance.speed}
- Recent Mistakes: ${userPerformance.recentMistakes.join(', ') || 'None'}
- Mastered Patterns: ${userPerformance.masteredPatterns.join(', ') || 'None'}
- Current Streak: ${userPerformance.currentStreak}
- Difficulty Setting: ${difficulty}

BRAILLE DOT REFERENCE:
A=[1], B=[1,2], C=[1,4], D=[1,4,5], E=[1,5], F=[1,2,4], G=[1,2,4,5], H=[1,2,5], I=[2,4], J=[2,4,5],
K=[1,3], L=[1,2,3], M=[1,3,4], N=[1,3,4,5], O=[1,3,5], P=[1,2,3,4], Q=[1,2,3,4,5], R=[1,2,3,5],
S=[2,3,4], T=[2,3,4,5], U=[1,3,6], V=[1,2,3,6], W=[2,4,5,6], X=[1,3,4,6], Y=[1,3,4,5,6], Z=[1,3,5,6]

Generate 5-8 adaptive exercises as a JSON array. Each exercise:
{
  "id": "unique-id",
  "type": "multiple-choice|braille-to-text|pattern-completion|memory-match",
  "question": "question text",
  "options": ["opt1", "opt2", "opt3", "opt4"],
  "correctAnswer": "answer",
  "braillePattern": [{"dots": [1,2], "char": "B"}],
  "points": 10-50,
  "difficulty": "easy|medium|hard|expert",
  "targetSkill": "pattern-recognition|speed|accuracy|memory"
}

Return ONLY a valid JSON array.`;

    try {
      const response = await this.chat(systemPrompt, userPrompt, { maxTokens: 2048 });
      const cleanedJson = this.cleanJsonResponse(response);
      const exercises = JSON.parse(cleanedJson);
      return Array.isArray(exercises) ? exercises : [];
    } catch (error) {
      console.error('Adaptive practice generation error:', error);
      return this.generateLocalAdaptivePractice(modeId, userPerformance, difficulty);
    }
  }

  async generateCreativeLessonContent(
    category: string,
    level: number,
    theme?: string
  ): Promise<{
    title: string;
    description: string;
    story?: string;
    exercises: any[];
    funFacts: string[];
  }> {
    const systemPrompt = `You are a creative braille curriculum designer who makes learning fun and engaging. Create lesson content with stories, themes, and interesting facts. Return valid JSON only — no markdown, no code fences.`;

    const userPrompt = `Create engaging lesson content for:
- Category: ${category}
- Level: ${level}
- Theme: ${theme || 'general learning adventure'}

BRAILLE DOT REFERENCE:
A=[1], B=[1,2], C=[1,4], D=[1,4,5], E=[1,5], F=[1,2,4], G=[1,2,4,5], H=[1,2,5], I=[2,4], J=[2,4,5],
K=[1,3], L=[1,2,3], M=[1,3,4], N=[1,3,4,5], O=[1,3,5], P=[1,2,3,4], Q=[1,2,3,4,5], R=[1,2,3,5],
S=[2,3,4], T=[2,3,4,5], U=[1,3,6], V=[1,2,3,6], W=[2,4,5,6], X=[1,3,4,6], Y=[1,3,4,5,6], Z=[1,3,5,6]

Generate a JSON object with:
{
  "title": "Creative lesson title",
  "description": "Engaging description",
  "story": "A short story incorporating braille concepts (2-3 sentences)",
  "exercises": [
    {
      "id": "unique-id",
      "type": "multiple-choice|braille-to-text|text-to-braille|match",
      "question": "Engaging question tied to the story/theme",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctAnswer": "answer",
      "braillePattern": [{"dots": [1,2], "char": "B"}],
      "points": 10,
      "storyContext": "How this relates to the story"
    }
  ],
  "funFacts": [
    "Interesting fact about braille or the theme",
    "Another fun fact"
  ]
}

Make it educational but fun! Return ONLY valid JSON.`;

    try {
      const response = await this.chat(systemPrompt, userPrompt, { maxTokens: 2048, temperature: 0.9 });
      const cleanedJson = this.cleanJsonResponse(response);
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Creative content generation error:', error);
      return this.generateLocalCreativeContent(category, level, theme);
    }
  }

  async generateDailySchedule(
    availableHours: number,
    currentLevel: number,
    completedLessons: number,
    totalLessons: number,
    focusAreas: string[],
    preferredTimes: string[]
  ): Promise<any> {
    const systemPrompt = `You are a braille learning schedule optimizer. Create an efficient daily study schedule. Return valid JSON only — no markdown, no code fences.`;

    const userPrompt = `Create a daily braille study schedule:
- Available hours today: ${availableHours}
- Current level: ${currentLevel}
- Progress: ${completedLessons}/${totalLessons} lessons done
- Focus areas: ${focusAreas.join(', ')}
- Preferred times: ${preferredTimes.join(', ')}

Return a JSON object:
{
  "date": "${new Date().toISOString().split('T')[0]}",
  "totalMinutes": number,
  "blocks": [
    {
      "time": "9:00 AM",
      "duration": 30,
      "activity": "Activity name",
      "type": "lesson|practice|review|break",
      "description": "What to focus on",
      "lessonSuggestion": "Suggested lesson title"
    }
  ],
  "tips": ["Daily tip 1", "Daily tip 2"],
  "motivationalMessage": "Keep going message"
}`;

    try {
      const response = await this.chat(systemPrompt, userPrompt, { maxTokens: 1500 });
      const cleanedJson = this.cleanJsonResponse(response);
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Daily schedule generation error:', error);
      return this.generateFallbackDailySchedule(availableHours);
    }
  }

  async generateLesson(
    topic: string,
    level: number,
    duration: number,
    learningStyle: string
  ): Promise<any> {
    const systemPrompt = `You are a braille education expert. Create complete, structured braille lessons. Return valid JSON only — no markdown, no code fences.`;

    const userPrompt = `Create a complete braille lesson:
- Topic: ${topic}
- Level: ${level}
- Duration: ${duration} minutes
- Learning Style: ${learningStyle}

BRAILLE DOT REFERENCE:
A=[1], B=[1,2], C=[1,4], D=[1,4,5], E=[1,5], F=[1,2,4], G=[1,2,4,5], H=[1,2,5], I=[2,4], J=[2,4,5],
K=[1,3], L=[1,2,3], M=[1,3,4], N=[1,3,4,5], O=[1,3,5], P=[1,2,3,4], Q=[1,2,3,4,5], R=[1,2,3,5],
S=[2,3,4], T=[2,3,4,5], U=[1,3,6], V=[1,2,3,6], W=[2,4,5,6], X=[1,3,4,6], Y=[1,3,4,5,6], Z=[1,3,5,6]

Return a JSON object:
{
  "id": "ai-lesson-${Date.now()}",
  "title": "Lesson title",
  "description": "What students will learn",
  "level": ${level},
  "category": "basics|words|sentences|contractions|advanced",
  "duration": ${duration},
  "objectives": ["objective 1", "objective 2"],
  "content": {
    "introduction": "Opening explanation",
    "mainContent": "Core teaching material",
    "examples": [{"text": "example", "braille": [[1,2,3]]}],
    "tips": ["helpful tip 1"]
  },
  "exercises": [
    {
      "id": "ex-1",
      "type": "multiple-choice|braille-to-text|text-to-braille|match",
      "question": "Question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "braillePattern": [{"dots": [1], "char": "A"}],
      "points": 10
    }
  ],
  "prerequisites": []
}`;

    try {
      const response = await this.chat(systemPrompt, userPrompt, { maxTokens: 3000 });
      const cleanedJson = this.cleanJsonResponse(response);
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Lesson generation error:', error);
      return null;
    }
  }

private cleanJsonResponse(response: string): string {
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const startIndex = Math.min(
      firstBrace >= 0 ? firstBrace : Infinity,
      firstBracket >= 0 ? firstBracket : Infinity
    );

    if (startIndex !== Infinity) {
      cleaned = cleaned.substring(startIndex);
    }

    const isArray = cleaned.startsWith('[');
    const lastChar = isArray ? ']' : '}';
    const lastIndex = cleaned.lastIndexOf(lastChar);

    if (lastIndex !== -1) {
      cleaned = cleaned.substring(0, lastIndex + 1);
    }

    cleaned = cleaned
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/\n\s*\n/g, '\n')
      .replace(/,\s*,/g, ',');

    return cleaned;
  }

  private getLocalPracticeHint(mode: string, _question: any): string {
    const hints: Record<string, string[]> = {
      'lightning-reader': [
        '⚡ Focus on the top dots first - they often determine the letter!',
        '💡 Remember: A has only dot 1, B has dots 1,2, C has dots 1,4',
        '🎯 Look for patterns - many letters share common dot positions'
      ],
      'precision-master': [
        '🎯 Pay close attention to which dots are raised vs lowered',
        '🔍 Compare the patterns carefully - the difference is often just one dot',
        '✨ Take your time - accuracy matters more than speed here'
      ],
      'pattern-detective': [
        '🔎 Think about which letter this could be based on the visible dots',
        '🧩 Use logic - if you see dots 1 and 2, what letters use those?',
        '💭 Consider the pattern structure - rows and columns matter'
      ],
      default: [
        '🌟 Take your time and feel the pattern',
        '💪 You\'re doing great - keep practicing!',
        '🧠 Remember the dot numbering: top-left is 1, bottom-right is 6'
      ]
    };
    const modeHints = hints[mode] || hints.default;
    return modeHints[Math.floor(Math.random() * modeHints.length)];
  }

  private generateFallbackStudyPlan(
    currentLevel: number,
    focusAreas: string[],
    learningStyle: string,
    dailyMinutes: number
  ): StudyPlan {
    const levels: StudyPlanLevel[] = [];
    const lessonsPerLevel = Math.ceil(dailyMinutes / 5);
    const levelTitles = [
      'Alphabet Basics', 'Letters A-J', 'Letters K-T', 'Letters U-Z', 'Numbers 0-9',
      'Basic Punctuation', 'Simple Words', 'Common Words', 'Word Patterns', 'Short Sentences',
      'Simple Contractions', 'Common Contractions', 'Advanced Contractions', 'Reading Fluency', 'Speed Building',
      'Sentence Mastery', 'Paragraph Reading', 'Story Reading', 'Technical Text', 'Advanced Patterns',
      'Music Notation', 'Math Symbols', 'Scientific Notation', 'Foreign Characters', 'Speed Reading',
      'Professional Level', 'Teaching Skills', 'Expert Patterns', 'Master Reader', 'Braille Legend'
    ];

    for (let i = 1; i <= 30; i++) {
      const lessons = [];
      for (let j = 1; j <= lessonsPerLevel; j++) {
        lessons.push({
          id: `level-${i}-lesson-${j}`,
          title: `${levelTitles[i - 1]} - Part ${j}`,
          description: `Progressive lesson focusing on ${focusAreas[0] || 'braille mastery'}`,
          duration: 15 + (i * 2),
          category: i <= 10 ? 'basics' : i <= 20 ? 'intermediate' : 'advanced',
          prerequisites: i > 1 ? [`level-${i - 1}-lesson-1`] : [],
          exercises: this.generateLocalExercises(i, j)
        });
      }
      levels.push({
        level: i,
        title: levelTitles[i - 1],
        description: `Master ${levelTitles[i - 1].toLowerCase()} with ${lessonsPerLevel} focused lessons`,
        estimatedHours: (lessonsPerLevel * 15) / 60,
        lessons
      });
    }

    return {
      totalLessons: 30 * lessonsPerLevel,
      estimatedWeeks: Math.ceil((30 * lessonsPerLevel * 15) / (dailyMinutes * 7)),
      learningStyle,
      dailyTimeCommitment: dailyMinutes,
      currentLevel,
      levels,
      roadmap: [
        { phase: 'Foundation', weeks: 'Weeks 1-4', focus: 'Alphabet & Numbers', milestone: 'Read basic letters' },
        { phase: 'Building', weeks: 'Weeks 5-10', focus: 'Words & Sentences', milestone: 'Read simple text' },
        { phase: 'Intermediate', weeks: 'Weeks 11-18', focus: 'Contractions & Speed', milestone: 'Fluent reading' },
        { phase: 'Advanced', weeks: 'Weeks 19-26', focus: 'Complex Patterns', milestone: 'Expert recognition' },
        { phase: 'Mastery', weeks: 'Weeks 27-30', focus: 'Professional Skills', milestone: 'Master level' }
      ],
      weeklySchedule: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        focus: `Week ${i + 1}: ${levelTitles[Math.floor(i / 2)]}`,
        practiceTime: dailyMinutes * 7,
        lessons: levels[Math.floor(i / 2)]?.lessons.map(l => l.id) || []
      }))
    };
  }

  private generateFallbackDailySchedule(hours: number): any {
    const minutes = hours * 60;
    const blocks = [];
    let time = 9;
    const activities = [
      { activity: 'Letter Review', type: 'review', duration: 15 },
      { activity: 'New Pattern Practice', type: 'lesson', duration: 30 },
      { activity: 'Quick Break', type: 'break', duration: 5 },
      { activity: 'Speed Drill', type: 'practice', duration: 20 },
      { activity: 'Reading Practice', type: 'practice', duration: 25 },
    ];

    let remaining = minutes;
    for (const act of activities) {
      if (remaining <= 0) break;
      const dur = Math.min(act.duration, remaining);
      blocks.push({
        time: `${time}:00 ${time >= 12 ? 'PM' : 'AM'}`,
        duration: dur,
        activity: act.activity,
        type: act.type,
        description: 'Focus on building pattern recognition',
        lessonSuggestion: act.type === 'lesson' ? 'Continue your current level' : undefined
      });
      remaining -= dur;
      time += Math.ceil(dur / 60);
    }

    return {
      date: new Date().toISOString().split('T')[0],
      totalMinutes: minutes - remaining,
      blocks,
      tips: ['Start with review to warm up', 'Take breaks to prevent fatigue'],
      motivationalMessage: 'Every minute of practice brings you closer to mastery! 🌟'
    };
  }

  private generateLocalExercises(level: number, lessonNumber: number): any[] {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const patterns: Record<string, number[]> = {
      'A': [1], 'B': [1, 2], 'C': [1, 4], 'D': [1, 4, 5], 'E': [1, 5],
      'F': [1, 2, 4], 'G': [1, 2, 4, 5], 'H': [1, 2, 5], 'I': [2, 4], 'J': [2, 4, 5],
      'K': [1, 3], 'L': [1, 2, 3], 'M': [1, 3, 4], 'N': [1, 3, 4, 5], 'O': [1, 3, 5],
      'P': [1, 2, 3, 4], 'Q': [1, 2, 3, 4, 5], 'R': [1, 2, 3, 5], 'S': [2, 3, 4], 'T': [2, 3, 4, 5],
      'U': [1, 3, 6], 'V': [1, 2, 3, 6], 'W': [2, 4, 5, 6], 'X': [1, 3, 4, 6], 'Y': [1, 3, 4, 5, 6], 'Z': [1, 3, 5, 6]
    };
    const exercises = [];
    const exerciseCount = Math.min(3 + Math.floor(level / 5), 6);
    for (let i = 0; i < exerciseCount; i++) {
      const letterIndex = (level + lessonNumber + i) % 26;
      const letter = letters[letterIndex];
      const distractors = letters.filter(l => l !== letter).sort(() => Math.random() - 0.5).slice(0, 3);
      exercises.push({
        id: `ex-${level}-${lessonNumber}-${i}`,
        type: ['multiple-choice', 'braille-to-text', 'text-to-braille'][i % 3],
        question: 'What letter does this braille pattern represent?',
        options: [letter, ...distractors].sort(() => Math.random() - 0.5),
        correctAnswer: letter,
        braillePattern: [{ dots: patterns[letter], char: letter }],
        points: 10 + (level * 2)
      });
    }
    return exercises;
  }

  private generateDefaultExercises(_lessonId: string, _preferences: any): any[] {
    return this.generateLocalExercises(1, 1);
  }

  private generateLocalAdaptivePractice(_modeId: string, performance: any, _difficulty: string): any[] {
    const baseLevel = performance.accuracy > 80 ? 3 : performance.accuracy > 60 ? 2 : 1;
    return this.generateLocalExercises(baseLevel, 1);
  }

  private generateLocalCreativeContent(category: string, level: number, theme?: string): any {
    return {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Adventure - Level ${level}`,
      description: `Explore the world of braille through exciting ${theme || 'learning'} activities!`,
      story: 'You are a braille explorer on a quest to master new patterns. Each correct answer brings you closer to becoming a braille champion!',
      exercises: this.generateLocalExercises(level, 1),
      funFacts: [
        'Louis Braille invented the braille system when he was only 15 years old!',
        'Braille can be written in almost every language in the world.',
        'The standard braille cell has 6 dots that can create 63 unique patterns.'
      ]
    };
  }
}

export const openRouterService = new OpenRouterService();
export default openRouterService;