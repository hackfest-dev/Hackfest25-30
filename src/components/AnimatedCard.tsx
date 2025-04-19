import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`${className} bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden`}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard; 