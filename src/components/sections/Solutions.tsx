import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedCard from '../AnimatedCard';
import AnimatedButton from '../AnimatedButton';

const Solutions: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI-Powered Traffic Prediction",
      description: "Advanced machine learning algorithms predict and optimize air traffic flow in real-time",
      icon: "🚀",
      link: "/features/ai-traffic-prediction"
    },
    {
      title: "Dynamic Route Optimization",
      description: "Intelligent routing system that adapts to changing conditions and traffic patterns",
      icon: "🛣️",
      link: "/features/dynamic-route-optimization"
    },
    {
      title: "Real-time Monitoring",
      description: "Comprehensive dashboard for monitoring and managing urban air traffic",
      icon: "📊",
      link: "/features/real-time-monitoring"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Our Solutions
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Cutting-edge technologies for efficient and safe urban air traffic management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AnimatedCard className="h-full p-6">
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/80 mb-6 flex-grow">{feature.description}</p>
                  <AnimatedButton
                    className="bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => navigate(feature.link)}
                  >
                    Learn More
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        {/* Request Demo Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <AnimatedButton
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Request Demo
          </AnimatedButton>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions; 