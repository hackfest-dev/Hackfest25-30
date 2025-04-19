import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  showParticles?: boolean;
  showParallax?: boolean;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  className = '',
  showParticles = true,
  showParallax = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);

  // Parallax effect values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // Transform values for parallax
  const backgroundX = useTransform(smoothMouseX, [-500, 500], [-20, 20]);
  const backgroundY = useTransform(smoothMouseY, [-500, 500], [-20, 20]);
  const contentX = useTransform(smoothMouseX, [-500, 500], [-10, 10]);
  const contentY = useTransform(smoothMouseY, [-500, 500], [-10, 10]);

  useEffect(() => {
    if (!showParticles && !showParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (showParallax) {
        mouseX.set(x - rect.width / 2);
        mouseY.set(y - rect.height / 2);
      }

      if (showParticles) {
        const newParticle = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          opacity: 1
        };
        setParticles(prev => [...prev, newParticle]);

        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showParticles, showParallax]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden bg-black ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background with parallax effect */}
      {showParallax && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black via-primary/10 to-black"
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
      )}

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4aDEydjEySDM2Vjh6bTAgMTZoMTJ2MTJIMzZWMjR6bS0xNiAwaDEydjEySDIwVjI0em0wLTE2aDEydjEySDIwVjh6IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')]" />
      </div>

      {/* Cursor particles */}
      {showParticles && particles.map(particle => (
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
        className="relative z-10"
        style={showParallax ? {
          x: contentX,
          y: contentY,
        } : undefined}
      >
        {children}
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </motion.div>
  );
};

export default AnimatedPage; 