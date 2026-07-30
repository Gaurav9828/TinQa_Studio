import { create } from 'zustand';
import type { ThemeOption } from '../services/EmulatorService';

interface EmulatorState {
    width: number;
    height: number;
    ledSize: number;
    ledGap: number;
    fps: number;
    isConnected: boolean;

    // Controls State
    isPowerOn: boolean;
    isPlaying: boolean;
    brightness: number;
    themes: ThemeOption[];
    selectedTheme: string; // Stores theme id
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
}

export const useEmulatorStore = create<EmulatorState>((set) => ({
    width: 64,
    height: 32,
    ledSize: 10,
    ledGap: 4,
    fps: 0,
    isConnected: false,

    isPowerOn: true,
    isPlaying: true,
    brightness: 100,
    themes: [],
    selectedTheme: '',
    currentColor: '#FF0000',

    setDimensions: (width, height) =>
        set({
            width: Math.max(1, Math.min(256, width)),
            height: Math.max(1, Math.min(256, height)),
        }),
    setStats: (fps, isConnected) => set({ fps, isConnected }),
    setPower: (isPowerOn) => set({ isPowerOn }),
    setPlaying: (isPlaying) => set({ isPlaying }),
    setBrightness: (brightness) => set({ brightness }),
    setThemes: (themes) => set({ themes }),
    setSelectedTheme: (selectedTheme) => set({ selectedTheme }),
    setCurrentColor: (currentColor) => set({ currentColor }),
}));