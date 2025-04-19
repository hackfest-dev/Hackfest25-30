import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MagicCursor from './js/magiccursor.ts';
import Hero from './components/Hero';
import ProblemStatement from './components/sections/ProblemStatement';
import Solutions from './components/sections/Solutions';
import PerformanceMatrix from './components/sections/PerformanceMatrix';
import BusinessAnalytics from './components/sections/BusinessAnalytics';
import Comparison from './components/sections/Comparison';
import LoadingAnimation from './components/LoadingAnimation';
import AnimatedPage from './components/AnimatedPage';
import FeatureOneDetails from './components/sections/FeatureOneDetails';
import FeatureTwoDetails from './components/sections/FeatureTwoDetails';
import FeatureThreeDetails from './components/sections/FeatureThreeDetails';
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
        <PerformanceMatrix />
      </AnimatedPage>
      
      <AnimatedPage showParticles={false} showParallax={true}>
        <BusinessAnalytics />
      </AnimatedPage>
      
      <AnimatedPage showParticles={false} showParallax={true}>
        <Comparison />
      </AnimatedPage>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const cursorRef = useRef<MagicCursor | null>(null);
  const cursorInitialized = useRef(false);

  useEffect(() => {
    let timer: number;

    const initCursor = () => {
      if (!cursorInitialized.current) {
        cursorRef.current = new MagicCursor();
        
        timer = window.setTimeout(() => {
          if (cursorRef.current) {
            try {
              cursorRef.current.init();
              cursorInitialized.current = true;
            } catch (error) {
              console.error('Error initializing cursor:', error);
            }
          }
          setIsLoading(false);
        }, 100);
      }
    };

    const initTimer = window.setTimeout(initCursor, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(initTimer);
      if (cursorRef.current) {
        cursorRef.current.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <div className="cb-cursor z-[100]">
          <div className="cb-cursor-circle"></div>
          <div className="cb-cursor-text"></div>
        </div>

        <Routes>
          <Route path="/" element={<MainContent />} />

          <Route path="/features/ai-traffic-prediction" element={
            <div className="relative z-50">
              <FeatureOneDetails />
            </div>
          } />
          <Route path="/features/dynamic-route-optimization" element={
            <div className="relative z-50">
              <FeatureTwoDetails />
            </div>
          } />
          <Route path="/features/real-time-monitoring" element={
            <div className="relative z-50">
              <FeatureThreeDetails />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 