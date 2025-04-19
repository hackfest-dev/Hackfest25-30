import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
      // Animate the number with easing
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
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: index * 0.2
          }
        }
      }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300"
    >
      <motion.div 
        className="flex items-center gap-3 mb-3"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-2xl">{metric.icon}</span>
        <h3 className="text-base font-medium text-white/70 leading-tight font-exo">
          {metric.label}
        </h3>
      </motion.div>
     
      <motion.div 
        className="flex items-end justify-between mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-3xl font-bold text-white font-jetbrainsMono tracking-tight">
          {value}{metric.value.includes('%') ? '%' : ''}
        </div>
        <motion.div 
          className={`flex items-center text-sm font-medium ${metric.positive ? 'text-accent' : 'text-secondary'} font-exo`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          {metric.label === 'Average Flight Deviation' ? '↓' : '↑'} 
          <span className="ml-1">{metric.change}</span>
        </motion.div>
      </motion.div>
      <motion.p 
        className="text-xs text-white/50 mt-2 font-chakra"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Improvement since launch
      </motion.p>
    </motion.div>
  );
};

const Comparison: React.FC = () => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: chartRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  // Add state for animated values
  const [animatedValues, setAnimatedValues] = useState({
    co2: { before: 0, after: 0, avg: 0 },
    cost: { before: 0, after: 0, avg: 0 },
    time: { before: 0, after: 0, avg: 0 }
  });

  // Function to animate values
  const animateValues = (targetValues: any) => {
    const duration = 2000;
    const steps = 60;
    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        co2: {
          before: prev.co2.before + (targetValues.co2.before - prev.co2.before) / steps,
          after: prev.co2.after + (targetValues.co2.after - prev.co2.after) / steps,
          avg: prev.co2.avg + (targetValues.co2.avg - prev.co2.avg) / steps
        },
        cost: {
          before: prev.cost.before + (targetValues.cost.before - prev.cost.before) / steps,
          after: prev.cost.after + (targetValues.cost.after - prev.cost.after) / steps,
          avg: prev.cost.avg + (targetValues.cost.avg - prev.cost.avg) / steps
        },
        time: {
          before: prev.time.before + (targetValues.time.before - prev.time.before) / steps,
          after: prev.time.after + (targetValues.time.after - prev.time.after) / steps,
          avg: prev.time.avg + (targetValues.time.avg - prev.time.avg) / steps
        }
      }));
    }, duration / steps);

    setTimeout(() => {
      clearInterval(interval);
      setAnimatedValues(targetValues);
    }, duration);
  };

  // Trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateValues({
              co2: { before: metrics.co2.before, after: metrics.co2.afterUATM, avg: metrics.co2.industryAvg },
              cost: { before: metrics.cost.before, after: metrics.cost.afterUATM, avg: metrics.cost.industryAvg },
              time: { before: metrics.time.before, after: metrics.time.afterUATM, avg: metrics.time.industryAvg }
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Update chart data with animated values
  const animatedChartData = {
    co2: {
      labels: ['Traditional', 'Industry Avg', 'UATM'],
      datasets: [
        {
          label: 'CO₂ Emissions',
          data: [animatedValues.co2.before, animatedValues.co2.avg, animatedValues.co2.after],
          backgroundColor: [
            'rgba(255, 107, 107, 0.5)', 
            'rgba(255, 159, 64, 0.5)', 
            'rgba(108, 255, 175, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(108, 255, 175, 1)'
          ],
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
        }
      ]
    },
    cost: {
      labels: ['Traditional', 'Industry Avg', 'UATM'],
      datasets: [
        {
          label: 'Delivery Cost',
          data: [animatedValues.cost.before, animatedValues.cost.avg, animatedValues.cost.after],
          backgroundColor: [
            'rgba(255, 107, 107, 0.5)', 
            'rgba(255, 159, 64, 0.5)', 
            'rgba(108, 255, 175, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(108, 255, 175, 1)'
          ],
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
        }
      ]
    },
    time: {
      labels: ['Traditional', 'Industry Avg', 'UATM'],
      datasets: [
        {
          label: 'Delivery Time',
          data: [animatedValues.time.before, animatedValues.time.avg, animatedValues.time.after],
          backgroundColor: [
            'rgba(255, 107, 107, 0.5)', 
            'rgba(255, 159, 64, 0.5)', 
            'rgba(108, 255, 175, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(108, 255, 175, 1)'
          ],
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
        }
      ]
    }
  };

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for individual charts
      },
      title: {
        display: true,
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          family: 'Inter',
          size: 16,
          weight: 'bold',
        },
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ` ${context.chart.options.plugins.title.text.split(' (')[1].replace(')', '')}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Inter',
          },
          // Auto-adjust ticks based on data range
        }
      },
      x: {
        grid: {
          display: false, // Hide vertical grid lines for cleaner look
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Inter',
          }
        }
      }
    }
  };

  // Enhanced chart options with better animations
  const getChartOptions = (title: string, yLabel?: string) => {
    const options = JSON.parse(JSON.stringify(baseChartOptions));
    options.plugins.title.text = title;
    if (yLabel) {
      options.scales.y.title = {
        display: true,
        text: yLabel,
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          family: 'Inter',
          size: 12,
        }
      };
    }
    options.animation = {
      duration: 2000,
      easing: 'easeInOutQuad',
      onProgress: function(animation: any) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = '12px Inter';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        chart.data.datasets.forEach((dataset: any, i: number) => {
          chart.getDatasetMeta(i).data.forEach((bar: any, index: number) => {
            const value = dataset.data[index];
            ctx.fillText(value.toFixed(1), bar.x, bar.y - 5);
          });
        });
        ctx.restore();
      }
    };
    return options;
  };

  const metrics = {
    co2: {
      before: 8.5,
      afterUATM: 0.9,
      industryAvg: 6.2,
      unit: 'kg/delivery'
    },
    cost: {
      before: 280,
      afterUATM: 95,
      industryAvg: 185,
      unit: '₹/km'
    },
    time: {
      before: 145,
      afterUATM: 35,
      industryAvg: 90,
      unit: 'minutes'
    }
  };

  const labels = ['Traditional', 'Industry Avg', 'UATM'];

  const chartData = {
    co2: {
      labels: labels,
      datasets: [
        {
          label: 'CO₂ Emissions',
          data: [metrics.co2.before, metrics.co2.industryAvg, metrics.co2.afterUATM],
          backgroundColor: [
            'rgba(255, 107, 107, 0.5)', 
            'rgba(255, 159, 64, 0.5)', 
            'rgba(108, 255, 175, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(108, 255, 175, 1)'
          ],
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
        }
      ]
    },
    cost: {
      labels: labels,
      datasets: [
        {
          label: 'Delivery Cost',
          data: [metrics.cost.before, metrics.cost.industryAvg, metrics.cost.afterUATM],
          backgroundColor: [
            'rgba(255, 107, 107, 0.5)', 
            'rgba(255, 159, 64, 0.5)', 
            'rgba(108, 255, 175, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(108, 255, 175, 1)'
          ],
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
        }
      ]
    },
    time: {
      labels: labels,
      datasets: [
        {
          label: 'Delivery Time',
          data: [metrics.time.before, metrics.time.industryAvg, metrics.time.afterUATM],
          backgroundColor: [
            'rgba(255, 107, 107, 0.5)', 
            'rgba(255, 159, 64, 0.5)', 
            'rgba(108, 255, 175, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(108, 255, 175, 1)'
          ],
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
        }
      ]
    }
  };

  const calculateImprovement = (before: number, after: number) => {
    return Math.round(((before - after) / before) * 100);
  };

  const comparisonMetrics = [
    {
      label: 'CO₂ Emissions',
      before: `${metrics.co2.before} ${metrics.co2.unit.split('/')[0]}`,
      after: `${metrics.co2.afterUATM} ${metrics.co2.unit.split('/')[0]}`,
      improvement: calculateImprovement(metrics.co2.before, metrics.co2.afterUATM),
      icon: '🌱'
    },
    {
      label: 'Delivery Cost',
      before: `₹${metrics.cost.before}/${metrics.cost.unit.split('/')[1]}`,
      after: `₹${metrics.cost.afterUATM}/${metrics.cost.unit.split('/')[1]}`,
      improvement: calculateImprovement(metrics.cost.before, metrics.cost.afterUATM),
      icon: '💰'
    },
    {
      label: 'Delivery Time',
      before: `${metrics.time.before} ${metrics.time.unit}`,
      after: `${metrics.time.afterUATM} ${metrics.time.unit}`,
      improvement: calculateImprovement(metrics.time.before, metrics.time.afterUATM),
      icon: '⚡'
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight font-orbitron uppercase">
            Correlation Metrics
          </h2>
          <p className="mt-4 text-xl text-white/80">
            Comparing traditional systems vs UATM implementation
          </p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {comparisonMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              ref={chartRef}
              style={{ opacity, scale }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{metric.icon}</span>
                <h3 className="text-lg font-medium text-white/70">
                  {metric.label}
                </h3>
              </div>
              
              <div className="space-y-2">
                <motion.div 
                  className="flex justify-between items-center text-secondary/90"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span>Traditional</span>
                  <span className="font-bold">{metric.before}</span>
                </motion.div>
                
                <motion.div 
                  className="flex justify-between items-center text-accent font-medium"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <span>With UATM</span>
                  <span className="font-bold">{metric.after}</span>
                </motion.div>
                
                <motion.div 
                  className="pt-2 mt-2 border-t border-white/10"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Improvement</span>
                    <span className="text-primary font-bold">↓ {metric.improvement}%</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Separated Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {Object.entries(animatedChartData).map(([key, data], index) => (
            <motion.div
              key={key}
              ref={chartRef}
              style={{ opacity, scale }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300"
            >
              <div className="h-[350px]">
                <Bar 
                  options={getChartOptions(
                    key === 'co2' ? 'CO₂ Emissions (kg/delivery)' : 
                    key === 'cost' ? 'Delivery Cost (₹/km)' : 
                    'Delivery Time (minutes)',
                    key === 'co2' ? 'kg' : key === 'cost' ? '₹' : 'min'
                  )} 
                  data={data} 
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Chart Legend */}
        <motion.div 
          className="flex justify-center gap-6 text-sm mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[rgba(255,107,107,0.5)] border border-[rgba(255,107,107,1)]"></span>
            <span className="text-secondary/90">Traditional System</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[rgba(255,159,64,0.5)] border border-[rgba(255,159,64,1)]"></span>
            <span className="text-[#ffa500]">Industry Average</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[rgba(108,255,175,0.8)] border border-[rgba(108,255,175,1)]"></span>
            <span className="text-accent font-medium">UATM Implementation</span>
          </div>
        </motion.div>

        {/* Additional Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🌍',
              title: 'Environmental Impact',
              description: '89% reduction in carbon emissions through electric drones and optimized routes, surpassing industry standards by 85%.'
            },
            {
              icon: '⚡',
              title: 'Operational Efficiency',
              description: '76% faster delivery times with AI-driven route optimization, performing 61% better than industry average.'
            },
            {
              icon: '💰',
              title: 'Cost Efficiency',
              description: '66% reduction in delivery costs, making UATM 49% more cost-effective than current industry standards.'
            }
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-white/70">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Comparison; 