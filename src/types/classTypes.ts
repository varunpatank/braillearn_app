export interface BrailleClass {
  id: string;
  creatorId: string | null;
  title: string;
  description: string;
  imageUrl: string;
  meetingLink: string;
  schedule: {
    days: string[];
    time: string;
    duration: number;
  };
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  chapters: Chapter[];
  maxStudents: number;
  enrolledStudents: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublic: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  resources: Resource[];
}

export interface Resource {
  id: string;
  type: 'video' | 'document' | 'link' | 'exercise';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}