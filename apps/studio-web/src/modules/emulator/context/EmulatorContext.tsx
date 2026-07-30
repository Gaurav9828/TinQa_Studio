import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface EmulatorContextType {
    width: number;
    height: number;
    ledSize: number;
    ledGap: number;
    setDimensions: (width: number, height: number) => void;
}

const EmulatorContext = createContext<EmulatorContextType | undefined>(undefined);

export const EmulatorProvider = ({ children }: { children: ReactNode }) => {
    const [width, setWidth] = useState(64);
    const [height, setHeight] = useState(32);
    const ledSize = 10;
    const ledGap = 4;

    const setDimensions = (w: number, h: number) => {
        setWidth(Math.max(1, Math.min(256, w)));
        setHeight(Math.max(1, Math.min(256, h)));
    };

    const value = useMemo(
        () => ({ width, height, ledSize, ledGap, setDimensions }),
        [width, height]
    );

    return <EmulatorContext.Provider value={value}>{children}</EmulatorContext.Provider>;
};

export const useEmulator = () => {
    const context = useContext(EmulatorContext);
    if (!context) {
        throw new Error('useEmulator must be used within an EmulatorProvider');
    }
    return context;
};