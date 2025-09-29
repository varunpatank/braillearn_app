
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
import CreateProfile from './pages/auth/CreateProfile';
import NotFoundPage from './pages/NotFoundPage';
import { AppProvider } from './context/AppContext';
import { AudioProvider } from './context/AudioContext';
import { MockAuthProvider } from './context/MockAuthContext';
import './styles/global.css';

function App() {
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
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
              <Footer />
            </div>
          </Router>
        </AudioProvider>
      </AppProvider>
    </MockAuthProvider>
  );
}

export default App