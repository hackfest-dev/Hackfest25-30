import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../AnimatedPage';
import AnimatedButton from '../AnimatedButton';

const FeatureTwoDetails: React.FC = () => {
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
                Dynamic Route Optimization
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Intelligent routing system that adapts to changing conditions and traffic patterns
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
                  src="/images/feature2-routes.jpg"
                  alt="Dynamic Route Optimization"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              
              {/* Animated Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"
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
                  Our dynamic routing system continuously analyzes multiple factors including 
                  weather conditions, airspace restrictions, and real-time traffic data to 
                  calculate the most efficient routes. The system automatically adjusts 
                  flight paths to ensure optimal performance and safety.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Key Benefits</h2>
                <ul className="space-y-3">
                  {[
                    "Real-time route optimization based on current conditions",
                    "Automatic rerouting for unexpected events",
                    "Energy-efficient path planning",
                    "Reduced flight times and fuel consumption",
                    "Seamless integration with existing air traffic systems"
                  ].map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-center text-white/80"
                    >
                      <span className="w-2 h-2 bg-accent rounded-full mr-3" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Technical Details</h2>
                <p className="text-white/80 leading-relaxed">
                  The system uses advanced algorithms to process real-time data and 
                  calculate optimal routes. It considers multiple variables including 
                  weather patterns, airspace restrictions, and traffic density to 
                  ensure safe and efficient navigation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default FeatureTwoDetails; 