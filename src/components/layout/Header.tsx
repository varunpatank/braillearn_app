import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings, BookOpen, Mic, Home, Volume2, VolumeX, Info, LogOut } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isEnabled: isAudioEnabled, toggleAudio } = useAudio();
  const { user, signOut } = useAuth();
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
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/signin" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
                  >
                    Sign Up
                  </Link>
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
              <div className="flex items-center px-3">
                <Link
                  to="/signin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              </div>
              <div className="flex items-center px-3 mt-2">
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 w-full text-center"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;