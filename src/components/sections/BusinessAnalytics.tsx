import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCard from '../AnimatedCard';

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
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Business Analytics (B2B)
          </h2>
          <p className="mt-4 text-xl text-white/80">
            Strategic partnerships for comprehensive urban air mobility solutions
          </p>
        </div>

        <div className="overflow-x-auto mb-16">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-4 text-left">Buyer Type</th>
                <th className="p-4 text-left">Why They Care</th>
                <th className="p-4 text-left">What UATM Offers Them</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium">Drone Manufacturers</td>
                <td className="p-4">Need certified airspace systems</td>
                <td className="p-4">Pre-integrated UATM API for compliance</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium">Logistics Companies</td>
                <td className="p-4">Want faster + cheaper deliveries</td>
                <td className="p-4">Air route optimization & real-time rerouting</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium">Emergency Services</td>
                <td className="p-4">Need safe air corridors during crises</td>
                <td className="p-4">Secure drone police + weather adaptation</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium">Weather Analysts</td>
                <td className="p-4">Need integration into UATM networks</td>
                <td className="p-4">Access to drone sensor & airspace data</td>
              </tr>
              <tr className="hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-medium">Smart City Planners</td>
                <td className="p-4">Planning future airspace infrastructure</td>
                <td className="p-4">AI-optimized, scalable traffic system</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
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

        {/* Market Size and Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <AnimatedCard className="p-6 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-semibold mb-4">Market Size</h3>
            <p className="text-gray-300">
              The Indian UAM market is projected to reach $1.5 billion by 2030, with a CAGR of 25%.
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-6 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-semibold mb-4">Revenue Streams</h3>
            <ul className="list-disc list-inside text-gray-300">
              <li>Subscription-based API access</li>
              <li>Transaction fees for airspace usage</li>
              <li>Premium analytics services</li>
            </ul>
          </AnimatedCard>
        </div>

        {/* Market Potential */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
        <div className="text-center animate-fade-in-up">
          <button className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-colors">
            Partner with Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default BusinessAnalytics; 