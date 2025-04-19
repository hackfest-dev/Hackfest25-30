import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../AnimatedButton';

const PhaseTwoDetails: React.FC = () => {
  const navigate = useNavigate();

  const integrationDetails = [
    {
      title: "Delivery Network Integration",
      points: [
        "Last-mile delivery optimization",
        "Hub-and-spoke model implementation",
        "Real-time tracking systems",
        "Delivery scheduling automation"
      ],
      icon: "🚚"
    },
    {
      title: "Infrastructure Setup",
      points: [
        "Charging station network",
        "Maintenance facilities",
        "Storage and handling units",
        "Emergency response centers"
      ],
      icon: "🏗️"
    },
    {
      title: "Operations Management",
      points: [
        "Fleet management system",
        "Load balancing algorithms",
        "Quality assurance protocols",
        "Performance monitoring"
      ],
      icon: "⚙️"
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
              Phase Two: Delivery Partner Integration
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Expanding our network through strategic partnerships with delivery services
          </p>
        </motion.div>

        {/* Implementation Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Implementation Process</h2>
            <div className="space-y-8">
              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Months 1-4: Partner Onboarding</h3>
                  <p className="text-white/70 mb-2">Initial setup and integration with major delivery partners</p>
                  <ul className="space-y-2 text-white/60">
                    <li>• Partner selection and agreement finalization</li>
                    <li>• System integration planning</li>
                    <li>• Staff training programs</li>
                  </ul>
                </div>
              </div>
              
              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Months 5-8: Infrastructure Development</h3>
                  <p className="text-white/70 mb-2">Setting up necessary infrastructure and systems</p>
                  <ul className="space-y-2 text-white/60">
                    <li>• Charging station network deployment</li>
                    <li>• Hub establishment and connectivity</li>
                    <li>• Maintenance facility setup</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Months 9-12: Full Scale Operations</h3>
                  <p className="text-white/70 mb-2">Scaling operations and optimizing performance</p>
                  <ul className="space-y-2 text-white/60">
                    <li>• Gradual service expansion</li>
                    <li>• Performance monitoring and optimization</li>
                    <li>• Customer feedback integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Integration Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {integrationDetails.map((detail, index) => (
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

        {/* Key Performance Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2.5x</div>
              <p className="text-white/70">Delivery Speed Improvement</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">85%</div>
              <p className="text-white/70">Cost Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">99.8%</div>
              <p className="text-white/70">Delivery Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-white/70">Operation Coverage</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <AnimatedButton
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={() => navigate('/implementation/phase-one')}
          >
            ← Previous Phase
          </AnimatedButton>
          <AnimatedButton
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => navigate('/implementation/phase-three')}
          >
            Next Phase →
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
};

export default PhaseTwoDetails; 