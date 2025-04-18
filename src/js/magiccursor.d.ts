declare module './magiccursor' {
  interface CursorElements {
    cursor: HTMLElement;
    circle: HTMLElement;
    text: HTMLElement;
  }

  export class MagicCursor {
    private elements: CursorElements;
    private mouseX: number;
    private mouseY: number;
    private cursorX: number;
    private cursorY: number;
    private requestId: number | null;

    constructor();
    init(): void;
    private onMouseMove(e: MouseEvent): void;
    private onMouseEnter(): void;
    private onMouseLeave(): void;
    private onSectionHover(e: MouseEvent): void;
    private animate(): void;
    private lerp(start: number, end: number, factor: number): number;
    destroy(): void;
  }
} 