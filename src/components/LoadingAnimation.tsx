import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <motion.div
        className="relative w-16 h-16"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Drone Body */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-4 bg-primary rounded-full" />
        </div>
        
        {/* Propellers */}
        {[0, 90, 180, 270].map((angle) => (
          <motion.div
            key={angle}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-20px)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: angle / 360
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default LoadingAnimation; 