import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from '@/components/motion';
import { ClassDashboard } from '@/components/ClassDashboard';
import {
  MapPin, Star, Users, BookOpen, Video,
  Plus, Calendar, Globe,
  Play, ExternalLink, Clock, Youtube, X, FileText,
  LinkIcon, Upload, Trash, Save, BarChart, TrendingUp,
  Activity, Target, Brain, ArrowUpRight, Eye, Flame,
  Phone, PhoneOff, VideoIcon, Monitor, Edit3
} from 'lucide-react';
import { showSuccessConfetti } from '@/utils/confetti';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/clerk-react';
import { ClassService } from '@/services/classService';
import { BrailleClass } from '@/types/classTypes';
import { useSupabase } from '@/hooks/useSupabase';
import { createCourse, enrollInCourse, unenrollFromCourse } from '@/services/dbService';

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

interface BrailleCenter {
  id: string;
  name: string;
  location: string;
  city: string;
  email: string;
  description: string;
  services: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  website?: string;
  phone?: string;
}



// Live meeting duration timer
const MeetingTimer: React.FC = () => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return <span className="text-gray-300 text-sm font-mono font-bold">{mm}:{ss}</span>;
};

const ClassHubPage: React.FC = () => {
  // Mock user database for displaying names
  const [mockUsers, setMockUsers] = useState({
    'user1': 'Alice Johnson',
    'user2': 'Bob Smith',
    'user3': 'Carol Williams',
    'user4': 'David Brown',
    'user5': 'Emma Davis',
    'user6': 'Frank Miller',
    'user7': 'Grace Wilson',
    'user8': 'Henry Taylor',
    'user9': 'Iris Anderson',
    'user10': 'Jack Thomas',
    'user11': 'Kate Jackson',
    'user12': 'Liam White',
    'user13': 'Maya Harris',
    'user14': 'Noah Martin',
    'user15': 'Olivia Thompson',
    'user16': 'Paul Garcia',
    'user17': 'Quinn Rodriguez',
    'user18': 'Ruby Lewis',
    'user19': 'Sam Lee',
    'user20': 'Tina Walker',
    'user21': 'Uma Hall',
    'user22': 'Victor Allen',
    'user23': 'Wendy Young',
    'user24': 'Xavier King',
    'user25': 'Yara Wright',
    'user26': 'Zoe Lopez',
    'user27': 'Alex Hill',
    'user28': 'Blair Scott',
    'user29': 'Casey Green',
    'user30': 'Drew Adams',
    'user31': 'Eden Baker',
    'user32': 'Felix Gonzalez',
    'user33': 'Gina Nelson',
    'user34': 'Hugo Carter',
    'user35': 'Ivy Mitchell'
  });

  const [activeTab, setActiveTab] = useState<'tutors' | 'classes' | 'dashboard' | 'resources'>('tutors');
  const [searchQuery] = useState('');
  const [_showAddTutor, setShowAddTutor] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedClass, setSelectedClass] = useState<BrailleClass | null>(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showClassStats, setShowClassStats] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showMeetingRoom, setShowMeetingRoom] = useState(false);
  const [meetingRoomId, setMeetingRoomId] = useState('');
  const [meetingClassName, setMeetingClassName] = useState('');



  const openMeetingRoom = (classTitle: string) => {
    const roomId = classTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-' + Date.now().toString(36);
    setMeetingRoomId(roomId);
    setMeetingClassName(classTitle);
    setShowMeetingRoom(true);
  };

  // ─── Braylin voice tab/action events ───
  useEffect(() => {
    const onTab = (e: Event) => {
      const { page, tab } = (e as CustomEvent).detail || {};
      if (page !== 'class-hub') return;
      if (tab === 'tutors' || tab === 'classes' || tab === 'dashboard' || tab === 'resources') {
        setActiveTab(tab);
      }
    };
    const onAction = (e: Event) => {
      const { action } = (e as CustomEvent).detail || {};
      if (action === 'create-class') {
        setShowCreateClass(true);
        setTimeout(() => window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Create class dialog opened. Fill in the details or say "close" to dismiss.' } })), 500);
      }
      if (action === 'view-stats') setShowClassStats(true);
      if (action === 'open-meeting') openMeetingRoom('Voice Meeting');
      if (action === 'add-resource') {
        setShowAddResource(true);
        setTimeout(() => window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Add resource dialog opened. Say "close" to dismiss.' } })), 500);
      }
    };
    const onDismiss = () => {
      if (showCreateClass) setShowCreateClass(false);
      if (showClassStats) setShowClassStats(false);
      if (showAddResource) setShowAddResource(false);
      if (showMeetingRoom) setShowMeetingRoom(false);
      if (selectedTutor) setSelectedTutor(null);
      if (selectedClass) setSelectedClass(null);
    };
    const onConfirm = () => {
      // Submit whichever form is open
      if (showCreateClass) {
        const form = document.querySelector('form[data-braylin="create-class"]') as HTMLFormElement;
        if (form) form.requestSubmit();
        else window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Please fill in the class details first.' } }));
      } else if (showAddResource) {
        const form = document.querySelector('form[data-braylin="add-resource"]') as HTMLFormElement;
        if (form) form.requestSubmit();
        else window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Please fill in the resource details first.' } }));
      } else if (showClassStats) {
        setShowClassStats(false);
      }
    };
    window.addEventListener('braylin-tab', onTab);
    window.addEventListener('braylin-class-action', onAction);
    window.addEventListener('braylin-dismiss', onDismiss);
    window.addEventListener('braylin-confirm', onConfirm);
    return () => {
      window.removeEventListener('braylin-tab', onTab);
      window.removeEventListener('braylin-class-action', onAction);
      window.removeEventListener('braylin-dismiss', onDismiss);
      window.removeEventListener('braylin-confirm', onConfirm);
    };
  }, [showCreateClass, showClassStats, showAddResource, showMeetingRoom, selectedTutor, selectedClass]);

  // ─── Narrate tab switches on ClassHub ───
  useEffect(() => {
    const labels: Record<string, string> = {
      tutors: 'Tutors. Browse available tutors. Say a tutor name to view details.',
      classes: 'Classes. View and join available classes. Say "create class" to start one.',
      dashboard: 'Dashboard. View your class stats and activity. Say "view stats" for details.',
      resources: 'Resources. Browse learning resources. Say "add resource" to upload one.'
    };
    window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Class Hub: ${labels[activeTab] || activeTab}` } }));
  }, [activeTab]);

  // ─── Narrate modals ───
  useEffect(() => {
    if (showMeetingRoom) {
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Meeting room opened for ${meetingClassName}. Say "close" to leave the meeting.` } }));
    }
  }, [showMeetingRoom, meetingClassName]);

  useEffect(() => {
    if (showClassStats) {
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Class statistics are now showing. Say "close" to dismiss.' } }));
    }
  }, [showClassStats]);

  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'video' as 'video' | 'link',
    duration: '',
    description: '',
    url: '',
    thumbnail: '',
    category: 'Beginner'
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

  const [tutors] = useState<Tutor[]>([
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

  const [centers] = useState<BrailleCenter[]>([
    {
      id: '1',
      name: 'Seattle Braille Institute',
      location: '1234 Pine Street, Seattle, WA 98101',
      city: 'Seattle',
      email: 'info@seattlebraille.org',
      description: 'Premier braille education center offering comprehensive courses for all skill levels including literary braille, music notation, and advanced mathematics.',
      services: ['Literary Braille', 'Music Notation', 'Math Braille', 'Technology Training'],
      coordinates: { lat: 47.6062, lng: -122.3321 }
    },
    {
      id: '2',
      name: 'Spokane Vision Center',
      location: '567 Riverside Ave, Spokane, WA 99201',
      city: 'Spokane',
      email: 'contact@spokanevision.org',
      description: 'Eastern Washington\'s leading center for braille literacy and assistive technology with specialized programs for adults and children.',
      services: ['Adult Programs', 'Children Classes', 'Assistive Technology', 'Community Outreach'],
      coordinates: { lat: 47.6587, lng: -117.4260 }
    },
    {
      id: '3',
      name: 'Tacoma Learning Hub',
      location: '890 Pacific Ave, Tacoma, WA 98402',
      city: 'Tacoma',
      email: 'hello@tacomalearn.org',
      description: 'Community-focused braille learning center with specialized programs for families and workplace integration training.',
      services: ['Family Programs', 'Workplace Training', 'Community Classes', 'Resource Library'],
      coordinates: { lat: 47.2529, lng: -122.4443 }
    },
    {
      id: '4',
      name: 'Olympia Accessibility Center',
      location: '321 Capitol Way, Olympia, WA 98501',
      city: 'Olympia',
      email: 'support@olympiaaccessibility.org',
      description: 'State capital\'s premier center for braille education and accessibility training with government document specialization.',
      services: ['Government Documents', 'Legal Braille', 'Accessibility Training', 'Policy Resources'],
      coordinates: { lat: 47.0379, lng: -122.9015 }
    },
    {
      id: '5',
      name: 'Bellingham Braille Academy',
      location: '456 Holly Street, Bellingham, WA 98225',
      city: 'Bellingham',
      email: 'info@bellinghambraille.org',
      description: 'Northern Washington center specializing in advanced braille techniques, music notation, and cross-border accessibility programs.',
      services: ['Advanced Techniques', 'Music Braille', 'Cross-Border Programs', 'Teacher Training'],
      coordinates: { lat: 48.7519, lng: -122.4787 }
    },
    {
      id: '6',
      name: 'Vancouver Learning Center',
      location: '789 Main Street, Vancouver, WA 98660',
      city: 'Vancouver',
      email: 'contact@vancouverlearn.org',
      description: 'Southwest Washington\'s hub for braille education and technology integration with Portland metro area partnerships.',
      services: ['Technology Integration', 'Metro Partnerships', 'Adult Education', 'Career Services'],
      coordinates: { lat: 45.6387, lng: -122.6615 }
    },
    {
      id: '7',
      name: 'Yakima Valley Braille Center',
      location: '123 Yakima Ave, Yakima, WA 98901',
      city: 'Yakima',
      email: 'info@yakimabraille.org',
      description: 'Central Washington center serving agricultural communities with bilingual braille programs and rural outreach services.',
      services: ['Bilingual Programs', 'Rural Outreach', 'Agricultural Focus', 'Mobile Services'],
      coordinates: { lat: 46.6021, lng: -120.5059 }
    },
    {
      id: '8',
      name: 'Wenatchee Learning Institute',
      location: '456 Wenatchee Ave, Wenatchee, WA 98801',
      city: 'Wenatchee',
      email: 'contact@wenatcheelearn.org',
      description: 'North-central Washington facility focusing on outdoor education accessibility and recreational braille programs.',
      services: ['Outdoor Education', 'Recreational Programs', 'Nature Braille', 'Adventure Learning'],
      coordinates: { lat: 47.4235, lng: -120.3103 }
    },
    {
      id: '9',
      name: 'Tri-Cities Braille Network',
      location: '789 Columbia Center Blvd, Kennewick, WA 99336',
      city: 'Tri-Cities',
      email: 'support@tricitybraille.org',
      description: 'Southeastern Washington regional center serving Richland, Pasco, and Kennewick with STEM-focused braille education.',
      services: ['STEM Education', 'Regional Network', 'Science Braille', 'Engineering Programs'],
      coordinates: { lat: 46.2112, lng: -119.1372 }
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
      creatorId: 'tutor1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['literacy', 'beginner']
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
      creatorId: 'tutor2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['math', 'advanced']
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
      creatorId: 'tutor3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['music', 'intermediate']
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
      creatorId: 'tutor4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['programming', 'advanced']
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
      creatorId: 'tutor5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['science', 'intermediate']
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
      creatorId: 'tutor6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['language', 'intermediate']
    },
    {
      id: '7',
      title: 'Braille Technology Workshop',
      description: 'Learn to use modern braille displays, screen readers, and assistive technology.',
      imageUrl: 'https://images.pexels.com/photos/356043/pexels-photo-356043.jpeg?w=400',
      meetingLink: 'https://meet.google.com/tech-braille',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '14:00',
        duration: 90
      },
      level: 'intermediate',
      category: 'Technology',
      maxStudents: 12,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Screen Reader Basics',
          content: 'Introduction to NVDA, JAWS, and VoiceOver',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user19', 'user20'],
      creatorId: 'tutor7',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['technology', 'intermediate']
    },
    {
      id: '8',
      title: 'Braille Music Notation',
      description: 'Master the art of reading and writing music in braille notation.',
      imageUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?w=400',
      meetingLink: 'https://meet.google.com/music-braille',
      schedule: {
        days: ['Saturday'],
        time: '10:00',
        duration: 120
      },
      level: 'advanced',
      category: 'Music Braille',
      maxStudents: 8,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Musical Symbols',
          content: 'Basic musical notation in braille',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user21', 'user22', 'user23'],
      creatorId: 'tutor8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['music', 'advanced']
    },
    {
      id: '9',
      title: 'Business Braille Communications',
      description: 'Professional braille writing for workplace and business communications.',
      imageUrl: 'https://images.pexels.com/photos/3182774/pexels-photo-3182774.jpeg?w=400',
      meetingLink: 'https://meet.google.com/business-braille',
      schedule: {
        days: ['Monday', 'Friday'],
        time: '18:00',
        duration: 75
      },
      level: 'intermediate',
      category: 'Professional',
      maxStudents: 20,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Professional Formatting',
          content: 'Business letter and document formatting in braille',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user24', 'user25', 'user26', 'user27'],
      creatorId: 'tutor9',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['business', 'intermediate']
    },
    {
      id: '10',
      title: 'Braille for Parents and Families',
      description: 'Supporting families in learning braille to assist visually impaired family members.',
      imageUrl: 'https://images.pexels.com/photos/3808864/pexels-photo-3808864.jpeg?w=400',
      meetingLink: 'https://meet.google.com/family-braille',
      schedule: {
        days: ['Sunday'],
        time: '15:00',
        duration: 90
      },
      level: 'beginner',
      category: 'Family Support',
      maxStudents: 15,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Supporting Your Child',
          content: 'How to help your child learn braille effectively',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user28', 'user29', 'user30'],
      creatorId: 'tutor10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['family', 'beginner']
    },
    {
      id: '11',
      title: 'Creative Writing in Braille',
      description: 'Express your creativity through poetry and storytelling in braille.',
      imageUrl: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?w=400',
      meetingLink: 'https://meet.google.com/creative-braille',
      schedule: {
        days: ['Wednesday'],
        time: '19:00',
        duration: 60
      },
      level: 'intermediate',
      category: 'Creative Writing',
      maxStudents: 12,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Poetry in Braille',
          content: 'Techniques for writing and formatting poetry',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user31', 'user32'],
      creatorId: 'tutor11',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['creative', 'intermediate']
    },
    {
      id: '12',
      title: 'Medical Terminology Braille',
      description: 'Learn medical and healthcare terminology in braille for professional use.',
      imageUrl: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?w=400',
      meetingLink: 'https://meet.google.com/medical-braille',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '16:00',
        duration: 90
      },
      level: 'advanced',
      category: 'Medical',
      maxStudents: 10,
      isPublic: true,
      chapters: [
        {
          id: 'ch1',
          title: 'Medical Abbreviations',
          content: 'Common medical abbreviations and terminology',
          order: 1,
          resources: []
        }
      ],
      enrolledStudents: ['user33', 'user34', 'user35'],
      creatorId: 'tutor12',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['medical', 'advanced']
    }
  ]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user: clerkUser } = useUser();
  const supabase = useSupabase();
  const user = clerkUser ? { id: clerkUser.id, username: clerkUser.firstName || clerkUser.fullName || 'User', email: clerkUser.emailAddresses?.[0]?.emailAddress || '' } : null;

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
  const [onlineResources, setOnlineResources] = useState([
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
  ]);
  
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();

    const newResource = {
      id: Date.now().toString(),
      title: resourceForm.title,
      type: resourceForm.type as string,
      duration: resourceForm.duration || '',
      description: resourceForm.description,
      url: resourceForm.url,
      embedUrl: resourceForm.type === 'video' ? resourceForm.url.replace('watch?v=', 'embed/') : '',
      thumbnail: resourceForm.thumbnail || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=400&h=225',
      category: resourceForm.category
    };

    setOnlineResources(prev => [newResource, ...prev]);

    toast({
      title: "Success! 🎉",
      description: "Your resource has been added successfully.",
      variant: "default",
    });

    // Reset form
    setResourceForm({
      title: '',
      type: 'video',
      duration: '',
      description: '',
      url: '',
      thumbnail: '',
      category: 'Beginner'
    });

    setShowAddResource(false);
  };

  const [_loading, setLoading] = useState(false);
  
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
        tags: [],
        creatorId: user?.id || 'anonymous',
        creatorName: user?.username || 'Anonymous'
      };

      console.log('Sending class data to service:', classData);
      
      // Persist to Supabase
      if (supabase) {
        createCourse(supabase, {
          creator_id: user?.id || 'anonymous',
          title: classData.title,
          description: classData.description || null,
          image_url: classData.imageUrl || null,
          level: (classData.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
          category: classData.category || null,
          is_public: true,
          max_students: classData.maxStudents || 30,
          tags: [],
          curriculum: classData.chapters || [],
          meeting_link: classData.meetingLink || null,
          schedule: classData.schedule ? { raw: classData.schedule } : null,
        }).catch(err => console.error('[db] createCourse background error:', err));
      }

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header is handled by App.tsx */}

      {/* Hero Banner — Deep indigo/blue matching mission banner, unique Class Hub style */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 text-white py-12 overflow-hidden">
        {/* Honeycomb/hex pattern background */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%"><defs><pattern id="hexagons" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.7)"><polygon points="24.8,22 37.6,29.4 37.6,44.2 24.8,51.6 12,44.2 12,29.4" fill="none" stroke="white" strokeWidth="1.5"/><polygon points="24.8,51.6 37.6,59 37.6,73.8 24.8,81.2 12,73.8 12,59" fill="none" stroke="white" strokeWidth="1.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#hexagons)"/></svg>
        </div>
        {/* Floating animated orbs */}
        <motion.div className="absolute top-8 right-16 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], x: [0, 25, 0] }} transition={{ duration: 7, repeat: Infinity }} />
        <motion.div className="absolute -bottom-16 left-8 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }} transition={{ duration: 9, repeat: Infinity, delay: 1 }} />
        <motion.div className="absolute top-4 left-1/3 w-40 h-40 bg-cyan-300/10 rounded-full blur-2xl" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full mb-3 border border-white/20"
              >
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>🤝</motion.span>
                <span className="text-sm font-medium">Community Learning Hub</span>
              </motion.span>
              
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-1 flex items-center gap-3">
                <motion.span className="inline-block" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>🎓</motion.span>
                Class Hub
              </h1>
              <p className="text-blue-200 text-base max-w-lg">
                Connect with volunteer tutors, join live classes, and find braille learning centers near you
              </p>
            </motion.div>
            
            {/* Stats — pill-shaped with colored left accent */}
            <motion.div className="flex flex-wrap gap-2.5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {[
                { value: tutors.length, label: 'Tutors', icon: Users, accent: 'bg-green-400' },
                { value: classes.length, label: 'Classes', icon: BookOpen, accent: 'bg-yellow-400' },
                { value: centers.length, label: 'Centers', icon: MapPin, accent: 'bg-purple-400' },
                { value: '4.9', label: 'Rating', icon: Star, accent: 'bg-amber-400' },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md rounded-2xl pl-1 pr-4 py-1.5 border border-white/20"
                  initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200 }}
                >
                  <div className={`w-9 h-9 rounded-xl ${stat.accent} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold leading-none">{stat.value}</div>
                    <div className="text-[10px] text-blue-200 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        {/* Wave divider at bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-8">
            <path d="M0,20 C200,60 400,0 600,25 C800,50 1000,5 1200,30 L1200,60 L0,60 Z" fill="#eff6ff" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 p-1.5 flex gap-1">
          {[
            { id: 'tutors', label: 'Find Tutors', icon: Users },
            { id: 'classes', label: 'Live Classes', icon: BookOpen },
            { id: 'dashboard', label: 'Analytics', icon: BarChart },
            { id: 'resources', label: 'Resources', icon: Video }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-indigo-800 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'tutors' && (
            <motion.div
              key="tutors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Tutor Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Tutors', value: tutors.length, icon: '🎓', color: 'from-blue-500 to-blue-600' },
                  { label: 'Avg Rating', value: `${(tutors.reduce((a, t) => a + t.rating, 0) / tutors.length).toFixed(1)}⭐`, icon: '⭐', color: 'from-yellow-500 to-amber-500' },
                  { label: 'Total Reviews', value: tutors.reduce((a, t) => a + t.reviewCount, 0), icon: '💬', color: 'from-green-500 to-emerald-600' },
                  { label: 'Specialties', value: new Set(tutors.flatMap(t => t.specialties)).size, icon: '📚', color: 'from-purple-500 to-purple-600' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 relative overflow-hidden"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03, y: -3 }}>
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-xs font-medium text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Find Expert Tutors</h2>
                    <p className="text-gray-600 mt-1">Connect with experienced volunteer tutors to start your braille journey</p>
                  </div>
                  <button
                    onClick={() => setShowAddTutor(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg font-bold whitespace-nowrap"
                  >
                    <Plus size={18} />
                    Become a Tutor
                  </button>
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
                    className="group bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedTutor(tutor)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <img
                            src={tutor.avatar}
                            alt={tutor.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 group-hover:border-blue-200 transition-colors"
                          />
                          {tutor.verified && (
                            <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-green-100 rounded-full border-2 border-white flex items-center justify-center">
                              <Star className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{tutor.name}</h3>
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
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium group-hover:bg-blue-100 transition-colors"
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
              {/* Class Analytics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Classes', value: classes.length, icon: '📚', color: 'from-blue-500 to-blue-600', sub: `${classes.filter(c => c.isPublic).length} public` },
                  { label: 'Total Students', value: classes.reduce((acc, cls) => acc + cls.enrolledStudents.length, 0), icon: '👥', color: 'from-green-500 to-emerald-600', sub: 'enrolled' },
                  { label: 'Avg Class Size', value: classes.length > 0 ? Math.round(classes.reduce((acc, cls) => acc + cls.enrolledStudents.length, 0) / classes.length) : 0, icon: '📊', color: 'from-orange-500 to-amber-600', sub: 'students/class' },
                  { label: 'Categories', value: new Set(classes.map(c => c.category)).size, icon: '🏷️', color: 'from-purple-500 to-purple-600', sub: 'unique topics' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 relative overflow-hidden"
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03, y: -3 }}>
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-xs font-medium text-gray-500">{stat.label}</div>
                    <div className="text-[10px] text-gray-400">{stat.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Level Distribution Mini Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 mb-6">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-gray-700">Level Split:</span>
                  {['beginner', 'intermediate', 'advanced'].map((level) => {
                    const count = classes.filter(c => c.level === level).length;
                    const pct = classes.length > 0 ? Math.round((count / classes.length) * 100) : 0;
                    const colors: Record<string, string> = { beginner: 'bg-green-500', intermediate: 'bg-blue-500', advanced: 'bg-purple-500' };
                    return (
                      <div key={level} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[level]}`} />
                        <span className="text-xs text-gray-600 capitalize">{level}: <span className="font-bold">{pct}%</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Live Classes</h2>
                    <p className="text-gray-600 mt-1">Join interactive braille learning sessions with certified instructors</p>
                  </div>
                  <button
                    onClick={() => setShowCreateClass(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg font-bold whitespace-nowrap"
                  >
                    <Plus size={18} />
                    Create Class
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
                    className="bg-white rounded-3xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
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
                    
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 border-2 border-blue-100">
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
                        <button 
                          onClick={(e) => { e.stopPropagation(); openMeetingRoom(classItem.title); }}
                          className="hover:text-blue-600 font-medium text-blue-600 flex items-center gap-1"
                        >
                          <Phone size={14} /> Join Meeting Room
                        </button>
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
              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Retention Rate', value: '94%', icon: '🔄', color: 'from-teal-500 to-teal-600', change: '+2.3% vs last month' },
                  { label: 'Completion Rate', value: '87%', icon: '✅', color: 'from-indigo-500 to-indigo-600', change: 'Above average' },
                  { label: 'Avg Session', value: '47m', icon: '⏱️', color: 'from-pink-500 to-rose-600', change: '+5min this week' },
                  { label: 'Growth Rate', value: '+23%', icon: '🚀', color: 'from-cyan-500 to-cyan-600', change: 'MoM increase' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white rounded-2xl shadow-lg border border-orange-100 p-5 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">{stat.change}</div>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Engagement + Student Growth Side by Side */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Weekly Engagement */}
                <motion.div
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Weekly Engagement
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" /> +18%
                    </span>
                  </div>
                  <div className="flex items-end gap-2 h-36">
                    {[
                      { day: 'Mon', value: 65, sessions: 12 },
                      { day: 'Tue', value: 82, sessions: 18 },
                      { day: 'Wed', value: 45, sessions: 8 },
                      { day: 'Thu', value: 90, sessions: 22 },
                      { day: 'Fri', value: 72, sessions: 15 },
                      { day: 'Sat', value: 95, sessions: 24 },
                      { day: 'Sun', value: 58, sessions: 10 },
                    ].map((item, i) => (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs font-bold text-gray-600">{item.sessions}</div>
                        <motion.div
                          className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-400 relative group cursor-pointer"
                          style={{ height: `${item.value}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${item.value}%` }}
                          transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                          whileHover={{ scale: 1.08 }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.sessions} sessions
                          </div>
                        </motion.div>
                        <div className="text-xs font-medium text-gray-400">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Student Growth */}
                <motion.div
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Student Growth (6mo)
                    </h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> +156%
                    </span>
                  </div>
                  <div className="flex items-end gap-3 h-36">
                    {[
                      { month: 'Jul', value: 25, students: 12 },
                      { month: 'Aug', value: 38, students: 19 },
                      { month: 'Sep', value: 55, students: 28 },
                      { month: 'Oct', value: 68, students: 35 },
                      { month: 'Nov', value: 82, students: 42 },
                      { month: 'Dec', value: 100, students: 51 },
                    ].map((item, i) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs font-bold text-gray-600">{item.students}</div>
                        <motion.div
                          className="w-full rounded-lg bg-gradient-to-t from-green-600 to-emerald-400 relative group cursor-pointer"
                          initial={{ height: 0 }}
                          animate={{ height: `${item.value}%` }}
                          transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
                          whileHover={{ scale: 1.08 }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.students} new
                          </div>
                        </motion.div>
                        <div className="text-xs font-medium text-gray-400">{item.month}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Circular Gauges Row */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Student Retention', value: 94, color: '#14b8a6', icon: Eye, iconColor: 'text-teal-600', change: '+2.3% from last month' },
                  { label: 'Course Completion', value: 87, color: '#6366f1', icon: Target, iconColor: 'text-indigo-600', change: '+5.1% from last month' },
                  { label: 'Engagement Score', value: 91, color: '#f97316', icon: Flame, iconColor: 'text-orange-600', change: 'Top 10% globally' },
                ].map((gauge, i) => (
                  <motion.div
                    key={gauge.label}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex items-center gap-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <motion.circle
                          cx="60" cy="60" r="52" fill="none" stroke={gauge.color} strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${(gauge.value / 100) * 327} ${327}`}
                          initial={{ strokeDasharray: '0 327' }}
                          animate={{ strokeDasharray: `${(gauge.value / 100) * 327} ${327}` }}
                          transition={{ duration: 1.2, delay: 0.7 + i * 0.1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-extrabold text-gray-900">{gauge.value}{gauge.value < 100 ? '%' : ''}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-600 flex items-center gap-1.5 mb-1">
                        <gauge.icon className={`w-4 h-4 ${gauge.iconColor}`} />
                        {gauge.label}
                      </h4>
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {gauge.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Insights */}
              <motion.div
                className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Performance Insights
                    </h3>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      Updated just now
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { title: '🎯 Recommendation', text: 'Schedule more beginner classes on weekends — Saturday shows 40% higher engagement from new students.' },
                      { title: '📈 Growth Opportunity', text: 'Music Braille has the highest completion rate (96%). Consider expanding this category with advanced courses.' },
                      { title: '⚡ Quick Win', text: '3 tutors have availability gaps on Thursdays. Matching them with waitlisted students could add 15 enrollments.' },
                      { title: '🏆 Achievement', text: 'Student retention improved 12% after implementing progress tracking. Keep monitoring the "Introduction to Literary Braille" class.' },
                    ].map((insight, i) => (
                      <motion.div
                        key={i}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.08 }}
                      >
                        <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-blue-100 leading-relaxed">{insight.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <motion.button
                  onClick={() => setShowCreateClass(true)}
                  className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg flex items-center gap-4 hover:from-blue-700 hover:to-blue-800 transition-all"
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Create New Class</div>
                    <div className="text-xs text-blue-200">Set up a new learning session</div>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setShowAddTutor(true)}
                  className="p-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl shadow-lg flex items-center gap-4 hover:from-green-700 hover:to-emerald-800 transition-all"
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Become a Tutor</div>
                    <div className="text-xs text-green-200">Volunteer to teach braille</div>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setShowAddResource(true)}
                  className="p-5 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl shadow-lg flex items-center gap-4 hover:from-purple-700 hover:to-purple-800 transition-all"
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Add Resource</div>
                    <div className="text-xs text-purple-200">Share learning materials</div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Resource Analytics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Resources', value: onlineResources.length, icon: '📦', color: 'from-indigo-500 to-indigo-600', sub: 'Videos & articles' },
                  { label: 'Video Tutorials', value: onlineResources.filter(r => r.type === 'video').length, icon: '🎬', color: 'from-red-500 to-rose-600', sub: 'Watch & learn' },
                  { label: 'Categories', value: new Set(onlineResources.map(r => r.category)).size, icon: '🏷️', color: 'from-purple-500 to-purple-600', sub: 'Topic areas' },
                  { label: 'Avg Duration', value: (() => { const durations = onlineResources.filter(r => r.duration && r.duration !== 'Live').map(r => parseInt(r.duration || '0')); return durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) + 'm' : 'N/A'; })(), icon: '⏱️', color: 'from-cyan-500 to-cyan-600', sub: 'Per resource' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-4 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-xs font-medium text-gray-600">{stat.label}</div>
                    <div className="text-xs text-indigo-500 mt-0.5">{stat.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Header */}
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-600" />
                    Learning Resources
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Free videos, tutorials, and articles to supplement your braille learning journey.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddResource(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2 font-bold text-sm whitespace-nowrap"
                >
                  <Plus size={16} />
                  Add Resource
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['All', ...Array.from(new Set(onlineResources.map(r => r.category)))].map((cat) => (
                  <button
                    key={cat}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      cat === 'All' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {onlineResources.map((resource, i) => (
                  <motion.div
                    key={resource.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                    whileHover={{ y: -4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=400&h=225';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                          {resource.type === 'video' ? (
                            <Play className="w-7 h-7 text-indigo-600 ml-1" />
                          ) : (
                            <ExternalLink className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                      </div>
                      {resource.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm">
                          {resource.duration}
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold backdrop-blur-sm ${
                          resource.category === 'Beginner' ? 'bg-green-500/90 text-white' :
                          resource.category === 'Advanced' ? 'bg-red-500/90 text-white' :
                          resource.category === 'Specialized' ? 'bg-purple-500/90 text-white' :
                          resource.category === 'Live' ? 'bg-red-500/90 text-white' :
                          resource.category === 'Technology' ? 'bg-blue-500/90 text-white' :
                          'bg-blue-500/90 text-white'
                        }`}>
                          {resource.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug">
                        {resource.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all text-sm font-bold shadow-md hover:shadow-lg"
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
                className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-blue-100 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedTutor.avatar}
                      alt={selectedTutor.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
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
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
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
                className="bg-white rounded-3xl p-6 w-full max-w-3xl my-8 relative border-2 border-blue-100 shadow-2xl"
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
                      <a href={selectedClass.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
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
                                    className="hover:text-blue-600"
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
                  {user && selectedClass.enrolledStudents.includes(user.id) ? (
                    <button
                      onClick={async () => {
                        try {
                          // Unenroll user - remove from enrolled students
                          if (supabase && user) {
                            unenrollFromCourse(supabase, selectedClass.id, user.id).catch(err => console.error('[db] unenroll error:', err));
                          }
                          setClasses(prevClasses => 
                            prevClasses.map(cls => 
                              cls.id === selectedClass.id 
                                ? { ...cls, enrolledStudents: cls.enrolledStudents.filter(id => id !== user.id) }
                                : cls
                            )
                          );
                          
                          toast({
                            title: "Unenrolled",
                            description: `You have been unenrolled from ${selectedClass.title}`,
                            variant: "default"
                          });
                          setSelectedClass(null);
                        } catch (error) {
                          console.error('Error unenrolling from class:', error);
                          toast({
                            title: "Error",
                            description: "Failed to unenroll from class",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Unenroll
                    </button>
                  ) : (
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
                          // Persist enrollment to Supabase
                          if (supabase) {
                            enrollInCourse(supabase, selectedClass.id, user.id).catch(err => console.error('[db] enroll error:', err));
                          }

                          // Add current user to mockUsers if not already there
                          setMockUsers(prevUsers => ({
                            ...prevUsers,
                            [user.id]: user.username
                          }));
                          
                          // Simple local enrollment - update the classes state
                          setClasses(prevClasses => 
                            prevClasses.map(cls => 
                              cls.id === selectedClass.id 
                                ? { ...cls, enrolledStudents: [...cls.enrolledStudents, user.id] }
                                : cls
                            )
                          );
                          
                          toast({
                            title: "Success! 🎉",
                            description: `Welcome to ${selectedClass.title}, ${user.username}!`,
                            variant: "default"
                          });
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
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ MEETING ROOM MODAL — Enhanced Call Interface ═══ */}
        <AnimatePresence>
          {showMeetingRoom && (
            <motion.div className="fixed inset-0 bg-black/95 z-50 flex flex-col"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Meeting Header */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-3 flex items-center justify-between border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <VideoIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{meetingClassName}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-xs font-mono">Room: {meetingRoomId.slice(0, 20)}...</p>
                      <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const url = `${window.location.origin}/classhub?meeting=${meetingRoomId}`;
                    navigator.clipboard.writeText(url);
                    toast({ title: 'Invite Link Copied! 🔗', description: 'Share this link so others can join.' });
                  }}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
                    <LinkIcon className="w-3.5 h-3.5" /> Invite
                  </button>
                  <button onClick={() => setShowMeetingRoom(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-all text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Meeting Content — Jitsi + Sidebar */}
              <div className="flex-1 flex">
                {/* Jitsi Video */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-3">
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                      <iframe
                        src={`https://meet.jit.si/BrailleLearn-${meetingRoomId}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false&config.disableDeepLinking=true&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","desktop","fullscreen","hangup","chat","raisehand","tileview","settings","participants-pane","toggle-camera","whiteboard","shareaudio"]&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.DEFAULT_BACKGROUND="#0f0f1a"&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=false&interfaceConfig.MOBILE_APP_PROMO=false`}
                        className="w-full h-full"
                        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                        style={{ border: 'none', minHeight: '500px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Participant Sidebar */}
                <div className="hidden lg:flex flex-col w-72 bg-gray-900 border-l border-gray-700/50">
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" /> In This Room
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* Current user */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.username?.[0] || 'Y'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{user?.username || 'You'} (You)</p>
                        <p className="text-green-400 text-[10px] font-medium">Connected</p>
                      </div>
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    {/* Mock participants */}
                    {[
                      { name: 'Sarah M.', initial: 'S', status: 'Speaking' },
                      { name: 'James K.', initial: 'J', status: 'Connected' },
                      { name: 'Maria L.', initial: 'M', status: 'Screen sharing' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs font-bold">
                          {p.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.name}</p>
                          <p className={`text-[10px] font-medium ${p.status === 'Speaking' ? 'text-yellow-400' : p.status === 'Screen sharing' ? 'text-purple-400' : 'text-green-400'}`}>
                            {p.status}
                          </p>
                        </div>
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>
                    ))}
                  </div>
                  {/* Quick Actions */}
                  <div className="p-3 border-t border-gray-700/50 space-y-2">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider px-1">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex flex-col items-center gap-1 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors">
                        <Monitor className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] text-gray-300 font-medium">Share Screen</span>
                      </button>
                      <button className="flex flex-col items-center gap-1 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors">
                        <Edit3 className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] text-gray-300 font-medium">Whiteboard</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <MeetingTimer />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm font-bold">4 participants</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                    const url = `${window.location.origin}/classhub?meeting=${meetingRoomId}`;
                    navigator.clipboard.writeText(url);
                    toast({ title: 'Link Copied!', description: 'Share this link so others can join the class.' });
                  }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
                    <LinkIcon className="w-4 h-4" /> Copy Invite Link
                  </button>
                  <button onClick={() => setShowMeetingRoom(false)}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all">
                    <PhoneOff className="w-4 h-4" /> Leave Meeting
                  </button>
                </div>
              </div>
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
                className="bg-white rounded-3xl p-6 w-full max-w-4xl my-8 relative border-2 border-blue-100 shadow-2xl"
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
                  mockUsers={mockUsers}
                  currentUserId={user?.id}
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
                className="bg-white rounded-3xl p-6 w-full max-w-4xl my-8 relative border-2 border-blue-100 shadow-2xl"
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
                
                <form data-braylin="create-class" onSubmit={handleCreateClass} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Title
                      </label>
                      <input
                        type="text"
                        value={classForm.title}
                        onChange={(e) => setClassForm({...classForm, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                ? 'bg-blue-100 text-blue-700'
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
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
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
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
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
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
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
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="rounded text-blue-600 focus:ring-blue-500"
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
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 relative"
                      onClick={(e) => {
                        if (!classForm.title || !classForm.description || !classForm.category || classForm.schedule.days.length === 0 || !classForm.schedule.time || !classForm.meetingLink) {
                          e.preventDefault();
                          toast({
                            title: "Validation Error",
                            description: "Please fill in all required fields: Title, Description, Category, Schedule Days, and Schedule Time",
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

        {/* Add Resource Modal */}
        <AnimatePresence>
          {showAddResource && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-6 w-full max-w-2xl my-8 relative border-2 border-blue-100 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Add Learning Resource</h3>
                  <button
                    onClick={() => setShowAddResource(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <form data-braylin="add-resource" onSubmit={handleAddResource} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Title
                    </label>
                    <input
                      type="text"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter resource title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Type
                      </label>
                      <select
                        value={resourceForm.type}
                        onChange={(e) => setResourceForm({...resourceForm, type: e.target.value as 'video' | 'link'})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="video">Video</option>
                        <option value="link">Link/Website</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={resourceForm.category}
                        onChange={(e) => setResourceForm({...resourceForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Specialized">Specialized</option>
                        <option value="Technology">Technology</option>
                        <option value="Resources">Resources</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={resourceForm.url}
                      onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/resource"
                      required
                    />
                  </div>

                  {resourceForm.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (optional)
                      </label>
                      <input
                        type="text"
                        value={resourceForm.duration}
                        onChange={(e) => setResourceForm({...resourceForm, duration: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 15:30"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Brief description of the resource"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={resourceForm.thumbnail}
                      onChange={(e) => setResourceForm({...resourceForm, thumbnail: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      If left empty, a default image will be used.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddResource(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-2 border-gray-900 shadow-md"
                    >
                      Add Resource
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