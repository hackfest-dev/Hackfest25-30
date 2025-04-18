import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-[100vh] bg-black overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA0MmMwIDMuMzEzLTIuNjg3IDYtNiA2cy02LTIuNjg3LTYtNiAyLjY4Ny02IDYtNiA2IDIuNjg3IDYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10 animate-pulse" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 animate-gradient" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex items-center justify-center min-h-[100vh]">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 text-white tracking-tight animate-fade-in-up">
            Urban Air Traffic
            <span className="block mt-2 md:mt-3">Management</span>
            <span className="block text-3xl md:text-4xl font-medium mt-6 text-primary-light animate-fade-in-up-delay tracking-normal">
              (UATM)
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-10 text-white/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-up-delay-2">
            Revolutionizing urban logistics through aerial intelligence.
          </p>
          
          <div className="inline-block animate-fade-in-up-delay-3">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl py-3 px-6 shadow-2xl border border-white/10 transform hover:scale-105 transition-all duration-300 hover:border-primary-light/50">
              <p className="text-base text-white font-medium tracking-wide">
                Turbo Astronauts – Hackfest 2025
              </p>
            </div>
          </div>
          
          {/* Animated decorative elements (position adjusted slightly) */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float-slow-reverse" />
          <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float-medium" />
        </div>
      </div>
    </div>
  );
};

export default Hero; 