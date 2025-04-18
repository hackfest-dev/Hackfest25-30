import React from 'react';

interface SolutionFeature {
  title: string;
  description: string;
  icon: string;
  image: string;
}

const Solutions: React.FC = () => {
  const features: SolutionFeature[] = [
    {
      title: 'Dynamic Routing',
      description: 'AI-powered route optimization that adapts in real-time to traffic conditions, weather patterns, and emergency situations.',
      icon: '🛣️',
      image: '/images/dynamic-routing.jpg' // Placeholder path
    },
    {
      title: 'Live Monitoring System',
      description: 'Real-time surveillance and tracking of all aerial vehicles with predictive collision detection and automated risk assessment.',
      icon: '📡',
      image: '/images/live-monitoring.jpg'
    },
    {
      title: 'Air Traffic Police',
      description: 'Dedicated aerial law enforcement system with automated violation detection and emergency response protocols.',
      icon: '👮',
      image: '/images/air-police.jpg'
    },
    {
      title: 'Geofencing',
      description: 'Dynamic virtual boundaries that automatically regulate drone access to restricted airspace and sensitive areas.',
      icon: '🔒',
      image: '/images/geofencing.jpg'
    },
    {
      title: 'Charging Ports',
      description: 'Strategic network of automated charging stations optimized for maximum coverage and minimal downtime.',
      icon: '🔋',
      image: '/images/charging-ports.jpg'
    },
    {
      title: 'Optimized Delivery',
      description: 'Cost-effective delivery solutions with smart load balancing and multi-drone coordination for maximum efficiency.',
      icon: '📦',
      image: '/images/delivery.jpg'
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Our Solutions & Features
          </h2>
          <p className="mt-4 text-xl text-white/80">
            Comprehensive solutions for next-generation urban air mobility
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Section */}
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="inline-block rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">
                  Feature {index + 1}
                </div>
                
                <h3 className="text-3xl font-bold text-white">
                  {feature.title}
                </h3>
                
                <p className="text-lg text-white/80 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="pt-4">
                  <button className="inline-flex items-center space-x-2 text-primary hover:text-primary-light transition-colors">
                    <span>Learn more</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions; 