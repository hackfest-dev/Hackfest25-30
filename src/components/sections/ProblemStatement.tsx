import React from 'react';

const ProblemStatement: React.FC = () => {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              The Challenge:
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Urban Air Traffic Management
              </span>
            </h2>
            
            <div className="space-y-6 text-lg text-white/80">
              <p>
                India's Urban Air Mobility (UAM) sector faces critical challenges in managing air traffic, preventing collisions, and ensuring security. While metro cities grapple with severe road congestion, the current DGCA policies lack:
              </p>
              
              <ul className="space-y-4">
                {[
                  'Real-time AI-based traffic control systems',
                  'Comprehensive collision prevention mechanisms',
                  'Integrated security protocols for UAM operations',
                  'Standardized air traffic management frameworks',
                  'Dynamic route optimization capabilities'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-primary mt-1">⚠️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <p className="text-xl font-semibold text-white/90 mt-8">
                These gaps in the current system create significant safety risks and regulatory challenges, hindering the potential of UAM to alleviate urban congestion.
              </p>
            </div>
          </div>
          
          {/* Statistics/Visual */}
          <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/10 p-8 animate-fade-in-up-delay">
            <div className="space-y-8">
              <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
                <div className="text-5xl font-bold text-primary mb-2 animate-pulse-slow">
                  500%
                </div>
                <p className="text-white/70">Expected growth in UAM operations by 2025</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-accent mb-2">
                    ₹15,000 Cr
                  </div>
                  <p className="text-sm text-white/70">Potential economic impact</p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    60%
                  </div>
                  <p className="text-sm text-white/70">Current traffic management inefficiency</p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-float-slow" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement; 