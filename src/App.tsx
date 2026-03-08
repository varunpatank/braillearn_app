
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import LessonPage from './pages/lessons/LessonPage';
import PracticePage from './pages/PracticePage';
import SpeechToBraillePage from './pages/SpeechToBraillePage';
import HardwareSetupPage from './pages/HardwareSetupPage';
import ClassHubPage from './pages/ClassHubPage';
import BrailleQuestPage from './pages/BrailleQuestPage';
import CreateProfile from './pages/auth/CreateProfile';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import StatisticsPage from './pages/StatisticsPage';
import AccessibilityPage from './pages/AccessibilityPage';
import { AppProvider } from './context/AppContext';
import { AudioProvider } from './context/AudioContext';
import { createOrUpdateUser } from './services/userDataService';
import { useSupabase } from './hooks/useSupabase';
import { upsertProfile } from './services/dbService';
import './styles/global.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  const { user, isSignedIn } = useUser();
  const supabase = useSupabase();

  // Sync Clerk user to localStorage AND Supabase
  useEffect(() => {
    if (isSignedIn && user) {
      // localStorage fallback
      createOrUpdateUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || '',
        avatarUrl: user.imageUrl || '',
      });

      // Supabase profile sync
      upsertProfile(supabase, {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        display_name: user.fullName || user.firstName || null,
        avatar_url: user.imageUrl || null,
      });
    }
  }, [isSignedIn, user, supabase]);

  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <AppProvider>
      <AudioProvider>
        <Router>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen braille-bg">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/learn" element={<LearnPage />} />
                  <Route path="/learn/:lessonId" element={<LessonPage />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/speech-to-braille" element={<SpeechToBraillePage />} />
                  <Route path="/hardware-setup" element={<HardwareSetupPage />} />
                  <Route path="/class-hub" element={<ClassHubPage />} />
                  <Route path="/braillequest" element={<BrailleQuestPage />} />
                  <Route path="/create-profile" element={<CreateProfile />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                  <Route path="/accessibility" element={<AccessibilityPage />} />
                  <Route path="/achievements" element={<BrailleQuestPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <VoiceAssistant />
            </div>
          </ErrorBoundary>
        </Router>
      </AudioProvider>
    </AppProvider>
  );
}

export default App