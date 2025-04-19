interface CursorElements {
  cursor: HTMLElement;
  circle: HTMLElement;
  text: HTMLElement;
}

class MagicCursor {
  private elements: Partial<CursorElements>;
  private mouseX: number;
  private mouseY: number;
  private cursorX: number;
  private cursorY: number;
  private requestId: number | null;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseEnter: () => void;
  private boundMouseLeave: () => void;
  private boundSectionHover: (e: MouseEvent) => void;
  private boundAnimate: () => void;

  constructor() {
    this.elements = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.requestId = null;

    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseEnter = this.onMouseEnter.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    this.boundSectionHover = this.onSectionHover.bind(this);
    this.boundAnimate = this.animate.bind(this);
  }

  public init(): void {
    const cursor = document.querySelector('.cb-cursor');
    const circle = document.querySelector('.cb-cursor-circle');
    const text = document.querySelector('.cb-cursor-text');

    if (!cursor || !circle || !text) {
      console.error('Cursor elements not found');
      return;
    }

    this.elements = {
      cursor: cursor as HTMLElement,
      circle: circle as HTMLElement,
      text: text as HTMLElement
    };

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.cursorX = this.mouseX;
    this.cursorY = this.mouseY;

    this.addEventListeners();
    this.boundAnimate();
    
    if (this.elements.cursor) {
      this.elements.cursor.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
      this.elements.cursor.style.opacity = '1';
      this.elements.cursor.style.visibility = 'visible';
    }
  }

  private addEventListeners(): void {
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseenter', this.boundMouseEnter);
    document.addEventListener('mouseleave', this.boundMouseLeave);
    document.addEventListener('mouseover', this.boundSectionHover);
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

    this.requestId = requestAnimationFrame(this.boundAnimate);
  }

  private lerp(start: number, end: number, factor: number): number {
    return (1 - factor) * start + factor * end;
  }

  public destroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseenter', this.boundMouseEnter);
    document.removeEventListener('mouseleave', this.boundMouseLeave);
    document.removeEventListener('mouseover', this.boundSectionHover);
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }
}

export default MagicCursor; 