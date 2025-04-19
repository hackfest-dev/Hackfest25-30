import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../AnimatedPage';
import AnimatedButton from '../AnimatedButton';

const FeatureThreeDetails: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/', { state: { scrollToSolutions: true } });
  };

  return (
    <AnimatedPage showParticles={false} showParallax={true}>
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <AnimatedButton
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={handleBack}
            >
              ← Back to Features
            </AnimatedButton>
          </motion.div>

          {/* Feature Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Real-time Monitoring
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Comprehensive dashboard for monitoring and managing urban air traffic
            </p>
          </motion.div>

          {/* Feature Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/feature3-monitoring.jpg"
                  alt="Real-time Monitoring Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              
              {/* Animated Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">How It Works</h2>
                <p className="text-white/80 leading-relaxed">
                  Our real-time monitoring system provides a comprehensive view of 
                  urban air traffic through an intuitive dashboard. It displays 
                  live data, analytics, and alerts, enabling operators to make 
                  informed decisions and maintain safe airspace operations.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Key Benefits</h2>
                <ul className="space-y-3">
                  {[
                    "Live tracking of all aerial vehicles",
                    "Real-time weather and traffic updates",
                    "Automated alert system for potential conflicts",
                    "Customizable dashboard views",
                    "Historical data analysis and reporting"
                  ].map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-center text-white/80"
                    >
                      <span className="w-2 h-2 bg-secondary rounded-full mr-3" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Technical Details</h2>
                <p className="text-white/80 leading-relaxed">
                  The monitoring system integrates with various data sources and 
                  sensors to provide a complete picture of airspace activity. 
                  Advanced visualization tools and analytics help operators 
                  maintain situational awareness and respond quickly to changes.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <AnimatedButton
                  className="bg-secondary hover:bg-secondary/90 text-white"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Request Demo
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default FeatureThreeDetails; 