export interface TutorResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'exercise';
  url: string;
  description: string;
  thumbnail?: string;
  duration?: string;
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialties: string[];
  experience: number;
  languages: string[];
  availability: string[];
  bio: string;
  verified: boolean;
  responseTime: string;
  totalStudents: number;
  resources: TutorResource[];
}

export interface TutorFormData {
  name: string;
  bio: string;
  location: string;
  specialties: string;
  experience_years: string;
  languages: string;
  availability: string;
}