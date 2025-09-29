import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings, BookOpen, Mic, Home, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useMockAuth } from '../../context/MockAuthContext';
import { MockAuthModal } from '../MockAuthModal';
import { UserProfileDropdown } from '../UserProfileDropdown';
import Logo from '../common/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { isEnabled: isAudioEnabled, toggleAudio } = useAudio();
  const { user } = useMockAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <Logo size="md" />
              <span className="ml-2 text-xl font-semibold text-gray-900">BrailleLearn</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
            >
              Home
            </Link>
            <Link 
              to="/learn" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/learn')}`}
            >
              Learn
            </Link>
            <Link 
              to="/practice" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/practice')}`}
            >
              Practice
            </Link>
            <Link 
              to="/speech-to-braille" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/speech-to-braille')}`}
            >
              Speech to Braille
            </Link>
            <Link 
              to="/class-hub" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/class-hub')}`}
            >
              Class Hub
            </Link>
            <div className="flex items-center space-x-4 ml-4">
              <button
                onClick={toggleAudio}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label={isAudioEnabled ? 'Disable audio narration' : 'Enable audio narration'}
              >
                {isAudioEnabled ? (
                  <Volume2 size={20} className="text-primary-600" />
                ) : (
                  <VolumeX size={20} className="text-gray-400" />
                )}
              </button>
              {user ? (
                <UserProfileDropdown />
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg border-2 border-gray-900 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleAudio}
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
              aria-label={isAudioEnabled ? 'Disable audio narration' : 'Enable audio narration'}
            >
              {isAudioEnabled ? (
                <Volume2 size={20} className="text-primary-600" />
              ) : (
                <VolumeX size={20} className="text-gray-400" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Home size={20} className="mr-2" />
                Home
              </div>
            </Link>
            <Link
              to="/learn"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/learn')}`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <BookOpen size={20} className="mr-2" />
                Learn
              </div>
            </Link>
            <Link
              to="/practice"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/practice')}`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Settings size={20} className="mr-2" />
                Practice
              </div>
            </Link>
            <Link
              to="/speech-to-braille"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/speech-to-braille')}`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Mic size={20} className="mr-2" />
                Speech to Braille
              </div>
            </Link>
            <Link
              to="/class-hub"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/class-hub')}`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <User size={20} className="mr-2" />
                Class Hub
              </div>
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="px-3">
                  <UserProfileDropdown />
                </div>
              ) : (
                <>
                  <div className="flex items-center px-3">
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        closeMenu();
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full border-2 border-gray-300"
                    >
                      Sign In
                    </button>
                  </div>
                  <div className="flex items-center px-3 mt-2">
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                        closeMenu();
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 w-full text-center border-2 border-gray-900 shadow-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Authentication Modal */}
      <MockAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </header>
  );
};

export default Header;