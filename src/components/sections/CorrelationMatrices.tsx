import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnimatedMetric = ({ metric, index }: { metric: any, index: number }) => {
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
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{metric.icon}</span>
        <h3 className="text-base font-medium text-white/70 leading-tight font-exo">
          {metric.label}
        </h3>
      </div>
     
      <div className="flex items-end justify-between mt-4">
        <div className="text-3xl font-bold text-white font-jetbrainsMono tracking-tight">
          {value}{metric.value.includes('%') ? '%' : ''}
        </div>
        <div className={`flex items-center text-sm font-medium ${metric.positive ? 'text-accent' : 'text-secondary'} font-exo`}>
          {metric.label.includes('Reduction') ? '↓' : '↑'} 
          <span className="ml-1">{metric.change}</span>
        </div>
      </div>
      <p className="text-xs text-white/50 mt-2 font-chakra">Improvement with UATM</p>
    </motion.div>
  );
};

const CorrelationMatrices: React.FC = () => {
  const [chartData, setChartData] = useState({
    labels: ['Response Time', 'Accuracy', 'Scalability', 'Cost Efficiency'],
    datasets: [
      {
        label: 'Traditional Systems',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
      {
        label: 'UATM Implementation',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  });

  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
      const finalData = {
        labels: ['Response Time', 'Accuracy', 'Scalability', 'Cost Efficiency'],
        datasets: [
          {
            ...chartData.datasets[0],
            data: [75, 85, 60, 70],
          },
          {
            ...chartData.datasets[1],
            data: [95, 99, 90, 85],
          },
        ],
      };

      const duration = 2000;
      const steps = 60;
      const interval = setInterval(() => {
        setChartData(prev => ({
          ...prev,
          datasets: prev.datasets.map((dataset, i) => ({
            ...dataset,
            data: dataset.data.map((_, j) => {
              const target = finalData.datasets[i].data[j];
              const current = prev.datasets[i].data[j];
              const increment = (target - current) / steps;
              return current + increment;
            })
          }))
        }));
      }, duration / steps);

      setTimeout(() => {
        clearInterval(interval);
        setChartData(finalData);
      }, duration);

      return () => clearInterval(interval);
    }
  }, [inView]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'Exo 2', sans-serif",
            size: 13,
            weight: 500
          },
          padding: 20
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        titleFont: {
          family: "'Orbitron', sans-serif",
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: "'Chakra Petch', sans-serif",
          size: 13
        },
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 12
          }
        }
      }
    }
  };

  const metrics = [
    { label: 'Response Time Improvement', value: '95%', change: '+20%', positive: true, icon: '⚡' },
    { label: 'Accuracy Enhancement', value: '99%', change: '+14%', positive: true, icon: '🎯' },
    { label: 'Scalability Increase', value: '90%', change: '+30%', positive: true, icon: '📈' },
    { label: 'Cost Reduction', value: '85%', change: '-15%', positive: true, icon: '💰' }
  ];

  return (
    <section className="py-20 bg-black font-chakra">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight font-orbitron uppercase">
            Correlation Matrices
          </h2>
          <p className="mt-4 text-xl text-white/80 font-exo">
            Traditional Systems vs UATM Implementation
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <AnimatedMetric key={metric.label} metric={metric} index={index} />
          ))}
        </div>

        {/* Comparison Chart */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-6 text-center font-orbitron uppercase tracking-wide">
            Performance Comparison
          </h3>
          <div className="h-[400px]">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </motion.div>

        {/* Additional Comparison Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 font-orbitron uppercase tracking-wide">
              Traditional Systems
            </h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Manual conflict resolution
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Limited scalability
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Higher operational costs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Slower response times
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 font-orbitron uppercase tracking-wide">
              UATM Implementation
            </h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                AI-powered automation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Dynamic scalability
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Cost-effective operations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                Real-time response
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CorrelationMatrices; 