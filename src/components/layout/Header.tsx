import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings, BookOpen, Home, MapPin, LogOut, ChevronDown } from 'lucide-react';
import { SignInButton, SignUpButton, useUser, useClerk } from '@clerk/clerk-react';
import Logo from '../common/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, user } = useUser();
  const { signOut, openSignIn } = useClerk();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onAuth = (e: Event) => {
      const action = (e as CustomEvent).detail?.action;
      if (action === 'sign-in') {
        openSignIn();
        setTimeout(() => window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Sign in dialog opened. You can say "continue with Google" to sign in with Google, or fill in your details.' } })), 800);
      } else if (action === 'google') {
        openSignIn();
        setTimeout(() => {
          const googleBtn = document.querySelector('[data-provider="google"]') as HTMLElement
            || document.querySelector('button[aria-label*="Google"]') as HTMLElement
            || Array.from(document.querySelectorAll('.cl-socialButtonsBlockButton')).find(el => el.textContent?.toLowerCase().includes('google')) as HTMLElement;
          if (googleBtn) googleBtn.click();
          else window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Sign in dialog is open. Please click "Continue with Google" on screen.' } }));
        }, 1500);
      } else if (action === 'sign-out') {
        signOut();
        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'You have been signed out.' } }));
      }
    };
    window.addEventListener('braylin-auth', onAuth);
    return () => window.removeEventListener('braylin-auth', onAuth);
  }, [openSignIn, signOut]);

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
              to="/braillequest" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/braillequest')}`}
            >
              Missions
            </Link>

<Link 
              to="/class-hub" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/class-hub')}`}
            >
              Class Hub
            </Link>

            <div className="flex items-center space-x-4 ml-4">
              {isSignedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-1.5 focus:outline-none"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full ring-2 ring-blue-500 ring-offset-2 object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full ring-2 ring-blue-500 ring-offset-2 bg-blue-100 flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                      </div>
                    )}
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User size={20} className="text-blue-600" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || user?.firstName || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link to="/settings" onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                          <Settings size={16} className="text-gray-400" /> Account Settings
                        </Link>
                        <Link to="/achievements" onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                          <BookOpen size={16} className="text-gray-400" /> My Progress
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button onClick={() => { setShowUserDropdown(false); signOut(); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative" ref={authDropdownRef}>
                  <button
                    onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
                  >
                    <User size={16} />
                    Sign In
                    <ChevronDown size={14} className={`transition-transform ${showAuthDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showAuthDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 px-3 z-50 space-y-2">
                      <SignInButton mode="modal">
                        <button onClick={() => setShowAuthDropdown(false)}
                          className="w-full px-4 py-2.5 text-sm font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button onClick={() => setShowAuthDropdown(false)}
                          className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md">
                          Create Account
                        </button>
                      </SignUpButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center md:hidden">
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
              to="/braillequest"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/braillequest')}`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <MapPin size={20} className="mr-2" />
                Missions
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
              {isSignedIn ? (
                <div className="px-3">
                  <div className="flex items-center gap-3 mb-3">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || user?.firstName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <button onClick={() => { closeMenu(); signOut(); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center px-3">
                    <SignInButton mode="modal">
                      <button className="block px-3 py-2 rounded-xl text-base font-semibold text-blue-600 hover:bg-blue-50 w-full border-2 border-blue-200 hover:border-blue-300 transition-all">
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                  <div className="flex items-center px-3 mt-2">
                    <SignUpButton mode="modal">
                      <button className="block px-3 py-2 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 w-full text-center shadow-lg shadow-blue-500/25 transition-all">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
    </header>
  );
};

export default Header;