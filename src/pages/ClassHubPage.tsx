import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from '@/components/motion';
import { ClassDashboard } from '@/components/ClassDashboard';
import {
  MapPin, Star, Users, BookOpen, Video, MessageCircle,
  Plus, Search, Calendar, Award, Globe, Heart,
  Play, ExternalLink, Clock, Youtube, X, FileText,
  LinkIcon, Upload, Trash, Save, CheckCircle, BarChart
} from 'lucide-react';
import { showSuccessConfetti } from '@/utils/confetti';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ClassService } from '@/services/classService';
import { BrailleClass, Chapter, Resource } from '@/types/classTypes';

interface TutorResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'exercise';
  url: string;
  description: string;
  thumbnail?: string;
  duration?: string;
}

interface Tutor {
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



const ClassHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tutors' | 'classes' | 'dashboard' | 'resources'>('tutors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTutor, setShowAddTutor] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedClass, setSelectedClass] = useState<BrailleClass | null>(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showClassStats, setShowClassStats] = useState(false);
  const [tutorForm, setTutorForm] = useState({
    name: '',
    bio: '',
    location: '',
    specialties: '',
    experience_years: '',
    languages: '',
    availability: ''
  });
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imageFile: null as File | null,
    meetingLink: '',
    schedule: {
      days: [] as string[],
      time: '',
      duration: 60
    },
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    maxStudents: 10,
    isPublic: true,
    chapters: [] as {
      title: string;
      content: string;
      resources: {
        type: 'video' | 'document' | 'link';
        title: string;
        url: string;
        description: string;
      }[];
    }[]
  });

  const [tutors, setTutors] = useState<Tutor[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@brailleedu.org',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150',
      rating: 4.9,
      reviewCount: 127,
      location: 'New York, NY',
      specialties: ['Beginner Braille', 'Literary Braille', 'Braille Music', 'Teacher Training'],
      experience: 15,
      languages: ['English', 'Spanish', 'French'],
      availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      bio: 'Certified braille instructor with 15 years of experience. PhD in Special Education with focus on braille literacy. Published researcher and international speaker on braille education methods.',
      verified: true,
      responseTime: '< 1 hour',
      totalStudents: 342,
      resources: [
        {
          id: 'r1',
          title: 'Braille Basics Video Series',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=KeCVBUKXmYE',
          description: 'Complete 10-part video series covering braille fundamentals',
          thumbnail: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=300',
          duration: '2:30:00'
        },
        {
          id: 'r2',
          title: 'Braille Reading Exercises PDF',
          type: 'document',
          url: '#',
          description: 'Downloadable practice exercises for all skill levels',
          thumbnail: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?w=300'
        },
        {
          id: 'r3',
          title: 'Interactive Braille Patterns',
          type: 'exercise',
          url: '#',
          description: 'Online interactive exercises for pattern recognition',
          thumbnail: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=300'
        }
      ]
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@techbraille.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150',
      rating: 4.8,
      reviewCount: 89,
      location: 'San Francisco, CA',
      specialties: ['Math Braille', 'Computer Braille', 'STEM Education', 'Assistive Technology'],
      experience: 12,
      languages: ['English', 'Mandarin', 'Japanese'],
      availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      bio: 'Former software engineer turned braille educator. Expert in technical braille notation, Nemeth Code, and computer accessibility. Specializes in STEM education for visually impaired students.',
      verified: true,
      responseTime: '< 2 hours',
      totalStudents: 198,
      resources: [
        {
          id: 'r4',
          title: 'Nemeth Code Tutorial',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=2Auyz_2gnQs',
          description: 'Learn mathematical braille notation step by step',
          thumbnail: 'https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg?w=300',
          duration: '1:45:00'
        },
        {
          id: 'r5',
          title: 'STEM Braille Reference Guide',
          type: 'document',
          url: '#',
          description: 'Comprehensive guide to scientific and mathematical braille',
          thumbnail: 'https://images.pexels.com/photos/159775/library-books-education-literature-159775.jpeg?w=300'
        }
      ]
    },
    {
      id: '3',
      name: 'Prof. Emily Rodriguez',
      email: 'emily.rodriguez@university.edu',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?w=150',
      rating: 5.0,
      reviewCount: 156,
      location: 'Austin, TX',
      specialties: ['Academic Braille', 'Research Methods', 'Advanced Contractions', 'Curriculum Development'],
      experience: 20,
      languages: ['English', 'Spanish', 'Portuguese'],
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      bio: 'Professor of Special Education and leading braille researcher. Author of multiple textbooks on braille instruction. Consultant for international braille literacy programs.',
      verified: true,
      responseTime: '< 3 hours',
      totalStudents: 567,
      resources: [
        {
          id: 'r6',
          title: 'Advanced Contractions Masterclass',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=8pnuFAicGmI',
          description: 'Master complex braille contractions for faster reading',
          thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?w=300',
          duration: '3:15:00'
        },
        {
          id: 'r7',
          title: 'Research-Based Teaching Methods',
          type: 'document',
          url: '#',
          description: 'Evidence-based approaches to braille instruction',
          thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?w=300'
        }
      ]
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james.wilson@youthbraille.org',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150',
      rating: 4.7,
      reviewCount: 73,
      location: 'Chicago, IL',
      specialties: ['Youth Education', 'Games & Activities', 'Parent Support', 'Early Childhood'],
      experience: 8,
      languages: ['English'],
      availability: ['Saturday', 'Sunday', 'Monday'],
      bio: 'Passionate youth educator specializing in making braille fun for children and teens. Creates engaging games and activities. Provides support and training for parents and families.',
      verified: true,
      responseTime: '< 4 hours',
      totalStudents: 234,
      resources: [
        {
          id: 'r8',
          title: 'Braille Games for Kids',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'Fun games and activities to teach children braille',
          thumbnail: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?w=300',
          duration: '45:00'
        },
        {
          id: 'r9',
          title: 'Parent Guide to Supporting Braille Learning',
          type: 'document',
          url: '#',
          description: 'How parents can support their child\'s braille journey',
          thumbnail: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=300'
        }
      ]
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@adultbraille.com',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=150',
      rating: 4.9,
      reviewCount: 94,
      location: 'Seattle, WA',
      specialties: ['Adult Learning', 'Career Transition', 'Technology Integration', 'Workplace Skills'],
      experience: 14,
      languages: ['English', 'German'],
      availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      bio: 'Specializes in helping adults learn braille for career advancement and personal growth. Expert in assistive technology and workplace accommodations.',
      verified: true,
      responseTime: '< 2 hours',
      totalStudents: 289,
      resources: [
        {
          id: 'r10',
          title: 'Braille in the Workplace',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=example10',
          description: 'How to use braille effectively in professional settings',
          thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=300',
          duration: '1:20:00'
        },
        {
          id: 'r11',
          title: 'Assistive Technology Guide',
          type: 'link',
          url: 'https://www.assistivetech.net/braille',
          description: 'Comprehensive guide to braille assistive technologies',
          thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?w=300'
        }
      ]
    },
    {
      id: '6',
      name: 'Dr. David Kim',
      email: 'david.kim@mathbraille.edu',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=150',
      rating: 4.8,
      reviewCount: 67,
      location: 'Boston, MA',
      specialties: ['Mathematical Braille', 'Nemeth Code', 'Scientific Notation', 'University Prep'],
      experience: 16,
      languages: ['English', 'Korean', 'Mandarin'],
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      bio: 'Mathematics professor and Nemeth Code expert. Helps students excel in STEM fields through advanced mathematical braille notation. University preparation specialist.',
      verified: true,
      responseTime: '< 1 hour',
      totalStudents: 156,
      resources: [
        {
          id: 'r12',
          title: 'Nemeth Code Complete Course',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=example12',
          description: 'Complete course in mathematical braille notation',
          thumbnail: 'https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg?w=300',
          duration: '4:30:00'
        },
        {
          id: 'r13',
          title: 'Scientific Braille Symbols',
          type: 'document',
          url: '#',
          description: 'Reference guide for scientific and mathematical symbols',
          thumbnail: 'https://images.pexels.com/photos/159775/library-books-education-literature-159775.jpeg?w=300'
        }
      ]
    }
  ]);

  const [classes, setClasses] = useState<BrailleClass[]>([
    {
      id: '1',
      title: 'Introduction to Literary Braille',
      description: 'Learn the fundamentals of literary braille, including the alphabet and basic punctuation.',
      imageUrl: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=400',
      meetingLink: 'https://meet.google.com/xyz',
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '10:00',
        duration: 60
      },
      level: 'beginner',
      category: 'Literary Braille',
      maxStudents: 15,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Alphabet and Numbers',
          content: 'Basic alphabet and numeric representations in braille',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user1', 'user2', 'user3'],
      creatorId: 'tutor1'
    },
    {
      id: '2',
      title: 'Advanced Mathematical Braille',
      description: 'Master complex mathematical notations and equations in braille format.',
      imageUrl: 'https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg?w=400',
      meetingLink: 'https://meet.google.com/abc',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '14:00',
        duration: 90
      },
      level: 'advanced',
      category: 'Mathematical Braille',
      maxStudents: 10,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Advanced Equations',
          content: 'Complex mathematical equations and their braille representation',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user4', 'user5'],
      creatorId: 'tutor2'
    },
    {
      id: '3',
      title: 'Music Braille Basics',
      description: 'Introduction to reading and writing musical notation in braille.',
      imageUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?w=400',
      meetingLink: 'https://meet.google.com/def',
      schedule: {
        days: ['Friday'],
        time: '16:00',
        duration: 75
      },
      level: 'intermediate',
      category: 'Music Braille',
      maxStudents: 12,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Musical Notation',
          content: 'Basic musical symbols and their braille equivalents',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user6', 'user7', 'user8', 'user9'],
      creatorId: 'tutor3'
    },
    {
      id: '4',
      title: 'Computer Science Braille',
      description: 'Learn specialized braille notations for programming and computer science concepts.',
      imageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?w=400',
      meetingLink: 'https://meet.google.com/ghi',
      schedule: {
        days: ['Monday', 'Thursday'],
        time: '18:00',
        duration: 90
      },
      level: 'advanced',
      category: 'Technical Braille',
      maxStudents: 8,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Programming Concepts',
          content: 'Braille representation of programming syntax and structures',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user10', 'user11'],
      creatorId: 'tutor4'
    },
    {
      id: '5',
      title: 'Scientific Braille',
      description: 'Master scientific notation and chemistry symbols in braille.',
      imageUrl: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=400',
      meetingLink: 'https://meet.google.com/jkl',
      schedule: {
        days: ['Tuesday', 'Friday'],
        time: '15:30',
        duration: 75
      },
      level: 'intermediate',
      category: 'Scientific Braille',
      maxStudents: 10,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Chemical Formulas',
          content: 'Understanding and writing chemical formulas in braille',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user12', 'user13', 'user14'],
      creatorId: 'tutor5'
    },
    {
      id: '6',
      title: 'Foreign Language Braille',
      description: 'Learn braille adaptations for Spanish, French, and German.',
      imageUrl: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?w=400',
      meetingLink: 'https://meet.google.com/mno',
      schedule: {
        days: ['Wednesday', 'Saturday'],
        time: '11:00',
        duration: 90
      },
      level: 'intermediate',
      category: 'Language Braille',
      maxStudents: 15,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Spanish Braille',
          content: 'Spanish language adaptations and special characters',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user15', 'user16', 'user17', 'user18'],
      creatorId: 'tutor6'
    }
  ]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();

  // Load classes when component mounts or user changes
  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    try {
      console.log('Fetching classes...');
      const { data, error } = await ClassService.getClasses();
      if (error) {
        console.error('Error from getClasses:', error);
        throw error;
      }
      console.log('Classes fetched:', data);
      setClasses(data || []);
      
      // Show success toast if classes are loaded
      if (data && data.length > 0) {
        toast({
          title: "Success",
          description: `Loaded ${data.length} classes`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    }
  };

  // Online resources with working image previews
  const onlineResources = [
    {
      id: '1',
      title: 'Introduction to Braille Reading',
      type: 'video',
      duration: '15:30',
      description: 'Learn the basics of braille reading with this comprehensive introduction.',
      embedUrl: 'https://www.youtube.com/embed/KeCVBUKXmYE',
      thumbnail: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=400&h=225',
      category: 'Beginner',
      url: 'https://www.youtube.com/watch?v=KeCVBUKXmYE'
    },
    {
      id: '2',
      title: 'Braille Alphabet and Numbers',
      type: 'video',
      duration: '22:45',
      description: 'Master the complete braille alphabet and number system.',
      embedUrl: 'https://www.youtube.com/embed/2Auyz_2gnQs',
      thumbnail: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?w=400&h=225',
      category: 'Beginner',
      url: 'https://www.youtube.com/watch?v=2Auyz_2gnQs'
    },
    {
      id: '3',
      title: 'Advanced Braille Contractions',
      type: 'video',
      duration: '18:20',
      description: 'Learn common braille contractions to improve reading speed.',
      embedUrl: 'https://www.youtube.com/embed/8pnuFAicGmI',
      thumbnail: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=400&h=225',
      category: 'Advanced',
      url: 'https://www.youtube.com/watch?v=8pnuFAicGmI'
    },
    {
      id: '4',
      title: 'Braille Music Notation',
      type: 'video',
      duration: '25:10',
      description: 'Introduction to reading music in braille notation.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?w=400&h=225',
      category: 'Specialized',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: '5',
      title: 'National Federation of the Blind',
      type: 'link',
      description: 'Comprehensive resources and advocacy for braille literacy.',
      url: 'https://nfb.org/resources/braille-resources',
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?w=400&h=225',
      category: 'Resources'
    },
    {
      id: '6',
      title: 'Braille Institute',
      type: 'link',
      description: 'Educational programs and braille learning materials.',
      url: 'https://brailleinstitute.org/',
      thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?w=400&h=225',
      category: 'Resources'
    },
    {
      id: '7',
      title: 'Hadley Institute for the Blind',
      type: 'link',
      description: 'Free distance education courses in braille.',
      url: 'https://hadley.edu/',
      thumbnail: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?w=400&h=225',
      category: 'Education'
    },
    {
      id: '8',
      title: 'Braille Writing Techniques',
      type: 'video',
      duration: '12:15',
      description: 'Learn proper braille writing techniques and tools.',
      embedUrl: 'https://www.youtube.com/embed/example8',
      thumbnail: 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?w=400&h=225',
      category: 'Beginner',
      url: 'https://www.youtube.com/watch?v=example8'
    },
    {
      id: '9',
      title: 'Live Braille Reading Session',
      type: 'video',
      duration: 'Live',
      description: 'Join our weekly live braille reading practice sessions.',
      embedUrl: 'https://www.youtube.com/embed/live_stream',
      thumbnail: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=400&h=225',
      category: 'Live',
      url: 'https://www.youtube.com/watch?v=live_stream'
    },
    {
      id: '10',
      title: 'Braille Technology Updates',
      type: 'link',
      description: 'Latest developments in braille technology and tools.',
      url: 'https://www.brailletech.org/updates',
      thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=400&h=225',
      category: 'Technology'
    }
  ];
  
  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTutor: Tutor = {
      id: Date.now().toString(),
      name: tutorForm.name,
      email: `${tutorForm.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 100000}/pexels-photo-${Math.floor(Math.random() * 1000000) + 100000}.jpeg?w=150`,
      rating: 5.0,
      reviewCount: 0,
      location: tutorForm.location,
      specialties: tutorForm.specialties.split(',').map(s => s.trim()).filter(s => s),
      experience: parseInt(tutorForm.experience_years) || 0,
      languages: tutorForm.languages.split(',').map(s => s.trim()).filter(s => s),
      availability: tutorForm.availability.split(',').map(s => s.trim()).filter(s => s),
      bio: tutorForm.bio,
      verified: false,
      responseTime: '< 1 hour',
      totalStudents: 0,
      resources: []
    };
    
    setTutors(prev => [...prev, newTutor]);
    showSuccessConfetti();
    toast({
      title: "🎉 Congratulations!",
      description: "You are now a volunteer tutor! Thank you for joining our community.",
      variant: "default",
    });
    setTimeout(() => {
      setShowAddTutor(false);
      setTutorForm({
        name: '',
        bio: '',
        location: '',
        specialties: '',
        experience_years: '',
        languages: '',
        availability: ''
      });
    }, 2000);
  };

  const [loading, setLoading] = useState(false);
  
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log('Starting class creation...', classForm);
      
      // Validate required fields
      if (!classForm.title || !classForm.description || !classForm.category || classForm.schedule.days.length === 0 || !classForm.schedule.time) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare class data for anonymous class creation
      const classData = {
        title: classForm.title,
        description: classForm.description,
        imageUrl: classForm.imageUrl || '/braille-pattern.svg',
        meetingLink: classForm.meetingLink || '',
        schedule: classForm.schedule,
        level: classForm.level,
        category: classForm.category || 'General',
        maxStudents: classForm.maxStudents,
        isPublic: true,
        chapters: classForm.chapters.map((chapter, index) => ({
          id: `temp-${index}`,
          title: chapter.title,
          content: chapter.content,
          order: index + 1,
          resources: (chapter.resources || []).map((resource, rIndex) => ({
            id: `temp-resource-${index}-${rIndex}`,
            type: resource.type,
            title: resource.title,
            description: resource.description,
            url: resource.url
          }))
        })),
        tags: []
      };

      console.log('Sending class data to service:', classData);
      
      // Create the class
      const result = await ClassService.createClass(classData, classForm.imageFile || undefined);
      console.log('Class creation result:', result);

      if (result.error) {
        console.error('Error creating class:', result.error);
        throw result.error;
      }

      if (!result.data) {
        throw new Error('No data returned from class creation');
      }

      // Update local state with the new class
      setClasses(prev => [result.data as BrailleClass, ...prev]);

      // Show success messages
      showSuccessConfetti();
      toast({
        title: "Success! 🎉",
        description: "Your class has been created successfully.",
        variant: "default"
      });

      // Reset form
      setClassForm({
        title: '',
        description: '',
        imageUrl: '',
        imageFile: null,
        meetingLink: '',
        schedule: {
          days: [],
          time: '',
          duration: 60
        },
        level: 'beginner',
        category: '',
        maxStudents: 10,
        isPublic: true,
        chapters: []
      });

      // Close the modal
      setShowCreateClass(false);

      // Show class statistics
      setSelectedClass(result.data);
      setShowClassStats(true);

      // Refresh the classes list
      await loadClasses();

    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create class",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setClassForm({
        title: '',
        description: '',
        imageUrl: '',
        imageFile: null,
        meetingLink: '',
        schedule: {
          days: [],
          time: '',
          duration: 60
        },
        level: 'beginner',
        category: '',
        maxStudents: 10,
        isPublic: true,
        chapters: []
      });
    }
  };



  const filteredTutors = tutors.filter((tutor: Tutor) =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.specialties.some((specialty: string) => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredClasses = classes.filter((classSession: BrailleClass) => 
    classSession.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classSession.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classSession.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is handled by App.tsx */}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-12 relative">
        <div className="absolute inset-0 braille-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl font-bold leading-tight mb-4 text-white drop-shadow-lg">
            🎓 Class Hub
          </h1>
          <p className="text-lg text-white drop-shadow-lg">
            Connect with volunteer tutors and join live braille learning sessions
          </p>
          
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search tutors, classes, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 mt-6"
            />
            <Search className="absolute left-4 top-9 text-gray-400" size={20} />
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
            Class Hub
          </h1>
          <p className="text-xl text-gray-600 drop-shadow-sm">
            Connect with tutors, join classes, and learn together
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-900">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm border-2 border-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Tutors</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{tutors.length}</p>
            <p className="text-sm text-gray-500">Available now</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-900">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm border-2 border-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Live Classes</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{classes.length}</p>
            <p className="text-sm text-gray-500">This week</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-900">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm border-2 border-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Avg Rating</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">4.9</p>
            <p className="text-sm text-gray-500">Out of 5 stars</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-900">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm border-2 border-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Languages</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">12</p>
            <p className="text-sm text-gray-500">Supported</p>
          </div>
        </div>

        {/* Featured Tutors */}
        <div className="mb-12">
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6 inline-block border-2 border-gray-900">
              <h2 className="text-2xl font-bold text-gray-900">
                ⭐ Featured Tutors
              </h2>
            </div>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.slice(0, 6).map((tutor) => (
              <motion.div
                key={tutor.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={() => setSelectedTutor(tutor)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tutor.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={12} className="mr-1" />
                      <span>{tutor.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{tutor.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">{tutor.reviewCount} reviews</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {tutor.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{tutor.experience} years exp.</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Classes */}
        <div className="mb-12">
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6 inline-block border-2 border-gray-900">
                <h2 className="text-2xl font-bold text-gray-900">
                  📅 Upcoming Classes
                </h2>
              </div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.slice(0, 4).map((classItem) => (
              <motion.div
                key={classItem.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={() => setSelectedClass(classItem)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{classItem.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{classItem.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">FREE</div>
                    <div className="text-sm text-gray-500">{classItem.schedule.duration}min</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2 text-blue-600" />
                    <span>{classItem.schedule.days.join(', ')} at {classItem.schedule.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users size={14} className="mr-2 text-purple-600" />
                    <span>{classItem.enrolledStudents.length}/{classItem.maxStudents} students</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {classItem.level}
                  </span>
                  <span className="text-sm text-gray-500">
                    {classItem.chapters.reduce((count, chapter) => count + chapter.resources.length, 0)} resources
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Community Features */}
        <div className="mb-12">
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6 inline-block border-2 border-gray-900">
                <h2 className="text-2xl font-bold text-gray-900">
                  🤝 Community Features
                </h2>
              </div>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Groups</h3>
              <p className="text-gray-600 text-sm">
                Join peer study groups and practice braille with other learners at your level.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievements</h3>
              <p className="text-gray-600 text-sm">
                Track your progress and earn badges as you master different braille skills.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mentorship</h3>
              <p className="text-gray-600 text-sm">
                Connect with experienced braille users for ongoing support and guidance.
              </p>
            </div>
          </div>
        </div>
        
        {/* Success Stories */}
        <div className="mb-12">
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6 inline-block border-2 border-gray-900">
                <h2 className="text-2xl font-bold text-gray-900">
                  💫 Success Stories
                </h2>
              </div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?w=60"
                  alt="Maria"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Maria Rodriguez</h4>
                  <p className="text-sm text-gray-600">Adult Learner</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "Thanks to the amazing tutors here, I learned braille in just 6 months and can now read independently. The free classes made all the difference!"
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=60"
                  alt="Alex"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Alex Thompson</h4>
                  <p className="text-sm text-gray-600">Student</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "The math braille classes helped me excel in my engineering studies. Now I'm pursuing my PhD with confidence!"
              </p>
            </div>
          </div>
        </div>
        
        {/* Getting Started */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="bg-primary-50 rounded-xl p-4 inline-block">
              <h2 className="text-2xl font-bold text-gray-900">
                🚀 Ready to Get Started?
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Find a Tutor
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our community of experienced braille instructors and find the perfect match for your learning style and schedule.
              </p>
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Browse Tutors
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Join a Class
              </h3>
              <p className="text-gray-600 mb-6">
                Participate in live group sessions, practice with peers, and learn from expert instructors in real-time.
              </p>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                View Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <div className="mb-8 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex">
              {[
                { id: 'tutors', label: 'Find Tutors', icon: Users },
                { id: 'classes', label: 'Live Classes', icon: BookOpen },
                { id: 'dashboard', label: 'My Class Dashboard', icon: BarChart },
                { id: 'resources', label: 'Online Resources', icon: Video }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center space-x-2 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tutors' && (
            <motion.div
              key="tutors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Find Expert Tutors</h2>
                    <p className="text-gray-600 mt-2">Connect with experienced volunteer tutors to start your braille journey</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddTutor(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={18} />
                      <span>Become a Tutor</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg mb-2">🎉 All Tutoring is FREE!</h3>
                    <p className="text-green-700 leading-relaxed">
                      Connect with volunteer tutors who are passionate about teaching braille. 
                      All sessions are provided at no cost to support braille literacy and ensure
                      equal access to quality education.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTutors.map((tutor, index) => (
                  <motion.div
                    key={tutor.id}
                    className="group bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-900 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedTutor(tutor)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <img
                            src={tutor.avatar}
                            alt={tutor.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-primary-100 group-hover:border-primary-200 transition-colors"
                          />
                          {tutor.verified && (
                            <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-green-100 rounded-full border-2 border-white flex items-center justify-center">
                              <Star className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">{tutor.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{tutor.location}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-sm font-medium text-yellow-700">{tutor.rating}</span>
                              <span className="text-sm text-yellow-600 ml-1">({tutor.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tutor.bio}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tutor.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium group-hover:bg-primary-100 transition-colors"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {tutor.responseTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            FREE
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'classes' && (
            <motion.div
              key="classes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Live Classes</h2>
                    <p className="text-gray-600 mt-2">Join interactive braille learning sessions with certified instructors</p>
                  </div>
                  <button
                    onClick={() => setShowCreateClass(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Create Class</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800 text-lg mb-2">📚 Free Live Classes</h3>
                    <p className="text-blue-700 leading-relaxed">
                      Join our volunteer tutors for interactive one-on-one or group sessions.
                      All classes are conducted by certified braille instructors who are passionate
                      about sharing their knowledge, completely free of charge.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClasses.map((classItem) => (
                  <motion.div
                    key={classItem.id}
                    className="bg-white rounded-2xl shadow-lg border-2 border-gray-900 p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedClass(classItem)}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{classItem.title}</h3>
                        <p className="text-sm text-gray-600">{classItem.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">FREE</div>
                        <div className="text-sm text-gray-500">{classItem.schedule.duration}min</div>
                      </div>
                    </div>
                    
                    <div className="aspect-video rounded-lg overflow-hidden mb-4 border-2 border-gray-900">
                      <img
                        src={classItem.imageUrl || '/braille-pattern.svg'}
                        alt={classItem.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.src !== '/braille-pattern.svg') {
                            img.src = '/braille-pattern.svg';
                          }
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-blue-600" />
                        <span>{classItem.schedule.days.join(', ')} at {classItem.schedule.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe size={16} className="mr-2 text-green-600" />
                        <a href={classItem.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                          Join Meeting
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-purple-600" />
                        <span>{classItem.enrolledStudents.length}/{classItem.maxStudents} students</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{classItem.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium capitalize">
                        {classItem.level}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {classItem.chapters.length} chapters
                      </span>
                      {classItem.isPublic ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Public
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                          Private
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Class Dashboard</h2>
                <p className="text-gray-600">
                  View analytics and progress for all your enrolled classes
                </p>
              </div>

              {classes.filter(cls => cls.enrolledStudents.includes(user?.id || '')).map(cls => (
                <div key={cls.id} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{cls.title}</h3>
                  <ClassDashboard 
                    classData={cls} 
                    onClose={() => {}}
                  />
                </div>
              ))}

              {!user && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your class dashboard</h3>
                  <p className="text-gray-600">You need to be signed in to see your enrolled classes and analytics.</p>
                </div>
              )}

              {user && classes.filter(cls => cls.enrolledStudents.includes(user.id)).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled classes yet</h3>
                  <p className="text-gray-600 mb-4">Browse our live classes and enroll to start learning!</p>
                  <button
                    onClick={() => setActiveTab('classes')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Browse Classes
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Online Learning Resources</h2>
                <p className="text-gray-600">
                  Access free educational videos, tutorials, and external resources to supplement your braille learning.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {onlineResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:scale-105"
                    whileHover={{ y: -3 }}
                  >
                    {/* Thumbnail/Preview */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback image if thumbnail fails to load
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=400&h=225';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        {resource.type === 'video' ? (
                          <Play className="w-12 h-12 text-white" />
                        ) : (
                          <ExternalLink className="w-12 h-12 text-white" />
                        )}
                      </div>
                      {resource.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                          {resource.duration}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                          resource.category === 'Beginner' ? 'bg-green-100 text-green-700' :
                          resource.category === 'Advanced' ? 'bg-red-100 text-red-700' :
                          resource.category === 'Specialized' ? 'bg-purple-100 text-purple-700' :
                          resource.category === 'Live' ? 'bg-red-100 text-red-700' :
                          resource.category === 'Technology' ? 'bg-blue-100 text-blue-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {resource.category}
                        </span>
                        {resource.duration && resource.duration !== 'Live' && (
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock size={14} className="mr-1" />
                            {resource.duration}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {resource.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {resource.description}
                      </p>
                      
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full justify-center"
                      >
                        {resource.type === 'video' ? (
                          <>
                            <Youtube size={16} className="mr-2" />
                            Watch Video
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} className="mr-2" />
                            Visit Resource
                          </>
                        )}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutor Detail Modal */}
        <AnimatePresence>
          {selectedTutor && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedTutor.avatar}
                      alt={selectedTutor.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedTutor.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span>{selectedTutor.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{selectedTutor.rating}</span>
                        <span className="text-gray-500 ml-1">({selectedTutor.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTutor(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">About</h4>
                    <p className="text-gray-600 mb-6">{selectedTutor.bio}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Specialties</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedTutor.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Languages</h5>
                        <p className="text-gray-600">{selectedTutor.languages.join(', ')}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Availability</h5>
                        <p className="text-gray-600">{selectedTutor.availability.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Teaching Resources</h4>
                    <div className="space-y-4">
                      {selectedTutor.resources.map((resource) => (
                        <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={resource.thumbnail}
                              alt={resource.title}
                              className="w-16 h-12 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?w=300';
                              }}
                            />
                            <div className="flex-1">
                              <h6 className="font-medium text-gray-900">{resource.title}</h6>
                              <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                                {resource.duration && (
                                  <span className="text-xs text-gray-500">{resource.duration}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <a
                    href={`mailto:${selectedTutor.email}?subject=Free Braille Tutoring Request&body=Hi ${selectedTutor.name}, I'd like to schedule a free braille learning session.`}
                    className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Schedule Free Session
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Class Detail Modal */}
        <AnimatePresence>
          {selectedClass && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-3xl my-8 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.title}</h3>
                    <p className="text-gray-600">{selectedClass.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {selectedClass.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-6">
                    <img
                      src={selectedClass.imageUrl}
                      alt={selectedClass.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={18} className="mr-3 text-blue-600" />
                      <span>{selectedClass.schedule.days.join(', ')} at {selectedClass.schedule.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock size={18} className="mr-3 text-green-600" />
                      <span>{selectedClass.schedule.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={18} className="mr-3 text-purple-600" />
                      <span>{selectedClass.enrolledStudents.length}/{selectedClass.maxStudents} students</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Globe size={18} className="mr-3 text-orange-600" />
                      <a href={selectedClass.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                        Join Meeting Link
                      </a>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Free Class</h4>
                    <p className="text-sm text-green-700">
                      This class is provided free of charge by volunteer instructors.
                    </p>
                  </div>
                </div>

                {selectedClass.chapters.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h4>
                    <div className="space-y-4">
                      {selectedClass.chapters.map((chapter, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{chapter.title}</h5>
                          <p className="text-sm text-gray-600 mb-4">{chapter.content}</p>
                          
                          {chapter.resources.length > 0 && (
                            <div className="space-y-2">
                              <h6 className="text-sm font-medium text-gray-700">Resources:</h6>
                              {chapter.resources.map((resource, rIndex) => (
                                <div key={rIndex} className="flex items-center text-sm text-gray-600">
                                  {resource.type === 'video' ? (
                                    <Video size={16} className="mr-2" />
                                  ) : resource.type === 'document' ? (
                                    <FileText size={16} className="mr-2" />
                                  ) : (
                                    <LinkIcon size={16} className="mr-2" />
                                  )}
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-600"
                                  >
                                    {resource.title}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      if (!user) {
                        toast({
                          title: "Error",
                          description: "Please sign in to enroll in a class",
                          variant: "destructive"
                        });
                        return;
                      }
                      try {
                        const { error } = await ClassService.enrollInClass(selectedClass.id, user.id);
                        if (error) throw error;
                        toast({
                          title: "Success",
                          description: "Successfully enrolled in class!",
                          variant: "default"
                        });
                        await loadClasses();
                        setSelectedClass(null);
                      } catch (error) {
                        console.error('Error enrolling in class:', error);
                        toast({
                          title: "Error",
                          description: "Failed to enroll in class",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enroll for Free
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Tutor Modal */}
        <AnimatePresence>
          {showAddTutor && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Become a Volunteer Tutor</h3>
                  <button
                    onClick={() => setShowAddTutor(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 Join our community of volunteer tutors! All tutoring is provided free of charge 
                    to support braille literacy worldwide.
                  </p>
                </div>
                
                <form onSubmit={handleAddTutor} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={tutorForm.name}
                        onChange={(e) => setTutorForm({...tutorForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={tutorForm.experience_years}
                        onChange={(e) => setTutorForm({...tutorForm, experience_years: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="5"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio & Teaching Philosophy
                    </label>
                    <textarea
                      value={tutorForm.bio}
                      onChange={(e) => setTutorForm({...tutorForm, bio: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={4}
                      placeholder="Tell us about your experience and approach to teaching braille..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={tutorForm.location}
                        onChange={(e) => setTutorForm({...tutorForm, location: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="City, State"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialties (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={tutorForm.specialties}
                        onChange={(e) => setTutorForm({...tutorForm, specialties: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Beginner Braille, Advanced Reading"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Languages (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={tutorForm.languages}
                        onChange={(e) => setTutorForm({...tutorForm, languages: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="English, Spanish, French"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability (comma-separated days)
                      </label>
                      <input
                        type="text"
                        value={tutorForm.availability}
                        onChange={(e) => setTutorForm({...tutorForm, availability: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Monday, Wednesday, Friday"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddTutor(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Join as Volunteer Tutor
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Class Statistics Modal */}
        <AnimatePresence>
          {selectedClass && showClassStats && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-4xl my-8 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Class Dashboard</h3>
                    <p className="text-gray-600">{selectedClass.title}</p>
                  </div>
                  <button
                    onClick={() => setShowClassStats(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <ClassDashboard 
                  classData={selectedClass} 
                  onClose={() => setShowClassStats(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Class Modal */}
        <AnimatePresence>
          {showCreateClass && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-4xl my-8 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Create New Class</h3>
                  <button
                    onClick={() => setShowCreateClass(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateClass} className="space-y-6">
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
                      onClick={() => setShowCreateClass(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 relative"
                      onClick={(e) => {
                        if (!classForm.title || !classForm.description || !classForm.category || classForm.schedule.days.length === 0 || !classForm.schedule.time || !classForm.meetingLink) {
                          e.preventDefault();
                          toast({
                            title: "Validation Error",
                            description: "Please fill in all required fields: Title, Description, Category, Schedule Days, Schedule Time, and Meeting Link",
                            variant: "destructive"
                          });
                          return;
                        }
                      }}
                    >
                      <Save size={16} />
                      <span>Create Class</span>
                      <span className="absolute right-2 opacity-75 text-sm">
                        {!classForm.title || !classForm.description || classForm.schedule.days.length === 0 || !classForm.schedule.time 
                          ? "(Fill required fields)" 
                          : ""
                        }
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassHubPage;