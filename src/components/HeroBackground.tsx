import React from 'react';
import { motion } from 'framer-motion';

interface HeroBackgroundProps {
  backgroundX: any;
  backgroundY: any;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({ backgroundX, backgroundY }) => {
  return (
    <motion.div
      className="absolute inset-0 z-0"
      style={{
        x: backgroundX,
        y: backgroundY,
      }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: `url('/images/drone-delivery-bg.svg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
      
      {/* Animated Drones */}
      {[1, 2, 3].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-8 h-8 opacity-30"
          style={{
            left: `${20 + index * 30}%`,
            top: `${30 + index * 20}%`,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2l4 4H8l4-4zm0 20l-4-4h8l-4 4zm8-8l-4 4V8l4 4zm-16 0l4-4v8l-4-4z'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain'
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            delay: index * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Particles */}
      {[...Array(20)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};

export default HeroBackground; 