import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../../AnimatedButton';
import AnimatedMetrics from '../../AnimatedMetrics';

const ImplementationDetails: React.FC = () => {
  const navigate = useNavigate();

  const performanceMetrics = [
    { value: '95%', label: 'Delivery Speed Improvement', color: 'text-primary', subtext: 'Faster than traditional methods' },
    { value: '70%', label: 'Cost Reduction', color: 'text-accent', subtext: 'Lower operational costs' },
    { value: '99.9%', label: 'Delivery Success Rate', color: 'text-secondary', subtext: 'Reliable operations' },
    { value: '85%', label: 'Operation Coverage', color: 'text-primary', subtext: 'Wide area coverage' }
  ];

  const partnerships = [
    {
      company: 'Garuda Aerospace',
      location: 'Chennai',
      potential: [
        'Delivery + surveillance drone fleet ideal for UATM integration',
        'Open to startup partnerships',
        'Partnered with Thales for UTM, but lacks AI-based UATM',
        'Pre-booked 7,000 drones at ₹4.5 lakh each – shows scale potential'
      ]
    },
    {
      company: 'Throttle Aerospace',
      location: 'Bangalore',
      potential: [
        'DGCA-approved for BVLOS',
        'No current UATM system',
        'Ideal for co-developing city-specific UATM testbeds',
        'Strong fit for Smart City integration'
      ]
    },
    {
      company: 'The ePlane Company',
      location: 'IIT Madras Incubated',
      potential: [
        'Developing compact eVTOLs',
        'Can integrate UATM for safe eVTOL routing',
        'No existing airspace management system',
        'Good partner for UATM-eVTOL simulation'
      ]
    }
  ];

  return (
    <section className="min-h-screen bg-black text-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Implementation Strategy
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Our comprehensive approach to implementing UATM solutions
          </p>
        </motion.div>

        {/* Possible Partnerships Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-primary">Possible Partnerships</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900/50">
                  <th className="p-4 text-left border-b border-white/10">Company</th>
                  <th className="p-4 text-left border-b border-white/10">Location</th>
                  <th className="p-4 text-left border-b border-white/10">Collaboration Potential</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.map((partner, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="p-4 border-b border-white/10 font-semibold">{partner.company}</td>
                    <td className="p-4 border-b border-white/10">{partner.location}</td>
                    <td className="p-4 border-b border-white/10">
                      <ul className="list-disc list-inside space-y-1">
                        {partner.potential.map((point, i) => (
                          <li key={i} className="text-gray-300">{point}</li>
                        ))}
                      </ul>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-primary">Phase 1: Initial Integration</h2>
            <ul className="space-y-4 text-gray-300">
              <li>• System setup and configuration</li>
              <li>• Initial testing and validation</li>
              <li>• Team training and onboarding</li>
              <li>• Basic route optimization</li>
              <li>• Initial safety protocols</li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-secondary">Phase 2: Full Deployment</h2>
            <ul className="space-y-4 text-gray-300">
              <li>• Complete system integration</li>
              <li>• Performance optimization</li>
              <li>• Continuous monitoring</li>
              <li>• Advanced route planning</li>
              <li>• Comprehensive safety measures</li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <AnimatedMetrics
            metrics={performanceMetrics}
            title="Key Performance Indicators"
            className="mt-8"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <AnimatedButton
            onClick={() => navigate(-1)}
            className="bg-white/10 hover:bg-white/20"
          >
            Back
          </AnimatedButton>
        </motion.div>
      </div>
    </section>
  );
};

export default ImplementationDetails; 