export class FrameRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    private rows = 16;
    private columns = 32;
    private ledSize = 10;
    private ledGap = 4;

    private readonly panelBgColor = '#0a0a0c';
    private readonly inactiveLedColor = '#18181c';
    private readonly inactiveBorderColor = '#101014';

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Unable to initialize Canvas 2D.');
        }

        this.context = context;
    }

    public updateConfig(columns: number, rows: number, ledSize: number = 10, ledGap: number = 4): void {
        if (this.columns !== columns || this.rows !== rows || this.ledSize !== ledSize || this.ledGap !== ledGap) {
            this.columns = columns;
            this.rows = rows;
            this.ledSize = ledSize;
            this.ledGap = ledGap;

            this.resize();
            this.drawEmptyMatrix();
        }
    }

    private resize(): void {
        const width = this.columns * (this.ledSize + this.ledGap) + this.ledGap;
        const height = this.rows * (this.ledSize + this.ledGap) + this.ledGap;

        this.canvas.width = width;
        this.canvas.height = height;
    }

    public drawEmptyMatrix(): void {
        this.context.fillStyle = this.panelBgColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                this.drawLed(row, col, this.inactiveLedColor, false);
            }
        }
    }

    /**
     * Renders incoming WebSocket frame buffer from Python.
     * Header format: [Width, Height, Brightness, Reserved] + RGB payload
     */
    public renderFrame(buffer: Uint8Array): void {
        if (!buffer || buffer.length < 4) return;

        // Read header [width, height, brightness, reserved]
        const width = buffer[0];
        const height = buffer[1];
        const brightness = (buffer[2] ?? 100) / 100;

        // Extract pixel bytes starting from byte offset 4
        const pixels = buffer.subarray(4);

        this.updateConfig(width, height, this.ledSize, this.ledGap);
        this.drawEmptyMatrix();

        let pixelIdx = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const r = Math.round((pixels[pixelIdx] ?? 0) * brightness);
                const g = Math.round((pixels[pixelIdx + 1] ?? 0) * brightness);
                const b = Math.round((pixels[pixelIdx + 2] ?? 0) * brightness);
                pixelIdx += 3;

                if (r > 2 || g > 2 || b > 2) {
                    this.drawLed(row, col, `rgb(${r},${g},${b})`, true);
                }
            }
        }
    }

    private drawLed(row: number, column: number, color: string, isLit: boolean): void {
        const x = this.ledGap + column * (this.ledSize + this.ledGap);
        const y = this.ledGap + row * (this.ledSize + this.ledGap);
        const radius = this.ledSize / 2;
        const centerX = x + radius;
        const centerY = y + radius;

        this.context.save();

        if (isLit) {
            this.context.shadowColor = color;
            this.context.shadowBlur = 4;
        }

        this.context.beginPath();
        this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.fill();

        if (!isLit) {
            this.context.strokeStyle = this.inactiveBorderColor;
            this.context.lineWidth = 1;
            this.context.stroke();
        }

        this.context.restore();
    }
}