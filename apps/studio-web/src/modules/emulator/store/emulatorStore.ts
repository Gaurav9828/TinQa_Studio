// store/emulatorStore.ts

import { create } from 'zustand';
import type { ThemeOption } from '../services/EmulatorService';

export type DeviceStatus = 'Connected' | 'Paused' | 'Stopped' | 'Disconnected';

interface EmulatorState {
    width: number;
    height: number;
    ledSize: number;
    ledGap: number;
    fps: number;
    isConnected: boolean;
    deviceStatus: DeviceStatus;

    // Internal frame timing state
    _frameCount: number;
    _lastFpsCheck: number;

    // Controls State
    isPowerOn: boolean;
    isPlaying: boolean;
    brightness: number;
    themes: ThemeOption[];
    selectedTheme: string;
    currentColor: string;

    // Actions
    setDimensions: (width: number, height: number) => void;
    setStats: (fps: number, isConnected: boolean) => void;
    setPower: (power: boolean) => void;
    setPlaying: (playing: boolean) => void;
    setBrightness: (val: number) => void;
    setThemes: (themes: ThemeOption[]) => void;
    setSelectedTheme: (themeId: string) => void;
    setCurrentColor: (color: string) => void;

    // Real-time WebSocket Ingestion Actions
    registerFramePacket: () => void;
    setServerStatus: (status: string, fps?: number) => void;
    setDeviceStatus: (status: DeviceStatus, fps?: number) => void;
}

export const useEmulatorStore = create<EmulatorState>((set, get) => ({
    width: 64,
    height: 32,
    ledSize: 10,
    ledGap: 4,
    fps: 0,
    isConnected: false,
    deviceStatus: 'Disconnected',

    _frameCount: 0,
    _lastFpsCheck: Date.now(),

    isPowerOn: true,
    isPlaying: true,
    brightness: 100,
    themes: [],
    selectedTheme: '',
    currentColor: '#FF0000',

    setDimensions: (width, height) =>
        set({
            width: Math.max(1, Math.min(1600, width)),
            height: Math.max(1, Math.min(1600, height)),
        }),

    setStats: (fps, isConnected) =>
        set((state) => ({
            fps: state.deviceStatus === 'Connected' ? fps : 0,
            isConnected,
        })),

    setPower: (isPowerOn) => set({ isPowerOn }),
    setPlaying: (isPlaying) => set({ isPlaying }),
    setBrightness: (brightness) => set({ brightness }),
    setThemes: (themes) => set({ themes }),
    setSelectedTheme: (selectedTheme) => set({ selectedTheme }),
    setCurrentColor: (currentColor) => set({ currentColor }),

    // 🚀 CALL THIS ON EVERY WEBSOCKET FRAME RECEIVED
    registerFramePacket: () => {
        const now = Date.now();
        const { _frameCount, _lastFpsCheck, deviceStatus } = get();
        const nextCount = _frameCount + 1;
        const elapsed = now - _lastFpsCheck;

        // If packets are actively flowing, force status to 'Connected'
        const updates: Partial<EmulatorState> = {
            isConnected: true,
            _frameCount: nextCount,
        };

        if (deviceStatus !== 'Connected') {
            updates.deviceStatus = 'Connected';
            updates.isPowerOn = true;
            updates.isPlaying = true;
        }

        // Calculate actual incoming FPS every 1000ms
        if (elapsed >= 1000) {
            updates.fps = Math.round((nextCount * 1000) / elapsed);
            updates._frameCount = 0;
            updates._lastFpsCheck = now;
        }

        set(updates);
    },

    setDeviceStatus: (status, targetFps = 30) =>
        set({
            deviceStatus: status,
            isPowerOn: status !== 'Stopped',
            isPlaying: status === 'Connected',
            fps: status === 'Connected' ? targetFps : 0,
            _frameCount: 0,
        }),

    setServerStatus: (status, fps = 30) => {
        const validStatus = (status as DeviceStatus) || 'Disconnected';
        set({
            deviceStatus: validStatus,
            isPowerOn: validStatus !== 'Stopped',
            isPlaying: validStatus === 'Connected',
            fps: validStatus === 'Connected' ? fps : 0,
        });
    },
}));