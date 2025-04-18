import React from 'react';

const Dashboard: React.FC = () => {
  const features = [
    {
      title: 'Real-time Air Traffic Control',
      description: 'Advanced monitoring and management of urban airspace',
      icon: '🛩️',
      color: 'from-primary/10 to-primary/20'
    },
    {
      title: 'Drone Police Monitoring',
      description: 'Enhanced security through aerial surveillance',
      icon: '🚔',
      color: 'from-accent/10 to-accent/20'
    },
    {
      title: 'Delivery Optimization',
      description: 'Efficient routing and scheduling for drone deliveries',
      icon: '📦',
      color: 'from-secondary/10 to-secondary/20'
    },
    {
      title: 'Weather Adaptation',
      description: 'Smart weather monitoring and route adjustments',
      icon: '⛅',
      color: 'from-primary/10 to-primary/20'
    },
    {
      title: 'Smart Charging Network',
      description: 'Optimized charging infrastructure for drones',
      icon: '🔋',
      color: 'from-accent/10 to-accent/20'
    }
  ];

  return (
    <div className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-2xl bg-black/50 backdrop-blur-lg border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8">
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 animate-float">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary-light transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10 hover:border-primary-light/50 transition-colors duration-300">
            <h2 className="text-3xl font-bold mb-8 text-white">
              Delivery Budget Comparison
            </h2>
            <div className="h-96 bg-black/30 rounded-xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold mb-4 text-white animate-pulse-slow">
                  ₹2,000 Cr
                </div>
                <div className="text-4xl mb-6 text-primary-light animate-bounce">
                  ➝
                </div>
                <div className="text-5xl font-bold text-secondary-light animate-pulse-slow">
                  ₹1,400 Cr
                </div>
                <p className="mt-8 text-gray-300">
                  Chart.js integration coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 