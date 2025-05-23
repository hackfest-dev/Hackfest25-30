import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
      // Animate the number
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
          {metric.label === 'Average Flight Deviation' ? '↓' : '↑'} 
          <span className="ml-1">{metric.change}</span>
        </div>
      </div>
      <p className="text-xs text-white/50 mt-2 font-chakra">Improvement since launch</p>
    </motion.div>
  );
};

const PerformanceMatrix: React.FC = () => {
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Managed Flights per Hour',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#00aaff',
        backgroundColor: 'rgba(0, 170, 255, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Automated Conflict Alerts Resolved',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#6cffaf',
        backgroundColor: 'rgba(108, 255, 175, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  });

  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
      // Animate the chart data
      const finalData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            ...chartData.datasets[0],
            data: [55, 80, 115, 160, 210, 250]
          },
          {
            ...chartData.datasets[1],
            data: [120, 150, 190, 240, 300, 350]
          }
        ]
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

  // Chart options with updated font styles
  const lineChartOptions = {
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
      title: {
        display: false,
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Flights per Hour',
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            family: "'Exo 2', sans-serif",
            size: 13,
            weight: 500
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(108, 255, 175, 0.8)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Alerts Resolved',
          color: 'rgba(108, 255, 175, 0.6)',
          font: {
            family: "'Exo 2', sans-serif",
            size: 13,
            weight: 500
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

  // Updated Realistic Metrics
  const metrics = [
    { label: 'Airspace Capacity Utilization', value: '78%', change: '+15%', positive: true, icon: '📊' },
    { label: 'Real-time Conflict Resolution Rate', value: '99.98%', change: '+0.05%', positive: true, icon: '🛡️' },
    { label: 'Average Flight Deviation', value: '< 2.5m', change: '-50%', positive: true, icon: '✈️' },
    { label: 'System Uptime', value: '99.995%', change: '+0.02%', positive: true, icon: '⏱️' }
  ];

  // Realistic System Load Distribution
  const systemLoad = [
    { name: 'Flight Path Planning', percentage: 40, color: '#00aaff' },
    { name: 'Conflict Detection & Resolution', percentage: 35, color: '#6cffaf' },
    { name: 'Real-time Monitoring & Comms', percentage: 25, color: '#ffcf56' },
  ];

  // Realistic Peak Traffic Hours
  const peakTraffic = [
    { time: 'Early Morning (6-8 AM)', density: 'Moderate', color: 'text-blue-400' },
    { time: 'Morning Rush (8-10 AM)', density: 'High', color: 'text-yellow-400' },
    { time: 'Midday (1-3 PM)', density: 'Peak', color: 'text-red-500' },
    { time: 'Evening Rush (5-7 PM)', density: 'High', color: 'text-yellow-400' }
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
            Performance Matrix
          </h2>
          <p className="mt-4 text-xl text-white/80 font-exo">
            Real-time UATM system analytics and operational KPIs
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <AnimatedMetric key={metric.label} metric={metric} index={index} />
          ))}
        </div>

        {/* Chart Section: UATM Growth Trends */}
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
            UATM Operational Growth (6 Months)
          </h3>
          <div className="h-[400px]">
            <Line options={lineChartOptions} data={chartData} />
          </div>
        </motion.div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* System Load Distribution */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-4 font-orbitron uppercase tracking-wide">
              System Task Distribution
            </h3>
            <div className="space-y-4">
              {systemLoad.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80 font-exo">{item.name}</span>
                    <span className="text-white font-medium font-jetbrainsMono">{item.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Traffic Hours */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-4 font-orbitron uppercase tracking-wide">
              Peak Traffic Hours
            </h3>
            <div className="space-y-3">
              {peakTraffic.map((period) => (
                <div key={period.time} className="flex justify-between items-center text-sm">
                  <span className="text-white/70 w-2/5 font-exo">{period.time}</span>
                  <div className={`w-3/5 text-right font-medium ${period.color} font-jetbrainsMono`}>
                    {period.density} Traffic Density
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceMatrix; 