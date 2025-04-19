import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Cursor from './components/Cursor';
import Hero from './components/Hero';
import ProblemStatement from './components/sections/ProblemStatement';
import Solutions from './components/sections/Solutions';
import BusinessAnalytics from './components/sections/BusinessAnalytics';
import Comparison from './components/sections/Comparison';
import LoadingAnimation from './components/LoadingAnimation';
import AnimatedPage from './components/AnimatedPage';
import FeatureOneDetails from './components/sections/FeatureOneDetails';
import FeatureTwoDetails from './components/sections/FeatureTwoDetails';
import FeatureThreeDetails from './components/sections/FeatureThreeDetails';
import ImplementationDetails from './components/sections/implementation/ImplementationDetails';
import './styles/cursor.css';

// Wrap the main content in a component to use useLocation
const MainContent = () => {
  const location = useLocation();
  const solutionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state && (location.state as any).scrollToSolutions) {
      solutionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="relative z-50">
      <AnimatedPage showParticles={true} showParallax={true}>
        <Hero />
      </AnimatedPage>
      
      <AnimatedPage showParticles={false} showParallax={true}>
        <ProblemStatement />
      </AnimatedPage>
      
      <div ref={solutionsRef}>
        <AnimatedPage showParticles={false} showParallax={true}>
          <Solutions />
        </AnimatedPage>
      </div>
      
      <AnimatedPage showParticles={false} showParallax={true}>
        <BusinessAnalytics />
      </AnimatedPage>
      
      <AnimatedPage showParticles={false} showParallax={true}>
        <Comparison />
      </AnimatedPage>
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only show loading animation on initial page load
    if (window.location.pathname === '/') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <Router>
      <div className="relative">
        <Cursor />
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/features/ai-traffic-prediction" element={<FeatureOneDetails />} />
          <Route path="/features/dynamic-route-optimization" element={<FeatureTwoDetails />} />
          <Route path="/features/real-time-monitoring" element={<FeatureThreeDetails />} />
          <Route path="/implementation" element={
            <div className="relative z-50">
              <AnimatedPage showParticles={false} showParallax={true}>
                <ImplementationDetails />
              </AnimatedPage>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 