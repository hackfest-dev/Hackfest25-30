import React from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '../AnimatedSection';
import AnimatedText from '../AnimatedText';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '../AnimatedButton';

interface BusinessPartner {
  category: string;
  description: string;
  icon: string;
  benefits: string[];
}

const BusinessAnalytics: React.FC = () => {
  const partners: BusinessPartner[] = [
    {
      category: 'Drone Manufacturers',
      description: 'Partner with leading drone manufacturers to integrate UATM systems directly into their products.',
      icon: '🛠️',
      benefits: [
        'Direct system integration',
        'Enhanced safety features',
        'Competitive advantage',
        'Regulatory compliance'
      ]
    },
    {
      category: 'Logistics Providers',
      description: 'Enable efficient and safe drone delivery operations for logistics companies.',
      icon: '🚚',
      benefits: [
        'Optimized routes',
        'Real-time tracking',
        'Cost reduction',
        'Faster deliveries'
      ]
    },
    {
      category: 'Air Traffic Service Operators',
      description: 'Provide comprehensive air traffic management solutions for existing operators.',
      icon: '🗼',
      benefits: [
        'Enhanced monitoring',
        'Automated coordination',
        'Risk prevention',
        'Data analytics'
      ]
    },
    {
      category: 'Weather Analysts',
      description: 'Integrate weather data for improved flight planning and risk assessment.',
      icon: '🌤️',
      benefits: [
        'Real-time updates',
        'Predictive analytics',
        'Route optimization',
        'Safety improvements'
      ]
    }
  ];

  const navigate = useNavigate();

  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-24" delay={0.1}>
          <div className="flex flex-col items-center justify-center text-center">
            <AnimatedText
              text="Business Analytics (B2B)"
              className="text-4xl md:text-5xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary"
              delay={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="mt-4 text-xl text-white/80"
            >
              Strategic partnerships for comprehensive urban air mobility solutions
            </motion.p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <motion.div 
            className="flex justify-center mb-24"
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div 
              className="w-full max-w-5xl bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10 shadow-lg shadow-primary/10"
              whileHover={{ boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)" }}
              transition={{ duration: 0.2 }}
            >
              <motion.table
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-full border-collapse border border-gray-700"
              >
                <thead>
                  <motion.tr 
                    className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <motion.th 
                      className="p-4 text-left text-primary font-bold border-r border-gray-700"
                      whileHover={{ color: "#60A5FA" }}
                      transition={{ duration: 0.2 }}
                    >
                      Buyer Type
                    </motion.th>
                    <motion.th 
                      className="p-4 text-left text-accent font-bold border-r border-gray-700"
                      whileHover={{ color: "#F472B6" }}
                      transition={{ duration: 0.2 }}
                    >
                      Why They Care
                    </motion.th>
                    <motion.th 
                      className="p-4 text-left text-secondary font-bold"
                      whileHover={{ color: "#34D399" }}
                      transition={{ duration: 0.2 }}
                    >
                      What UATM Offers Them
                    </motion.th>
                  </motion.tr>
                </thead>
                <tbody>
                  {[
                    {
                      type: "Drone Manufacturers",
                      care: "Need certified airspace systems",
                      offer: "Pre-integrated UATM API for compliance"
                    },
                    {
                      type: "Logistics Companies",
                      care: "Want faster + cheaper deliveries",
                      offer: "Air route optimization & real-time rerouting"
                    },
                    {
                      type: "Emergency Services",
                      care: "Need safe air corridors during crises",
                      offer: "Secure drone police + weather adaptation"
                    },
                    {
                      type: "Weather Analysts",
                      care: "Need integration into UATM networks",
                      offer: "Access to drone sensor & airspace data"
                    },
                    {
                      type: "Smart City Planners",
                      care: "Planning future airspace infrastructure",
                      offer: "AI-optimized, scalable traffic system"
                    }
                  ].map((row, index) => (
                    <motion.tr
                      key={row.type}
                      className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    >
                      <motion.td 
                        className="p-4 font-medium text-primary/90 border-r border-gray-700"
                        whileHover={{ color: "#60A5FA" }}
                        transition={{ duration: 0.2 }}
                      >
                        {row.type}
                      </motion.td>
                      <motion.td 
                        className="p-4 text-white/80 border-r border-gray-700"
                        whileHover={{ color: "#F472B6" }}
                        transition={{ duration: 0.2 }}
                      >
                        {row.care}
                      </motion.td>
                      <motion.td 
                        className="p-4 text-white/80"
                        whileHover={{ color: "#34D399" }}
                        transition={{ duration: 0.2 }}
                      >
                        {row.offer}
                      </motion.td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </motion.div>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.category}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: 0.2 + index * 0.05, 
                  duration: 0.4,
                  scale: { type: "spring", stiffness: 200 }
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                  borderColor: "rgba(59, 130, 246, 0.5)"
                }}
                className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-200"
              >
                <div className="flex items-start space-x-6">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className="text-5xl"
                  >
                    {partner.icon}
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3
                      whileHover={{ color: "#3B82F6", scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="text-2xl font-bold text-white mb-3"
                    >
                      {partner.category}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="text-white/70 mb-6 leading-relaxed"
                    >
                      {partner.description}
                    </motion.p>
                    
                    <div className="space-y-4">
                      {partner.benefits.map((benefit, benefitIndex) => (
                        <motion.div
                          key={benefit}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ 
                            delay: 0.1 + index * 0.05 + benefitIndex * 0.05,
                            type: "spring",
                            stiffness: 200
                          }}
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-3 text-white/80 group-hover:text-white transition-colors duration-200"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-200"
                          >
                            <span className="text-primary text-sm">✓</span>
                          </motion.div>
                          <span className="font-medium">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center mb-24"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-colors"
            >
              Partner with Us
            </motion.button>
          </motion.div>
        </AnimatedSection>

        {/* Future Scope Section */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col items-center justify-center text-center mb-24">
            <AnimatedText
              text="Future Scope & Innovation"
              className="text-4xl md:text-5xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary"
              delay={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="mt-4 text-xl text-white/80"
            >
              Pioneering the future of urban air mobility with cutting-edge innovations
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {/* Air Taxis */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: 0.1,
                duration: 0.3,
                scale: { type: "spring", stiffness: 200 }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                🚕
              </motion.div>
              <motion.h3
                whileHover={{ color: "#3B82F6" }}
                className="text-2xl font-bold text-white mb-4"
              >
                Air Taxis
              </motion.h3>
              <motion.ul className="text-white/80 space-y-3 text-left">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Electric Vertical Takeoff & Landing (eVTOL) vehicles</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Inter-city rapid transport</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>AI-powered route optimization</span>
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Recharging Ports */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: 0.2,
                duration: 0.3,
                scale: { type: "spring", stiffness: 200 }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <motion.h3
                whileHover={{ color: "#3B82F6" }}
                className="text-2xl font-bold text-white mb-4"
              >
                Recharging Ports
              </motion.h3>
              <motion.ul className="text-white/80 space-y-3 text-left">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Smart charging stations network</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Automated battery swapping</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Solar-powered charging solutions</span>
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Air Purification */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: 0.3,
                duration: 0.3,
                scale: { type: "spring", stiffness: 200 }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                🌬️
              </motion.div>
              <motion.h3
                whileHover={{ color: "#3B82F6" }}
                className="text-2xl font-bold text-white mb-4"
              >
                Air Purification
              </motion.h3>
              <motion.ul className="text-white/80 space-y-3 text-left">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Mobile air quality monitoring</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Drone-mounted purification systems</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span>Real-time pollution mapping</span>
                </motion.li>
              </motion.ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-center text-white/60 max-w-2xl mx-auto mb-24"
          >
            <p>Our future scope initiatives are designed to revolutionize urban air mobility while promoting sustainability and environmental consciousness.</p>
          </motion.div>
        </AnimatedSection>

        {/* Implementation Section */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col items-center justify-center text-center mb-24">
            <AnimatedText
              text="Implementation Strategy"
              className="text-4xl md:text-5xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary"
              delay={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="mt-4 text-xl text-white/80"
            >
              Strategic partnerships with drone manufacturers for comprehensive integration
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto mb-24">
            {/* Phase 1: Drone Company Partnerships */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 cursor-pointer"
              onClick={() => navigate('/implementation')}
            >
              <div className="flex items-center mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl mr-4"
                >
                  🚀
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Drone Company Partnerships</h3>
              </div>
              <motion.ul className="space-y-4 text-white/80">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-primary text-xl">•</span>
                  <span>Collaborate with leading drone manufacturers for system integration</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-primary text-xl">•</span>
                  <span>Implement safety protocols and certification processes</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-primary text-xl">•</span>
                  <span>Establish testing and validation frameworks</span>
                </motion.li>
              </motion.ul>
              <div className="mt-4 flex justify-end">
                <AnimatedButton
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/implementation');
                  }}
                >
                  Learn More →
                </AnimatedButton>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-center text-white/60 max-w-2xl mx-auto mb-24"
          >
            <p>Our implementation strategy focuses on building strong partnerships with drone manufacturers to ensure seamless integration and safety standards across all operations.</p>
          </motion.div>
        </AnimatedSection>

        {/* Monetization Section */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col items-center justify-center text-center mb-24">
            <AnimatedText
              text="Monetization Strategy"
              className="text-4xl md:text-5xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-6"
              delay={0.1}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="mt-4 text-xl text-white/80"
            >
              Multiple revenue streams to ensure sustainable growth and profitability
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-24">
            {/* Licensing / SaaS Model */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-10 border border-white/10"
            >
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl mr-6"
                >
                  💳
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Licensing / SaaS</h3>
              </div>
              <motion.ul className="space-y-6 text-white/80">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Starter – ₹20,000/month</span>
                  <span className="text-sm text-white/60">Basic geofencing, airspace compliance tools</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Pro – ₹50,000/month</span>
                  <span className="text-sm text-white/60">Live dashboards, AI-based path optimization, rerouting logic</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Enterprise – ₹1,00,000+/month</span>
                  <span className="text-sm text-white/60">Custom APIs, predictive analytics, citywide Smart Zone overlays, 24/7 support</span>
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Revenue Share Model */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-10 border border-white/10"
            >
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl mr-6"
                >
                  🤝
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Revenue Share</h3>
              </div>
              <motion.ul className="space-y-6 text-white/80">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">₹2–₹10 per delivery</span>
                  <span className="text-sm text-white/60">Earn per delivery routed through your system</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Logistics Integration</span>
                  <span className="text-sm text-white/60">Ideal for Swiggy, Zomato, Dunzo, and other logistics partners</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Volume-based Revenue</span>
                  <span className="text-sm text-white/60">Direct revenue from delivery volume</span>
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Data & Insights Sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-10 border border-white/10"
            >
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl mr-6"
                >
                  📊
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Data & Insights</h3>
              </div>
              <motion.ul className="space-y-6 text-white/80">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Advanced Analytics</span>
                  <span className="text-sm text-white/60">Drone density and traffic heatmaps</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Real-time Monitoring</span>
                  <span className="text-sm text-white/60">Zone congestion alerts and analytics</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col space-y-2"
                >
                  <span className="text-primary font-semibold">Target Markets</span>
                  <span className="text-sm text-white/60">Smart Cities, Urban ESG bodies, and transport regulators</span>
                </motion.li>
              </motion.ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-center text-white/60 max-w-2xl mx-auto mb-24"
          >
            <p>Our diversified monetization strategy ensures sustainable revenue streams while providing value to our partners and stakeholders.</p>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default BusinessAnalytics; 