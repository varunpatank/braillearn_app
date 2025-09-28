import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">BrailleLearn</h2>
            <p className="text-gray-300 text-sm">
              Learn Braille through interactive lessons, speech-to-braille 
              conversion, and physical Arduino integration.
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/learn" className="text-gray-300 hover:text-white text-sm">Interactive Lessons</Link></li>
              <li><Link to="/practice" className="text-gray-300 hover:text-white text-sm">Practice</Link></li>
              <li><Link to="/speech-to-braille" className="text-gray-300 hover:text-white text-sm">Speech to Braille</Link></li>
              <li><Link to="/hardware-setup" className="text-gray-300 hover:text-white text-sm">Arduino Integration</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Braille Reference</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Hardware Guide</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">FAQs</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Github size={20} />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Subscribe to our newsletter for updates:
            </p>
            <form className="mt-2 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r-md text-sm transition duration-150 ease-in-out"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} BrailleLearn. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <p className="text-sm text-gray-400 flex items-center">
              Made with <Heart size={16} className="mx-1 text-red-500" /> for accessibility
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;