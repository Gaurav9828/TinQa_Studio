import { useEffect, useRef } from 'react';
import styles from './MatrixCanvas.module.scss';
import { FrameRenderer } from '../renderer/FrameRenderer';
import { useEmulatorStore } from '../store/emulatorStore';

const MatrixCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<FrameRenderer | null>(null);

    const width = useEmulatorStore((state) => state.width);
    const height = useEmulatorStore((state) => state.height);
    const ledSize = useEmulatorStore((state) => state.ledSize);
    const ledGap = useEmulatorStore((state) => state.ledGap);
    const setDimensions = useEmulatorStore((state) => state.setDimensions);
    const setStats = useEmulatorStore((state) => state.setStats);

    useEffect(() => {
        if (!canvasRef.current) return;

        // 1. Initialize Renderer
        const renderer = new FrameRenderer(canvasRef.current);
        renderer.updateConfig(width, height, ledSize, ledGap);
        rendererRef.current = renderer;

        // 2. Establish WebSocket connection
        const wsUrl = 'ws://localhost:21324/ws/led-stream';
        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';

        let frameCount = 0;
        let lastFpsCheck = performance.now();
        let latestPixelData: Uint8Array | null = null;
        let animFrameId: number;
        let isComponentMounted = true;

        ws.onopen = () => {
            if (!isComponentMounted) {
                ws.close();
                return;
            }
            setStats(0, true);
        };

        ws.onclose = () => {
            if (isComponentMounted) {
                setStats(0, false);
                rendererRef.current?.drawEmptyMatrix();
            }
        };

        ws.onerror = (err) => {
            if (isComponentMounted) {
                console.error('WebSocket Error on', wsUrl, err);
                setStats(0, false);
            }
        };

        // 3. Robust Frame Decoding (Handles ArrayBuffer & Blob fallbacks)
        ws.onmessage = async (event: MessageEvent) => {
            if (!isComponentMounted) return;

            let buffer: Uint8Array | null = null;

            if (event.data instanceof ArrayBuffer) {
                buffer = new Uint8Array(event.data);
            } else if (event.data instanceof Blob) {
                const arrayBuffer = await event.data.arrayBuffer();
                buffer = new Uint8Array(arrayBuffer);
            }

            if (buffer && buffer.length >= 4) {
                const frameWidth = buffer[0];
                const frameHeight = buffer[1];

                // Synchronize store dimensions if matrix changes resolution
                if (frameWidth !== width || frameHeight !== height) {
                    setDimensions(frameWidth, frameHeight);
                }

                latestPixelData = buffer;

                frameCount++;
                const now = performance.now();
                if (now - lastFpsCheck >= 1000) {
                    setStats(frameCount, true);
                    frameCount = 0;
                    lastFpsCheck = now;
                }
            }
        };

        // 4. Smooth 60FPS Canvas Render Loop
        const renderLoop = () => {
            if (rendererRef.current && latestPixelData) {
                rendererRef.current.renderFrame(latestPixelData);
            }
            animFrameId = requestAnimationFrame(renderLoop);
        };

        animFrameId = requestAnimationFrame(renderLoop);

        // 5. Cleanup Guard
        return () => {
            isComponentMounted = false;
            cancelAnimationFrame(animFrameId);

            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            } else if (ws.readyState === WebSocket.CONNECTING) {
                ws.onopen = () => ws.close();
            }

            rendererRef.current = null;
        };
    }, []);

    // Sync matrix layout when UI configuration sliders change
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.updateConfig(width, height, ledSize, ledGap);
        }
    }, [width, height, ledSize, ledGap]);

    return (
        <div className={styles.container}>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    );
};

export default MatrixCanvas;