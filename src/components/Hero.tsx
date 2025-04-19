import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import HeroBackground from './HeroBackground';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);

  // Parallax effect values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // Transform values for parallax
  const backgroundX = useTransform(smoothMouseX, [-500, 500], [-20, 20]);
  const backgroundY = useTransform(smoothMouseY, [-500, 500], [-20, 20]);
  const textX = useTransform(smoothMouseX, [-500, 500], [-10, 10]);
  const textY = useTransform(smoothMouseY, [-500, 500], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePosition({ x, y });
      mouseX.set(x - rect.width / 2);
      mouseY.set(y - rect.height / 2);

      // Add particle
      const newParticle = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        opacity: 1
      };
      setParticles(prev => [...prev, newParticle]);

      // Remove particle after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background */}
      <HeroBackground backgroundX={backgroundX} backgroundY={backgroundY} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4aDEydjEySDM2Vjh6bTAgMTZoMTJ2MTJIMzZWMjR6bS0xNiAwaDEydjEySDIwVjI0em0wLTE2aDEydjEySDIwVjh6IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')]" />
      </div>

      {/* Cursor particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-primary rounded-full"
          initial={{ 
            x: particle.x, 
            y: particle.y,
            opacity: 1,
            scale: 1
          }}
          animate={{ 
            opacity: 0,
            scale: 0,
            x: particle.x + (Math.random() - 0.5) * 100,
            y: particle.y + (Math.random() - 0.5) * 100
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}

      {/* Content with parallax effect */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
        style={{
          x: textX,
          y: textY,
        }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Urban Air Traffic
          </span>
          <span className="block mt-2 text-white">
            Management System
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Revolutionizing urban airspace management with AI-driven solutions for safer, 
          more efficient aerial transportation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <AnimatedButton
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            Explore Solutions
          </AnimatedButton>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
};

export default Hero; 