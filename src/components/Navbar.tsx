import React from 'react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent">
              UATM
            </span>
          </div>
          <div className="flex items-center space-x-8">
            <a href="#overview" className="text-white/80 hover:text-white transition-colors group relative">
              Overview
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-light group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#features" className="text-white/80 hover:text-white transition-colors group relative">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-light group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#impact" className="text-white/80 hover:text-white transition-colors group relative">
              Impact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-light group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#comparison" className="text-white/80 hover:text-white transition-colors group relative">
              Comparison
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-light group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors group relative">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-light group-hover:w-full transition-all duration-300" />
            </a>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 