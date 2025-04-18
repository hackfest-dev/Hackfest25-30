import React from 'react';
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

const Comparison: React.FC = () => {

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

  // Function to deep clone and customize options
  const getChartOptions = (title: string, yLabel?: string) => {
    const options = JSON.parse(JSON.stringify(baseChartOptions)); // Deep clone
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
    // Dynamically adjust y-axis ticks based on max value
    options.scales.y.ticks.callback = function(value: number) {
        return value + (yLabel ? ` ${yLabel.split(' ')[0]}` : '');
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
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Performance Metrics
          </h2>
          <p className="mt-4 text-xl text-white/80">
            Comparing traditional systems vs UATM implementation
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {comparisonMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{metric.icon}</span>
                <h3 className="text-lg font-medium text-white/70">
                  {metric.label}
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-secondary/90">
                  <span>Traditional</span>
                  <span className="font-bold">{metric.before}</span>
                </div>
                
                <div className="flex justify-between items-center text-accent font-medium">
                  <span>With UATM</span>
                  <span className="font-bold">{metric.after}</span>
                </div>
                
                <div className="pt-2 mt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Improvement</span>
                    <span className="text-primary font-bold">↓ {metric.improvement}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Separated Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up">
            <div className="h-[350px]">
              <Bar options={getChartOptions('CO₂ Emissions (kg/delivery)', 'kg')} data={chartData.co2} />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="h-[350px]">
              <Bar options={getChartOptions('Delivery Cost (₹/km)', '₹')} data={chartData.cost} />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="h-[350px]">
              <Bar options={getChartOptions('Delivery Time (minutes)', 'min')} data={chartData.time} />
            </div>
          </div>
        </div>
        
        {/* Chart Legend */}
        <div className="flex justify-center gap-6 text-sm mb-16 animate-fade-in-up">
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
        </div>


        {/* Additional Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Environmental Impact</h3>
            <p className="text-white/70">
              89% reduction in carbon emissions through electric drones and optimized routes, surpassing industry standards by 85%.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Operational Efficiency</h3>
            <p className="text-white/70">
              76% faster delivery times with AI-driven route optimization, performing 61% better than industry average.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Cost Efficiency</h3>
            <p className="text-white/70">
              66% reduction in delivery costs, making UATM 49% more cost-effective than current industry standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison; 