import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../AnimatedButton';

const PhaseThreeDetails: React.FC = () => {
  const navigate = useNavigate();

  const expansionDetails = [
    {
      title: "Postal Network Integration",
      points: [
        "Rural area coverage expansion",
        "Post office hub conversion",
        "Last-mile connectivity",
        "Automated sorting systems"
      ],
      icon: "📬"
    },
    {
      title: "Technology Deployment",
      points: [
        "Smart tracking implementation",
        "IoT sensor networks",
        "Automated dispatch systems",
        "Weather monitoring stations"
      ],
      icon: "🛰️"
    },
    {
      title: "Community Engagement",
      points: [
        "Local business partnerships",
        "Public awareness campaigns",
        "Training programs",
        "Community feedback systems"
      ],
      icon: "🤝"
    }
  ];

  return (
    <section className="py-20 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Phase Three: Nationwide Expansion
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Leveraging postal networks for comprehensive nationwide coverage
          </p>
        </motion.div>

        {/* Coverage Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Expansion Strategy</h2>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Phase 3A: Metropolitan Regions</h3>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Integration with 50+ major post offices</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>High-density route optimization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Advanced sorting facilities</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Phase 3B: Rural Expansion</h3>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      <span>200+ rural post office integrations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      <span>Solar-powered charging stations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      <span>Community training centers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Expansion Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {expansionDetails.map((detail, index) => (
            <motion.div
              key={detail.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="text-4xl mb-4">{detail.icon}</div>
              <h3 className="text-xl font-bold text-white mb-4">{detail.title}</h3>
              <ul className="space-y-2">
                {detail.points.map((point, idx) => (
                  <li key={idx} className="flex items-center text-white/70">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Impact Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Expected Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-4xl font-bold text-primary mb-2">100,000+</div>
              <p className="text-white/70">Daily Deliveries</p>
              <p className="text-sm text-white/50 mt-2">Across rural and urban areas</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <p className="text-white/70">Post Offices</p>
              <p className="text-sm text-white/50 mt-2">Integrated into network</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl">
              <div className="text-4xl font-bold text-secondary mb-2">70%</div>
              <p className="text-white/70">Rural Coverage</p>
              <p className="text-sm text-white/50 mt-2">Of total postal routes</p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Implementation Timeline</h2>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 text-white/70">Month 1-8</div>
              <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-full"></div>
              </div>
              <div className="text-white/70">Metropolitan Integration</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-white/70">Month 9-16</div>
              <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-accent to-secondary rounded-full"></div>
              </div>
              <div className="text-white/70">Rural Expansion</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-white/70">Month 17-24</div>
              <div className="flex-grow h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-secondary to-primary rounded-full"></div>
              </div>
              <div className="text-white/70">Network Optimization</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <AnimatedButton
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={() => navigate('/implementation/phase-two')}
          >
            ← Previous Phase
          </AnimatedButton>
          <AnimatedButton
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => navigate(-1)}
          >
            Back to Overview
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
};

export default PhaseThreeDetails; 