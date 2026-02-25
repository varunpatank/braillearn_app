
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
import AchievementsPage from './pages/AchievementsPage';
import { AppProvider } from './context/AppContext';
import { AudioProvider } from './context/AudioContext';
import { MockAuthProvider } from './context/MockAuthContext';
import './styles/global.css';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  // Quick mount log to help debug white-screen issues
  useEffect(() => {
    // mount diagnostics removed for production-like dev
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <MockAuthProvider>
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
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
          </Router>
        </AudioProvider>
      </AppProvider>
    </MockAuthProvider>
  );
}

export default App