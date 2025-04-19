import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Metric {
  value: string;
  label: string;
  color?: string;
  subtext?: string;
}

interface AnimatedMetricsProps {
  metrics: Metric[];
  title: string;
  className?: string;
}

const AnimatedMetric = ({ metric, index }: { metric: Metric; index: number }) => {
  const [value, setValue] = useState('0');
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
      const targetValue = metric.value;
      const duration = 2000;
      const steps = 60;
      const increment = parseFloat(targetValue) / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= parseFloat(targetValue)) {
          setValue(targetValue);
          clearInterval(interval);
        } else {
          setValue(current.toFixed(metric.value.includes('%') ? 2 : 1));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [inView, metric.value]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center p-6 bg-white/5 rounded-xl"
    >
      <div className={`text-4xl font-bold ${metric.color || 'text-primary'} mb-2`}>
        {value}{metric.value.includes('%') ? '%' : ''}
      </div>
      <p className="text-white/70">{metric.label}</p>
      {metric.subtext && (
        <p className="text-sm text-white/50 mt-2">{metric.subtext}</p>
      )}
    </motion.div>
  );
};

const AnimatedMetrics: React.FC<AnimatedMetricsProps> = ({ metrics, title, className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5 }}
      className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12 ${className}`}
    >
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <AnimatedMetric key={metric.label} metric={metric} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default AnimatedMetrics; 