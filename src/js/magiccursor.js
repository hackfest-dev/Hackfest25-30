class MagicCursor {
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

    init() {
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

    addEventListeners() {
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        document.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        document.addEventListener('mouseover', this.onSectionHover.bind(this));
    }

    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    onMouseEnter() {
        this.elements.cursor.style.opacity = '1';
    }

    onMouseLeave() {
        this.elements.cursor.style.opacity = '0';
    }

    onSectionHover(e) {
        const target = e.target;
        if (target.matches('a, button, .hover-effect')) {
            this.elements.cursor.classList.add('hover');
            this.elements.text.textContent = target.getAttribute('data-cursor-text') || '';
        } else {
            this.elements.cursor.classList.remove('hover');
            this.elements.text.textContent = '';
        }
    }

    animate() {
        this.cursorX = this.lerp(this.cursorX, this.mouseX, 0.15);
        this.cursorY = this.lerp(this.cursorY, this.mouseY, 0.15);

        this.elements.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;

        this.requestId = requestAnimationFrame(this.animate.bind(this));
    }

    lerp(start, end, factor) {
        return (1 - factor) * start + factor * end;
    }

    destroy() {
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
        document.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
        document.removeEventListener('mouseover', this.onSectionHover.bind(this));
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    }
}

// Export the class
export default MagicCursor;
