import React from 'react';

interface BusinessPartner {
  category: string;
  description: string;
  icon: string;
  benefits: string[];
}

const BusinessAnalytics: React.FC = () => {
  const partners: BusinessPartner[] = [
    {
      category: 'Drone Manufacturers',
      description: 'Partner with leading drone manufacturers to integrate UATM systems directly into their products.',
      icon: '🛠️',
      benefits: [
        'Direct system integration',
        'Enhanced safety features',
        'Competitive advantage',
        'Regulatory compliance'
      ]
    },
    {
      category: 'Logistics Providers',
      description: 'Enable efficient and safe drone delivery operations for logistics companies.',
      icon: '🚚',
      benefits: [
        'Optimized routes',
        'Real-time tracking',
        'Cost reduction',
        'Faster deliveries'
      ]
    },
    {
      category: 'Air Traffic Service Operators',
      description: 'Provide comprehensive air traffic management solutions for existing operators.',
      icon: '🗼',
      benefits: [
        'Enhanced monitoring',
        'Automated coordination',
        'Risk prevention',
        'Data analytics'
      ]
    },
    {
      category: 'Weather Analysts',
      description: 'Integrate weather data for improved flight planning and risk assessment.',
      icon: '🌤️',
      benefits: [
        'Real-time updates',
        'Predictive analytics',
        'Route optimization',
        'Safety improvements'
      ]
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Business Analytics (B2B)
          </h2>
          <p className="mt-4 text-xl text-white/80">
            Strategic partnerships for comprehensive urban air mobility solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <div
              key={partner.category}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary/50 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{partner.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {partner.category}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {partner.description}
                  </p>
                  
                  <div className="space-y-3">
                    {partner.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center space-x-2 text-white/80"
                      >
                        <span className="text-primary">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Potential */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center animate-fade-in-up">
            <div className="text-4xl font-bold text-primary mb-2">₹50,000 Cr</div>
            <div className="text-white/70">Estimated Market Size by 2025</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center animate-fade-in-up">
            <div className="text-4xl font-bold text-accent mb-2">85%</div>
            <div className="text-white/70">Cost Reduction for Partners</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center animate-fade-in-up">
            <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
            <div className="text-white/70">Operational Support</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center animate-fade-in-up">
          <button className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-colors">
            Partner with Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default BusinessAnalytics; 