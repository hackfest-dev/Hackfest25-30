import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../AnimatedButton';

const PhaseOneDetails: React.FC = () => {
  const navigate = useNavigate();

  const partnershipDetails = [
    {
      title: "Technical Integration",
      points: [
        "API integration with drone manufacturers",
        "Safety protocol implementation",
        "Testing and certification process",
        "Hardware compatibility checks"
      ],
      icon: "🔧"
    },
    {
      title: "Safety Standards",
      points: [
        "Emergency response protocols",
        "Fail-safe mechanisms",
        "Collision avoidance systems",
        "Weather condition handling"
      ],
      icon: "🛡️"
    },
    {
      title: "Regulatory Compliance",
      points: [
        "DGCA certification process",
        "International safety standards",
        "Local airspace regulations",
        "Documentation and reporting"
      ],
      icon: "📋"
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
              Phase One: Drone Company Partnerships
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Establishing strong foundations through strategic partnerships with leading drone manufacturers
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Implementation Timeline</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Month 1-2: Initial Partnership Setup</h3>
                  <p className="text-white/70">Establishing relationships and framework agreements with drone manufacturers</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Month 3-4: Technical Integration</h3>
                  <p className="text-white/70">Implementing API connections and safety protocols</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Month 5-6: Testing and Deployment</h3>
                  <p className="text-white/70">Conducting pilot programs and scaling successful implementations</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Partnership Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {partnershipDetails.map((detail, index) => (
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

        {/* Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Success Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <p className="text-white/70">Integration Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">50+</div>
              <p className="text-white/70">Partner Companies</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">99.9%</div>
              <p className="text-white/70">System Reliability</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <AnimatedButton
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={() => navigate(-1)}
          >
            ← Back
          </AnimatedButton>
          <AnimatedButton
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => navigate('/implementation/phase-two')}
          >
            Next Phase →
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
};

export default PhaseOneDetails; 