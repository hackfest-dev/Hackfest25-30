import React, { useEffect, useRef } from 'react';
import Hero from './components/Hero';
import ProblemStatement from './components/sections/ProblemStatement';
import Solutions from './components/sections/Solutions';
import PerformanceMatrix from './components/sections/PerformanceMatrix';
import BusinessAnalytics from './components/sections/BusinessAnalytics';
import Comparison from './components/sections/Comparison';
import './styles/cursor.css';

class MagicCursor {
  private elements: {
    cursor: HTMLElement | null;
    circle: HTMLElement | null;
    text: HTMLElement | null;
  };
  private mouseX: number;
  private mouseY: number;
  private cursorX: number;
  private cursorY: number;
  private requestId: number | null;

  constructor() {
    this.elements = {
      cursor: document.querySelector('.cb-cursor'),
      circle: document.querySelector('.cb-cursor-circle'),
      text: document.querySelector('.cb-cursor-text')
    };
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.cursorX = this.mouseX;
    this.cursorY = this.mouseY;
    this.requestId = null;
  }

  public init(): void {
    if (!this.elements.cursor || !this.elements.circle || !this.elements.text) {
      console.error('Cursor elements not found');
      return;
    }

    this.addEventListeners();
    this.animate();
    
    // Set initial position
    this.elements.cursor.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
    this.elements.cursor.style.opacity = '1';
    this.elements.cursor.style.visibility = 'visible';
  }

  private addEventListeners(): void {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    document.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    document.addEventListener('mouseover', this.onSectionHover.bind(this));
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private onMouseEnter(): void {
    if (this.elements.cursor) {
      this.elements.cursor.style.opacity = '1';
    }
  }

  private onMouseLeave(): void {
    if (this.elements.cursor) {
      this.elements.cursor.style.opacity = '0';
    }
  }

  private onSectionHover(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!this.elements.cursor || !this.elements.text) return;

    if (target.matches('a, button, .hover-effect')) {
      this.elements.cursor.classList.add('hover');
      this.elements.text.textContent = target.getAttribute('data-cursor-text') || '';
    } else {
      this.elements.cursor.classList.remove('hover');
      this.elements.text.textContent = '';
    }
  }

  private animate(): void {
    this.cursorX = this.lerp(this.cursorX, this.mouseX, 0.15);
    this.cursorY = this.lerp(this.cursorY, this.mouseY, 0.15);

    if (this.elements.cursor) {
      this.elements.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
    }

    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  private lerp(start: number, end: number, factor: number): number {
    return (1 - factor) * start + factor * end;
  }

  public destroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
    document.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
    document.removeEventListener('mouseover', this.onSectionHover.bind(this));
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }
}

function App() {
  const cursorRef = useRef<MagicCursor | null>(null);

  useEffect(() => {
    // Initialize custom cursor
    cursorRef.current = new MagicCursor();
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (cursorRef.current) {
        cursorRef.current.init();
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (cursorRef.current) {
        cursorRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Custom Cursor Elements */}
      <div className="cb-cursor">
        <div className="cb-cursor-circle"></div>
        <div className="cb-cursor-text"></div>
      </div>

      {/* Main Content */}
      <Hero />
      <ProblemStatement />
      <Solutions />
      <PerformanceMatrix />
      <BusinessAnalytics />
      <Comparison />
    </div>
  );
}

export default App; 