import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-300 text-lg">
            Built with ❤️ by{' '}
            <span className="font-bold bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent">
              Turbo Astronauts
            </span>
            {' '}| Hackfest 2025
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
              GitHub
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-light transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 